import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  UserProfileResponseDto,
  GetMeDto,
} from './dto/user-profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import type { JwtPayload } from '../common/strategies/jwt.strategy';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me
   * Get the current user's basic info (lightweight)
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(@CurrentUser() user: JwtPayload): Promise<GetMeDto> {
    return this.usersService.getMe(user.sub);
  }

  /**
   * GET /users/profile
   * Get the current user's full profile with role-specific details
   */
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @CurrentUser() user: JwtPayload,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.getProfile(user.sub);
  }

  /**
   * GET /users/:id/public-profile
   * Get a user's safe public profile
   */
  @Get(':id/public-profile')
  @HttpCode(HttpStatus.OK)
  async getPublicProfile(
    @Param('id') id: string,
  ): Promise<any> {
    return this.usersService.getPublicProfile(id);
  }

  /**
   * PATCH /users/profile
   * Update the current user's profile (common fields + role-specific profile)
   */
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateProfile(user.sub, dto);
  }

  /**
   * PATCH /users/avatar
   * Update the current user's avatar
   */
  @Patch('avatar')
  @HttpCode(HttpStatus.OK)
  async updateAvatar(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateAvatarDto,
  ): Promise<UserProfileResponseDto> {
    return this.usersService.updateAvatar(user.sub, dto);
  }

  /**
   * DELETE /users/account
   * Delete the current user's account (soft delete)
   */
  @Delete('account')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(
    @CurrentUser() user: JwtPayload,
    @Body() dto?: DeleteAccountDto,
  ): Promise<void> {
    await this.usersService.deleteAccount(user.sub, dto?.reason);
  }
}
