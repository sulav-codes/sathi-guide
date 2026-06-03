import {
  BadRequestException,
  ConflictException,
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
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { SafeUserDto } from './dto/safe-user.dto';

const createId = cuidInit({ length: 24 });

// Rate limit: minimum seconds between resend-verification requests
const RESEND_VERIFICATION_COOLDOWN_SECONDS = 60;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // REGISTRATION
  // ─────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto): Promise<MessageResponseDto> {
    const email = dto.email.toLowerCase().trim();

    // Check for existing user by email
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUserByEmail) {
      throw new ConflictException(
        'An account with this email address already exists.',
      );
    }

    // Check for existing user by phone (if provided)
    if (dto.phone) {
      const existingUserByPhone = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
        select: { id: true },
      });

      if (existingUserByPhone) {
        throw new ConflictException(
          'An account with this phone number already exists.',
        );
      }
    }

    const role: Role = dto.role ?? Role.TOURIST;

    // Only allow TOURIST or GUIDE roles on self-registration
    if (role === Role.ADMIN) {
      throw new ForbiddenException(
        'Admin accounts cannot be created through public registration.',
      );
    }

    const passwordHash = await this.tokenService.hashPassword(dto.password);

    // Create user + role-specific profile + email verification token in a transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          phone: dto.phone ?? null,
          passwordHash,
          role,
        },
      });

      // Create role-specific shell profile
      if (role === Role.TOURIST) {
        await tx.touristProfile.create({
          data: {
            userId: newUser.id,
            firstName: '',
            lastName: '',
          },
        });
      } else if (role === Role.GUIDE) {
        await tx.guideProfile.create({
          data: {
            userId: newUser.id,
            firstName: '',
            lastName: '',
          },
        });
      }

      return newUser;
    });

    // Generate and store email verification token (outside main transaction
    // so a mail failure doesn't roll back user creation)
    const rawVerificationToken =
      await this.tokenService.createEmailVerificationToken(user.id, email);

    const verificationUrl =
      this.mailService.buildVerificationUrl(rawVerificationToken);

    try {
      await this.mailService.sendVerificationEmail({
        to: email,
        verificationUrl,
        expiresInMinutes:
          this.tokenService.getVerificationTokenExpiresInMinutes(),
      });
    } catch (error) {
      const { message, stack } = this.formatError(error);
      this.logger.error(
        `Failed to send verification email to ${email}: ${message}`,
        stack,
      );
      // Don't fail registration if email sending fails — user can request resend
    }

    this.logger.log(
      `New user registered: ${user.id} (${email}, role: ${role})`,
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
    const tokenHash = this.tokenService.sha256Hash(rawToken);

    const verificationRecord =
      await this.prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
        include: {
          user: {
            select: {
              id: true,
              isEmailVerified: true,
              email: true,
            },
          },
        },
      });

    if (!verificationRecord) {
      throw new BadRequestException(
        'Invalid or expired verification token. Please request a new one.',
      );
    }

    if (verificationRecord.isUsed) {
      throw new BadRequestException(
        'This verification link has already been used. Please log in to your account.',
      );
    }

    if (verificationRecord.expiresAt < new Date()) {
      throw new BadRequestException(
        'Verification token has expired. Please request a new verification email.',
      );
    }

    if (verificationRecord.user.isEmailVerified) {
      return new MessageResponseDto({
        message: 'Email address has already been verified.',
      });
    }

    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: verificationRecord.id },
        data: {
          isUsed: true,
          usedAt: now,
        },
      }),
      this.prisma.user.update({
        where: { id: verificationRecord.userId },
        data: { isEmailVerified: true },
      }),
    ]);

    this.logger.log(
      `Email verified for user ${verificationRecord.userId} (${verificationRecord.targetEmail})`,
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
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Timing attack prevention: always run Argon2 verify even if user not found
    if (!user) {
      await this.tokenService.dummyVerify();
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await this.tokenService.verifyPassword(
      user.passwordHash,
      dto.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    // Account state checks (after password verification to prevent user enumeration)
    if (user.deletedAt !== null) {
      throw new UnauthorizedException(
        'This account has been deleted. Please contact support.',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException(
        'This account has been deactivated. Please contact support.',
      );
    }

    if (user.isBanned) {
      throw new ForbiddenException(
        'This account has been suspended. Please contact support.',
      );
    }

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const tokenFamily = createId();

    const refreshToken = await this.tokenService.createRefreshToken(user.id, {
      family: tokenFamily,
      deviceId: dto.deviceInfo?.deviceId,
      deviceName: dto.deviceInfo?.deviceName,
      ipAddress,
      userAgent,
    });

    // Update lastLoginAt and handle device token upsert in a transaction
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      if (dto.deviceInfo?.deviceId) {
        await tx.deviceToken.upsert({
          where: {
            token:
              dto.deviceInfo.fcmToken ??
              `${dto.deviceInfo.deviceId}-${dto.deviceInfo.platform}`,
          },
          create: {
            userId: user.id,
            token:
              dto.deviceInfo.fcmToken ??
              `${dto.deviceInfo.deviceId}-${dto.deviceInfo.platform}`,
            platform: dto.deviceInfo.platform,
            deviceName: dto.deviceInfo.deviceName ?? null,
            isActive: true,
            lastSeenAt: new Date(),
          },
          update: {
            isActive: true,
            lastSeenAt: new Date(),
            deviceName: dto.deviceInfo.deviceName ?? undefined,
          },
        });
      }
    });

    this.logger.log(
      `User logged in: ${user.id} (${user.email}) from IP: ${ipAddress}`,
    );

    return new LoginResponseDto({
      accessToken,
      refreshToken,
      user: this.buildSafeUser(user),
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // REFRESH TOKEN ROTATION
  // ─────────────────────────────────────────────────────────────────

  async refreshTokens(
    rawRefreshToken: string,
    request: Request,
  ): Promise<AuthTokensDto> {
    const ipAddress = this.extractIpAddress(request);
    const userAgent = request.headers['user-agent'];

    const tokens = await this.tokenService.rotateRefreshToken(rawRefreshToken, {
      ipAddress,
      userAgent,
    });

    return new AuthTokensDto(tokens);
  }

  // ─────────────────────────────────────────────────────────────────
  // LOGOUT
  // ─────────────────────────────────────────────────────────────────

  async logout(rawRefreshToken: string): Promise<MessageResponseDto> {
    const result = await this.tokenService.revokeRefreshToken(
      rawRefreshToken,
      'logout',
    );

    if (result?.deviceId) {
      // Deactivate device token if one was associated
      const tokenHash = this.tokenService.sha256Hash(rawRefreshToken);
      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
        select: { deviceId: true },
      });

      if (refreshToken?.deviceId) {
        await this.prisma.deviceToken
          .updateMany({
            where: {
              userId: { not: undefined },
              token: { contains: refreshToken.deviceId },
              isActive: true,
            },
            data: {
              isActive: false,
              lastSeenAt: new Date(),
            },
          })
          .catch((error: unknown) => {
            const { message } = this.formatError(error);
            this.logger.warn(
              `Could not deactivate device token on logout: ${message}`,
            );
          });
      }
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
    const ipAddress = this.extractIpAddress(request);

    // IMPORTANT: Always return the same message regardless of whether
    // the user exists — prevents email enumeration
    const GENERIC_MESSAGE =
      'If your email is registered and verified, you will receive a password reset link shortly.';

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

    // Early return for non-existent or ineligible users
    if (
      !user ||
      !user.isEmailVerified ||
      !user.isActive ||
      user.isBanned ||
      user.deletedAt !== null
    ) {
      return new MessageResponseDto({ message: GENERIC_MESSAGE });
    }

    // Invalidate all existing unused reset tokens
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // Generate new reset token
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
      const { message, stack } = this.formatError(error);
      this.logger.error(
        `Failed to send password reset email to ${user.email}: ${message}`,
        stack,
      );
      // Still return success — don't reveal mail delivery failures
    }

    this.logger.log(
      `Password reset requested for user ${user.id} from IP ${ipAddress}`,
    );

    return new MessageResponseDto({ message: GENERIC_MESSAGE });
  }

  // ─────────────────────────────────────────────────────────────────
  // RESET PASSWORD
  // ─────────────────────────────────────────────────────────────────

  async resetPassword(
    rawToken: string,
    newPassword: string,
  ): Promise<MessageResponseDto> {
    const tokenHash = this.tokenService.sha256Hash(rawToken);

    const resetRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            passwordHash: true,
          },
        },
      },
    });

    if (!resetRecord) {
      throw new BadRequestException(
        'Invalid or expired password reset token. Please request a new one.',
      );
    }

    if (resetRecord.isUsed) {
      throw new BadRequestException(
        'This password reset link has already been used. Please request a new one.',
      );
    }

    if (resetRecord.expiresAt < new Date()) {
      throw new BadRequestException(
        'Password reset token has expired. Please request a new reset link.',
      );
    }

    // Prevent setting the same password
    const isSamePassword = await this.tokenService.verifyPassword(
      resetRecord.user.passwordHash,
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
      // Mark reset token as used
      this.prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { isUsed: true, usedAt: now },
      }),
      // Update password
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      // Revoke ALL refresh tokens — new password = all sessions invalidated
      this.prisma.refreshToken.updateMany({
        where: {
          userId: resetRecord.userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
          revokedAt: now,
          revokedReason: 'password_reset',
        },
      }),
    ]);

    this.logger.log(
      `Password reset successful for user ${resetRecord.userId}. All sessions revoked.`,
    );

    try {
      await this.mailService.sendPasswordChangedNotification({
        to: resetRecord.user.email,
        changedAt: now,
      });
    } catch (error) {
      const { message, stack } = this.formatError(error);
      this.logger.error(
        `Failed to send password change notification: ${message}`,
        stack,
      );
    }

    return new MessageResponseDto({
      message:
        'Password reset successfully. Please log in with your new password.',
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // CHANGE PASSWORD (authenticated)
  // ─────────────────────────────────────────────────────────────────

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    currentRefreshToken?: string,
  ): Promise<MessageResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.tokenService.verifyPassword(
      user.passwordHash,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect.');
    }

    // Ensure new password is different
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

    // Revoke all OTHER refresh tokens (keep current session)
    if (currentRefreshToken) {
      await this.tokenService.revokeAllUserRefreshTokensExcept(
        userId,
        currentRefreshToken,
        'password_changed',
      );
    } else {
      // No current refresh token context — revoke all
      await this.tokenService.revokeAllUserRefreshTokens(
        userId,
        'password_changed',
      );
    }

    this.logger.log(
      `Password changed for user ${userId}. Other sessions revoked.`,
    );

    try {
      await this.mailService.sendPasswordChangedNotification({
        to: user.email,
        changedAt: now,
      });
    } catch (error) {
      const { message, stack } = this.formatError(error);
      this.logger.error(
        `Failed to send password change notification: ${message}`,
        stack,
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

    // Always return same message to prevent email enumeration
    const GENERIC_MESSAGE =
      'If your email is registered and not yet verified, a new verification link has been sent.';

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
      return new MessageResponseDto({ message: GENERIC_MESSAGE });
    }

    if (user.isEmailVerified) {
      return new MessageResponseDto({
        message: 'Your email address has already been verified.',
      });
    }

    // Rate limiting: check when the last verification token was created
    const lastToken = await this.prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (lastToken) {
      const secondsSinceLastRequest =
        (Date.now() - lastToken.createdAt.getTime()) / 1000;

      if (secondsSinceLastRequest < RESEND_VERIFICATION_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(
          RESEND_VERIFICATION_COOLDOWN_SECONDS - secondsSinceLastRequest,
        );
        throw new BadRequestException(
          `Please wait ${waitSeconds} second(s) before requesting another verification email.`,
        );
      }
    }

    // Invalidate old unused verification tokens
    await this.prisma.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    // Generate new token
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
      const { message, stack } = this.formatError(error);
      this.logger.error(
        `Failed to resend verification email to ${user.email}: ${message}`,
        stack,
      );
    }

    this.logger.log(
      `Verification email resent to user ${user.id} (${user.email})`,
    );

    return new MessageResponseDto({ message: GENERIC_MESSAGE });
  }

  // ─────────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────────

  private buildSafeUser(user: {
    id: string;
    email: string;
    phone?: string | null;
    role: Role;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    avatarKey?: string | null;
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
      avatarKey: user.avatarKey ?? null,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? null,
    });
  }

  private formatError(error: unknown): { message: string; stack?: string } {
    if (error instanceof Error) {
      return { message: error.message, stack: error.stack };
    }

    if (typeof error === 'string') {
      return { message: error };
    }

    return { message: 'Unknown error' };
  }

  extractIpAddress(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (forwardedFor) {
      const ips = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : forwardedFor.split(',')[0];
      return ips.trim();
    }

    return (
      (request.headers['x-real-ip'] as string) ??
      request.socket?.remoteAddress ??
      request.ip ??
      'unknown'
    );
  }
}
