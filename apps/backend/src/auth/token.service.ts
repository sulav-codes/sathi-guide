import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from './strategies/jwt.strategy';
import { Role } from '../generated/prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { init as cuidInit } from '@paralleldrive/cuid2';

const createId = cuidInit({ length: 24 });

// Argon2id configuration — production-grade parameters
const ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
};

// Pre-computed dummy hash for constant-time comparison (prevents timing attacks)
// This is a hash of the string "dummy-password-for-timing-attack-prevention"
const DUMMY_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$c2F0aGlndWlkZHVtbXlzYWx0$dummyhashvaluethatnevermatchesanyrealinput';

export interface GeneratedTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenMetadata {
  deviceId?: string;
  deviceName?: string;
  ipAddress?: string;
  userAgent?: string;
  family: string;
}

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  private readonly accessTokenExpiresIn: JwtSignOptions['expiresIn'];
  private readonly refreshTokenExpiresInMs: number;
  private readonly resetTokenExpiresInMs: number;
  private readonly verificationTokenExpiresInMs: number;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.accessTokenExpiresIn = this.configService.get<
      JwtSignOptions['expiresIn']
    >('JWT_ACCESS_EXPIRES_IN', '15m');
    this.refreshTokenExpiresInMs =
      this.configService.get<number>('REFRESH_TOKEN_EXPIRES_IN_DAYS', 7) *
      24 *
      60 *
      60 *
      1000;
    this.resetTokenExpiresInMs =
      this.configService.get<number>('RESET_TOKEN_EXPIRES_IN_MINUTES', 60) *
      60 *
      1000;
    this.verificationTokenExpiresInMs =
      this.configService.get<number>(
        'VERIFICATION_TOKEN_EXPIRES_IN_MINUTES',
        1440,
      ) *
      60 *
      1000;
  }

  // PASSWORD HASHING

  async hashPassword(password: string): Promise<string> {
    return argon2.hash(password, ARGON2_OPTIONS);
  }

  async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain, ARGON2_OPTIONS);
    } catch (error) {
      this.logger.error('Password verification error', error);
      return false;
    }
  }

  async hashToken(rawToken: string): Promise<string> {
    return argon2.hash(rawToken, ARGON2_OPTIONS);
  }

  async verifyToken(hash: string, rawToken: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, rawToken, ARGON2_OPTIONS);
    } catch {
      return false;
    }
  }

  // Constant-time dummy verification — prevents timing attacks when a user is not found (we still run the verification against a dummy hash).
  async dummyVerify(): Promise<void> {
    try {
      await argon2.verify(DUMMY_HASH, 'dummy-plaintext-that-never-matches');
    } catch {
      // Always ignore — this is purely for timing attack prevention
    }
  }

  // TOKEN GENERATION
  generateOpaqueToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

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

    return this.jwtService.sign(jwtPayload, {
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // REFRESH TOKEN OPERATIONS
  // ─────────────────────────────────────────────────────────────────

  async createRefreshToken(
    userId: string,
    metadata: RefreshTokenMetadata,
  ): Promise<string> {
    const rawToken = this.generateOpaqueToken();
    const tokenHash = await this.hashToken(rawToken);
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
    const tokenHash = this.sha256Hash(rawToken);

    const existingToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    // Token not found at all
    if (!existingToken) {
      this.logger.warn(
        `Refresh token not found during rotation. Possible token theft attempt.`,
      );
      throw new UnauthorizedException(
        'Invalid refresh token. Please log in again.',
      );
    }

    // SECURITY: Token reuse detected — entire family is compromised
    if (existingToken.isRevoked) {
      this.logger.warn(
        `SECURITY ALERT: Refresh token reuse detected for user ${existingToken.userId}, family ${existingToken.family}. Invalidating entire family.`,
      );

      await this.revokeTokenFamily(
        existingToken.family,
        'family_invalidated_token_reuse',
      );

      throw new UnauthorizedException(
        'Token reuse detected. All sessions have been invalidated for security. Please log in again.',
      );
    }

    // Token is expired
    if (existingToken.expiresAt < new Date()) {
      await this.prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'expired',
        },
      });

      throw new UnauthorizedException(
        'Refresh token has expired. Please log in again.',
      );
    }

    const user = existingToken.user;

    // Validate user is still in good standing
    if (!user.isActive || user.isBanned || user.deletedAt !== null) {
      throw new UnauthorizedException(
        'Account access has been restricted. Please contact support.',
      );
    }

    // Generate new tokens within the same family (rotation)
    const newRawRefreshToken = this.generateOpaqueToken();
    const newRefreshTokenHash = this.sha256Hash(newRawRefreshToken);
    const newExpiresAt = new Date(Date.now() + this.refreshTokenExpiresInMs);

    const newAccessToken = this.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // Atomic: revoke old, create new
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: existingToken.id },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'rotated',
        },
      }),
      this.prisma.refreshToken.create({
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
      }),
    ]);

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  async revokeRefreshToken(
    rawToken: string,
    reason: string,
  ): Promise<{ deviceId: string | null } | null> {
    const tokenHash = this.sha256Hash(rawToken);

    const token = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
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
      where: {
        userId,
        isRevoked: false,
      },
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
    const currentTokenHash = this.sha256Hash(currentRawToken);
    const currentToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: currentTokenHash },
    });

    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
        ...(currentToken ? { id: { not: currentToken.id } } : {}),
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  private async revokeTokenFamily(
    family: string,
    reason: string,
  ): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        family,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: reason,
      },
    });
  }

  // VERIFICATION & RESET TOKEN OPERATIONS

  async createEmailVerificationToken(
    userId: string,
    targetEmail: string,
  ): Promise<string> {
    const rawToken = this.generateOpaqueToken();
    const tokenHash = this.sha256Hash(rawToken);
    const expiresAt = new Date(Date.now() + this.verificationTokenExpiresInMs);

    await this.prisma.emailVerificationToken.create({
      data: {
        userId,
        tokenHash,
        targetEmail,
        expiresAt,
      },
    });

    return rawToken;
  }

  async createPasswordResetToken(
    userId: string,
    ipAddress?: string,
  ): Promise<string> {
    const rawToken = this.generateOpaqueToken();
    const tokenHash = this.sha256Hash(rawToken);
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

  sha256Hash(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  getRefreshTokenExpiresInMs(): number {
    return this.refreshTokenExpiresInMs;
  }

  getResetTokenExpiresInMinutes(): number {
    return this.resetTokenExpiresInMs / (60 * 1000);
  }

  getVerificationTokenExpiresInMinutes(): number {
    return this.verificationTokenExpiresInMs / (60 * 1000);
  }
}
