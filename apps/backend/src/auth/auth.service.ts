import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from '../generated/prisma/client';
import { Request } from 'express';
import { init as cuidInit } from '@paralleldrive/cuid2';

import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { TokenService } from './token.service';
import { UsersService } from '../users/users.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SafeUserDto } from './dto/safe-user.dto';

import { TokenConfig } from '../common/types/config.types';
import { TOKEN_CONFIG_KEY } from '../config/token.config';
import {
  REVOKE_REASON,
  SECURITY_MESSAGES,
} from '../common/constants/auth.constants';
import {
  extractIpAddress,
  extractUserAgent,
} from '../common/helpers/ip.helper';

import { MessageResponseDto } from './dto/message-response.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { sha256Hash } from '../common/helpers/token.helper';

const createId = cuidInit({ length: 24 });

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly tokenConfig: TokenConfig;

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    this.tokenConfig =
      this.configService.getOrThrow<TokenConfig>(TOKEN_CONFIG_KEY);
  }

  // ─────────────────────────────────────────────────────────────────
  // REGISTRATION
  // ─────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<MessageResponseDto> {
    // Use UsersService to create the user with profile
    const user = await this.usersService.createUserWithProfile(dto);

    const rawVerificationToken =
      await this.tokenService.createEmailVerificationToken(user.id, user.email);

    const verificationUrl =
      this.mailService.buildVerificationUrl(rawVerificationToken);

    try {
      await this.mailService.sendVerificationEmail({
        to: user.email,
        verificationUrl,
        expiresInMinutes:
          this.tokenService.getVerificationTokenExpiresInMinutes(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to send verification email to ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
      // Registration succeeds even if email dispatch fails
      // User can request resend via /auth/resend-verification
    }

    this.logger.log(
      `User registered: userId=${user.id} email=${user.email} role=${user.role}`,
    );

    return new MessageResponseDto({
      message:
        'Registration successful. Please check your email to verify your account.',
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // EMAIL VERIFICATION
  // ─────────────────────────────────────────────────────────────────

  async verifyEmail(rawToken: string): Promise<MessageResponseDto> {
    const tokenHash = sha256Hash(rawToken);

    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, isEmailVerified: true },
        },
      },
    });

    if (!record) {
      throw new BadRequestException(SECURITY_MESSAGES.TOKEN_INVALID);
    }

    if (record.isUsed) {
      throw new BadRequestException(
        'This verification link has already been used.',
      );
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException(
        'Verification token has expired. Please request a new verification email.',
      );
    }

    if (record.user.isEmailVerified) {
      return new MessageResponseDto({
        message: 'Email address has already been verified.',
      });
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { isUsed: true, usedAt: now },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { isEmailVerified: true },
      }),
    ]);

    this.logger.log(
      `Email verified: userId=${record.userId} email=${record.targetEmail}`,
    );

    return new MessageResponseDto({
      message:
        'Email address verified successfully. You can now log in to your account.',
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // LOGIN
  // ─────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, request: Request): Promise<LoginResponseDto> {
    const email = dto.email.toLowerCase().trim();
    const ipAddress = extractIpAddress(request);
    const userAgent = extractUserAgent(request);

    const user = await this.prisma.user.findUnique({ where: { email } });

    // Timing attack prevention — always run Argon2 verify
    if (!user) {
      await this.tokenService.dummyVerify();
      throw new UnauthorizedException(SECURITY_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.tokenService.verifyPassword(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(SECURITY_MESSAGES.INVALID_CREDENTIALS);
    }

    // State checks after password verification (prevents timing-based enumeration)
    if (user.deletedAt !== null) {
      throw new UnauthorizedException(
        'This account has been deleted. Please contact support.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'This account is deactivated. Please contact support.',
      );
    }

    if (user.isBanned) {
      throw new ForbiddenException(
        'This account has been suspended. Please contact support.',
      );
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.tokenService.createRefreshToken(user.id, {
      family: createId(),
      deviceId: dto.deviceInfo?.deviceId,
      deviceName: dto.deviceInfo?.deviceName,
      ipAddress,
      userAgent,
    });

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      if (dto.deviceInfo?.fcmToken) {
        await tx.deviceToken.upsert({
          where: { token: dto.deviceInfo.fcmToken },
          create: {
            userId: user.id,
            token: dto.deviceInfo.fcmToken,
            deviceId: dto.deviceInfo.deviceId ?? null,
            platform: dto.deviceInfo.platform,
            deviceName: dto.deviceInfo.deviceName ?? null,
            isActive: true,
            lastSeenAt: new Date(),
          },
          update: {
            isActive: true,
            lastSeenAt: new Date(),
            deviceId: dto.deviceInfo.deviceId ?? undefined,
            deviceName: dto.deviceInfo.deviceName ?? undefined,
          },
        });
      }
    });

    this.logger.log(`User logged in: userId=${user.id} ip=${ipAddress}`);

    return new LoginResponseDto({
      accessToken,
      refreshToken,
      user: this.toSafeUser(user),
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // REFRESH TOKEN ROTATION
  // ─────────────────────────────────────────────────────────────────

  async refreshTokens(
    rawRefreshToken: string,
    request: Request,
  ): Promise<AuthTokensDto> {
    const tokens = await this.tokenService.rotateRefreshToken(rawRefreshToken, {
      ipAddress: extractIpAddress(request),
      userAgent: extractUserAgent(request),
    });

    return new AuthTokensDto(tokens);
  }

  // ─────────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────────

  async logout(rawRefreshToken: string): Promise<MessageResponseDto> {
    const result = await this.tokenService.revokeRefreshToken(
      rawRefreshToken,
      REVOKE_REASON.LOGOUT,
    );

    if (result?.deviceId) {
      await this.prisma.deviceToken
        .updateMany({
          where: { deviceId: result.deviceId, isActive: true },
          data: { isActive: false, lastSeenAt: new Date() },
        })
        .catch((err: Error) => {
          this.logger.warn(
            `Could not deactivate device token on logout: ${err.message}`,
          );
        });
    }

    return new MessageResponseDto({ message: 'Logged out successfully.' });
  }

  // ─────────────────────────────────────────────────────────────────
  // FORGOT PASSWORD
  // ─────────────────────────────────────────────────────────────────

  async forgotPassword(
    email: string,
    request: Request,
  ): Promise<MessageResponseDto> {
    const normalizedEmail = email.toLowerCase().trim();
    const ipAddress = extractIpAddress(request);

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        isActive: true,
        isBanned: true,
        deletedAt: true,
      },
    });

    // Always return same message — never reveal whether email exists
    if (
      !user ||
      !user.isEmailVerified ||
      !user.isActive ||
      user.isBanned ||
      user.deletedAt !== null
    ) {
      return new MessageResponseDto({
        message: SECURITY_MESSAGES.FORGOT_PASSWORD,
      });
    }

    // Invalidate all current unused reset tokens
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      data: { isUsed: true, usedAt: new Date() },
    });

    const rawResetToken = await this.tokenService.createPasswordResetToken(
      user.id,
      ipAddress,
    );

    const resetUrl = this.mailService.buildPasswordResetUrl(rawResetToken);

    try {
      await this.mailService.sendPasswordReset({
        to: user.email,
        resetUrl,
        expiresInMinutes: this.tokenService.getResetTokenExpiresInMinutes(),
        requestedFromIp: ipAddress,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    this.logger.log(
      `Password reset requested: userId=${user.id} ip=${ipAddress}`,
    );

    return { message: SECURITY_MESSAGES.FORGOT_PASSWORD };
  }

  // ─────────────────────────────────────────────────────────────────
  // RESET PASSWORD
  // ─────────────────────────────────────────────────────────────────

  async resetPassword(
    rawToken: string,
    newPassword: string,
  ): Promise<MessageResponseDto> {
    const tokenHash = sha256Hash(rawToken);

    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, email: true, passwordHash: true },
        },
      },
    });

    if (!record) {
      throw new BadRequestException(SECURITY_MESSAGES.TOKEN_INVALID);
    }

    if (record.isUsed) {
      throw new BadRequestException(
        'This reset link has already been used. Please request a new one.',
      );
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException(
        'Password reset token has expired. Please request a new reset link.',
      );
    }

    const isSamePassword = await this.tokenService.verifyPassword(
      record.user.passwordHash,
      newPassword,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from your current password.',
      );
    }

    const newPasswordHash = await this.tokenService.hashPassword(newPassword);
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { isUsed: true, usedAt: now },
      }),
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: newPasswordHash },
      }),
      this.prisma.refreshToken.updateMany({
        where: { userId: record.userId, isRevoked: false },
        data: {
          isRevoked: true,
          revokedAt: now,
          revokedReason: REVOKE_REASON.PASSWORD_RESET,
        },
      }),
    ]);

    this.logger.log(
      `Password reset complete: userId=${record.userId}. All sessions revoked.`,
    );

    try {
      await this.mailService.sendPasswordChangedNotification({
        to: record.user.email,
        changedAt: now,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password change notification`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return new MessageResponseDto({
      message:
        'Password reset successfully. Please log in with your new password.',
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // CHANGE PASSWORD
  // ─────────────────────────────────────────────────────────────────

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    currentRefreshToken?: string,
  ): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    const isCurrentValid = await this.tokenService.verifyPassword(
      user.passwordHash,
      currentPassword,
    );

    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    const isSamePassword = await this.tokenService.verifyPassword(
      user.passwordHash,
      newPassword,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from your current password.',
      );
    }

    const newPasswordHash = await this.tokenService.hashPassword(newPassword);
    const now = new Date();

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    if (currentRefreshToken) {
      await this.tokenService.revokeAllUserRefreshTokensExcept(
        userId,
        currentRefreshToken,
        REVOKE_REASON.PASSWORD_CHANGED,
      );
    } else {
      await this.tokenService.revokeAllUserRefreshTokens(
        userId,
        REVOKE_REASON.PASSWORD_CHANGED,
      );
    }

    this.logger.log(
      `Password changed: userId=${userId}. Other sessions revoked.`,
    );

    try {
      await this.mailService.sendPasswordChangedNotification({
        to: user.email,
        changedAt: now,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send password change notification`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    return new MessageResponseDto({
      message:
        'Password changed successfully. Other active sessions have been logged out.',
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // RESEND VERIFICATION EMAIL
  // ─────────────────────────────────────────────────────────────────

  async resendVerificationEmail(email: string): Promise<MessageResponseDto> {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        isActive: true,
        deletedAt: true,
      },
    });

    if (!user || !user.isActive || user.deletedAt !== null) {
      return new MessageResponseDto({
        message: SECURITY_MESSAGES.RESEND_VERIFICATION,
      });
    }

    if (user.isEmailVerified) {
      return new MessageResponseDto({
        message: 'Your email address has already been verified.',
      });
    }

    // Rate limit: reject if a token was created within the cooldown window
    const lastToken = await this.prisma.emailVerificationToken.findFirst({
      where: { userId: user.id, isUsed: false },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (lastToken) {
      const elapsedSeconds =
        (Date.now() - lastToken.createdAt.getTime()) / 1000;

      const cooldown = this.tokenConfig.resendVerificationCooldownSeconds;

      if (elapsedSeconds < cooldown) {
        const waitSeconds = Math.ceil(cooldown - elapsedSeconds);
        throw new BadRequestException(
          `Please wait ${waitSeconds} second(s) before requesting another verification email.`,
        );
      }
    }

    // Invalidate all old unused verification tokens
    await this.prisma.emailVerificationToken.updateMany({
      where: { userId: user.id, isUsed: false },
      data: { isUsed: true, usedAt: new Date() },
    });

    const rawToken = await this.tokenService.createEmailVerificationToken(
      user.id,
      user.email,
    );

    const verificationUrl = this.mailService.buildVerificationUrl(rawToken);

    try {
      await this.mailService.sendVerificationEmail({
        to: user.email,
        verificationUrl,
        expiresInMinutes:
          this.tokenService.getVerificationTokenExpiresInMinutes(),
      });
    } catch (error) {
      this.logger.error(
        `Failed to resend verification email to ${user.email}`,
        error instanceof Error ? error.stack : String(error),
      );
    }

    this.logger.log(
      `Verification email resent: userId=${user.id} email=${user.email}`,
    );

    return new MessageResponseDto({
      message: SECURITY_MESSAGES.RESEND_VERIFICATION,
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────

  private toSafeUser(user: {
    id: string;
    email: string;
    phone?: string | null;
    role: Role;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    avatarId?: string | null;
    createdAt: Date;
    lastLoginAt?: Date | null;
  }): SafeUserDto {
    return new SafeUserDto({
      id: user.id,
      email: user.email,
      phone: user.phone ?? null,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      avatarId: user.avatarId ?? null,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? null,
    });
  }
}
