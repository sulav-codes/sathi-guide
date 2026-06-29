import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthTokensDto } from './dto/auth-tokens.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { MessageResponseDto } from './dto/message-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ForgotPasswordDto as ResendEmailDto } from './dto/forgot-password.dto';
import type { JwtPayload } from '../common/strategies/jwt.strategy';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Create a new user account. Returns a message — no tokens issued.
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<MessageResponseDto> {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/verify-email
   * Verify email address using the token from the verification email.
   */
  @Public()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<MessageResponseDto> {
    return this.authService.verifyEmail(dto.token);
  }

  /**
   * POST /auth/login
   * Authenticate with email + password. Returns access + refresh tokens.
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() request: Request,
  ): Promise<LoginResponseDto> {
    return this.authService.login(dto, request);
  }

  /**
   * POST /auth/refresh
   * Exchange a valid refresh token for new access + refresh token pair.
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<AuthTokensDto> {
    return this.authService.refreshTokens(dto.refreshToken, request);
  }

  /**
   * POST /auth/logout
   * Revoke a refresh token and optionally deactivate device token.
   */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: RefreshTokenDto): Promise<MessageResponseDto> {
    return this.authService.logout(dto.refreshToken);
  }

  /**
   * POST /auth/forgot-password
   * Request a password reset email. Always returns success (prevents enumeration).
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Req() request: Request,
  ): Promise<MessageResponseDto> {
    return this.authService.forgotPassword(dto.email, request);
  }

  /**
   * POST /auth/reset-password
   * Reset password using a valid reset token from email.
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: ResetPasswordDto,
  ): Promise<MessageResponseDto> {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  /**
   * POST /auth/change-password
   * Change password for the currently authenticated user.
   */
  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: JwtPayload,
    @Req() request: Request,
  ): Promise<MessageResponseDto> {
    // Extract refresh token from request body if client sends it
    // This allows keeping the current session active
    const currentRefreshToken = (
      request.body as { currentRefreshToken?: string }
    )?.currentRefreshToken;

    return this.authService.changePassword(
      user.sub,
      dto.currentPassword,
      dto.newPassword,
      currentRefreshToken,
    );
  }

  /**
   * POST /auth/resend-verification
   * Request a new email verification link.
   */
  @Public()
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  async resendVerification(
    @Body() dto: ResendEmailDto,
  ): Promise<MessageResponseDto> {
    return this.authService.resendVerificationEmail(dto.email);
  }
}
