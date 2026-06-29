import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from '../generated/prisma/client';
import { init as cuidInit } from '@paralleldrive/cuid2';

import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/strategies/jwt.strategy';
import { JwtConfig, TokenConfig } from '../common/types/config.types';
import { JWT_CONFIG_KEY } from '../config/jwt.config';
import { TOKEN_CONFIG_KEY } from '../config/token.config';
import {
  REVOKE_REASON,
  DUMMY_ARGON2_HASH,
} from '../common/constants/auth.constants';
import {
  generateOpaqueToken,
  hashWithArgon2,
  verifyArgon2,
  sha256Hash,
} from '../common/helpers/token.helper';

const createId = cuidInit({ length: 24 });

export interface RefreshTokenMetadata {
  family: string;
  deviceId?: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  private readonly jwtConfig: JwtConfig;
  private readonly tokenConfig: TokenConfig;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.jwtConfig = this.configService.getOrThrow<JwtConfig>(JWT_CONFIG_KEY);
    this.tokenConfig =
      this.configService.getOrThrow<TokenConfig>(TOKEN_CONFIG_KEY);
  }

  // ─────────────────────────────────────────────────────────────────
  // COMPUTED EXPIRY VALUES
  // ─────────────────────────────────────────────────────────────────

  get refreshTokenExpiresInMs(): number {
    return this.tokenConfig.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000;
  }

  get resetTokenExpiresInMs(): number {
    return this.tokenConfig.resetTokenExpiresInMinutes * 60 * 1000;
  }

  get verificationTokenExpiresInMs(): number {
    return this.tokenConfig.verificationTokenExpiresInMinutes * 60 * 1000;
  }

  getResetTokenExpiresInMinutes(): number {
    return this.tokenConfig.resetTokenExpiresInMinutes;
  }

  getVerificationTokenExpiresInMinutes(): number {
    return this.tokenConfig.verificationTokenExpiresInMinutes;
  }

  // ─────────────────────────────────────────────────────────────────
  // PASSWORD
  // ─────────────────────────────────────────────────────────────────

  async hashPassword(password: string): Promise<string> {
    return hashWithArgon2(password);
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    return verifyArgon2(hash, plain);
  }

  /**
   * Run a no-op Argon2 verify against a dummy hash.
   * Called when a user is not found to equalize response time and
   * prevent timing-based email enumeration attacks.
   */
  async dummyVerify(): Promise<void> {
    await verifyArgon2(DUMMY_ARGON2_HASH, 'dummy-plaintext-sathiguide').catch(
      () => {
        // Intentionally swallow — result is never used
      },
    );
  }

  // ─────────────────────────────────────────────────────────────────
  // ACCESS TOKEN
  // ─────────────────────────────────────────────────────────────────

  generateAccessToken(payload: {
    sub: string;
    email: string;
    role: Role;
  }): string {
    const jwtPayload: JwtPayload = {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: createId(),
    };

    try {
      return this.jwtService.sign(jwtPayload, {
        expiresIn: this.jwtConfig.accessExpiresIn,
      });
    } catch (error) {
      this.logger.error(
        'Failed to sign access token',
        error instanceof Error ? error.stack : String(error),
      );
      throw new Error('Could not generate access token. Please try again.');
    }
  }

  // ─────────────────────────────────────────────────────────────────
  // REFRESH TOKEN CRUD
  // ─────────────────────────────────────────────────────────────────

  async createRefreshToken(
    userId: string,
    metadata: RefreshTokenMetadata,
  ): Promise<string> {
    const rawToken = generateOpaqueToken();
    const tokenHash = sha256Hash(rawToken);
    const expiresAt = new Date(Date.now() + this.refreshTokenExpiresInMs);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        family: metadata.family,
        deviceId: metadata.deviceId ?? null,
        deviceName: metadata.deviceName ?? null,
        ipAddress: metadata.ipAddress ?? null,
        userAgent: metadata.userAgent ?? null,
        expiresAt,
        lastUsedAt: new Date(),
      },
    });

    return rawToken;
  }

  async rotateRefreshToken(
    rawToken: string,
    metadata: { ipAddress?: string; userAgent?: string },
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = sha256Hash(rawToken);

    // Atomically mark as revoked — only one concurrent request can succeed
    const revoked = await this.prisma.refreshToken.updateMany({
      where: { tokenHash, isRevoked: false },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: REVOKE_REASON.ROTATED,
      },
    });

    // Whether update succeeded or not, we need the token record
    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            isBanned: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!existingToken) {
      this.logger.warn(
        'Refresh token not found during rotation — possible token theft.',
      );
      throw new UnauthorizedException(
        'Invalid refresh token. Please log in again.',
      );
    }

    // revoked.count === 0 means WE did not revoke it — someone else did, or it was already revoked
    if (revoked.count === 0) {
      // Check expiry first to avoid false theft alarms
      if (existingToken.expiresAt < new Date()) {
        throw new UnauthorizedException(
          'Refresh token has expired. Please log in again.',
        );
      }

      // Was previously rotated or compromised — treat as reuse/theft
      this.logger.warn(
        `SECURITY ALERT: Token reuse detected. ` +
          `userId=${existingToken.userId} family=${existingToken.family}. ` +
          `Invalidating entire token family.`,
      );

      await this.revokeTokenFamily(
        existingToken.family,
        REVOKE_REASON.FAMILY_COMPROMISED,
      );

      throw new UnauthorizedException(
        'Token reuse detected. All sessions have been invalidated for your security. ' +
          'Please log in again.',
      );
    }

    // Check expiry on the token WE just atomically revoked
    if (existingToken.expiresAt < new Date()) {
      // Already marked ROTATED above, fix the reason
      await this.prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: { revokedReason: REVOKE_REASON.EXPIRED },
      });

      throw new UnauthorizedException(
        'Refresh token has expired. Please log in again.',
      );
    }

    const { user } = existingToken;

    if (!user.isActive || user.isBanned || user.deletedAt !== null) {
      throw new UnauthorizedException(
        'Account access has been restricted. Please contact support.',
      );
    }

    const newAccessToken = this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const newRawRefreshToken = generateOpaqueToken();
    const newRefreshTokenHash = sha256Hash(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + this.refreshTokenExpiresInMs);

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: newRefreshTokenHash,
        family: existingToken.family,
        deviceId: existingToken.deviceId,
        deviceName: existingToken.deviceName,
        ipAddress: metadata.ipAddress ?? existingToken.ipAddress,
        userAgent: metadata.userAgent ?? existingToken.userAgent,
        expiresAt: newExpiresAt,
        lastUsedAt: new Date(),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRawRefreshToken };
  }

  async revokeRefreshToken(
    rawToken: string,
    reason: string,
  ): Promise<{ deviceId: string | null } | null> {
    const tokenHash = sha256Hash(rawToken);

    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        isRevoked: true,
        deviceId: true,
      },
    });

    if (!token || token.isRevoked) {
      return null;
    }

    await this.prisma.refreshToken.update({
      where: { id: token.id },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });

    return { deviceId: token.deviceId };
  }

  async revokeAllUserRefreshTokens(
    userId: string,
    reason: string,
  ): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  async revokeAllUserRefreshTokensExcept(
    userId: string,
    currentRawToken: string,
    reason: string,
  ): Promise<void> {
    const currentTokenHash = sha256Hash(currentRawToken);

    const currentToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: currentTokenHash },
      select: { id: true },
    });

    if (!currentToken) {
      this.logger.warn(
        `revokeAllUserRefreshTokensExcept: current token not found for userId=${userId}. ` +
          `Aborting to avoid revoking all sessions unexpectedly.`,
      );
      throw new UnauthorizedException(
        'Current session token is invalid. Please log in again.',
      );
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
        id: { not: currentToken.id },
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // VERIFICATION & RESET TOKENS
  // ─────────────────────────────────────────────────────────────────

  async createEmailVerificationToken(
    userId: string,
    targetEmail: string,
  ): Promise<string> {
    const rawToken = generateOpaqueToken();
    const tokenHash = sha256Hash(rawToken);
    const expiresAt = new Date(Date.now() + this.verificationTokenExpiresInMs);

    await this.prisma.emailVerificationToken.create({
      data: { userId, tokenHash, targetEmail, expiresAt },
    });

    return rawToken;
  }

  async createPasswordResetToken(
    userId: string,
    ipAddress?: string,
  ): Promise<string> {
    const rawToken = generateOpaqueToken();
    const tokenHash = sha256Hash(rawToken);
    const expiresAt = new Date(Date.now() + this.resetTokenExpiresInMs);

    await this.prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        requestedFromIp: ipAddress ?? null,
      },
    });

    return rawToken;
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────

  private async revokeTokenFamily(
    family: string,
    reason: string,
  ): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { family, isRevoked: false },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }
}
