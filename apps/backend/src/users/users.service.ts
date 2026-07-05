import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TokenService } from '../auth/token.service';
import {
  UserProfileResponseDto,
  GetMeDto,
} from './dto/user-profile-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { CreateUserWithProfileDto } from './dto/create-user-with-profile.dto';
import { Prisma, Role } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * Create a new user with profile (used by AuthService for registration)
   */
  async createUserWithProfile(
    dto: CreateUserWithProfileDto,
  ): Promise<{ id: string; email: string; role: Role }> {
    const email = dto.email.toLowerCase().trim();
    const role: Role = dto.role ?? Role.TOURIST;

    // Check for existing user
    const [existingByEmail, existingByPhone] = await Promise.all([
      this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      }),
      dto.phone
        ? this.prisma.user.findUnique({
            where: { phone: dto.phone },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (existingByEmail) {
      throw new ConflictException(
        'An account with this email address already exists.',
      );
    }

    if (existingByPhone) {
      throw new ConflictException(
        'An account with this phone number already exists.',
      );
    }

    const passwordHash = await this.tokenService.hashPassword(dto.password);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          phone: dto.phone ?? null,
          passwordHash,
          role,
        },
      });

      if (role === Role.TOURIST) {
        await tx.touristProfile.create({
          data: {
            userId: newUser.id,
            fullName: dto.fullName,
            gender: dto.gender,
            nationality: dto.nationality ?? null,
          },
        });
      } else if (role === Role.GUIDE) {
        await tx.guideProfile.create({
          data: {
            userId: newUser.id,
            fullName: dto.fullName,
            gender: dto.gender,
            experienceYears: dto.experienceYears,
            languagesSpoken: dto.languagesSpoken ?? [],
          },
        });
      }

      return newUser;
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Get current user basic info (lightweight version for /users/me)
   */
  async getMe(userId: string): Promise<GetMeDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        avatarId: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      avatarId: user.avatarId ?? null,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    };
  }

  /**
   * Get full user profile with role-specific details
   */
  async getProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        touristProfile: true,
        guideProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToProfileResponse(user);
  }

  /**
   * Update user profile (common fields + role-specific profile)
   */
  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<UserProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        touristProfile: true,
        guideProfile: true,
        adminProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Update in transaction
    await this.prisma.$transaction(async (tx) => {
      // Update phone if provided
      if (dto.phone !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: { phone: dto.phone },
        });
      }

      // Update role-specific profile
      if (user.role === Role.TOURIST && dto.touristProfile) {
        await this.updateTouristProfile(tx, userId, dto.touristProfile);
      } else if (user.role === Role.GUIDE && dto.guideProfile) {
        await this.updateGuideProfile(tx, userId, dto.guideProfile);
      } else if (user.role === Role.ADMIN && dto.adminProfile) {
        await this.updateAdminProfile(tx, userId, dto.adminProfile);
      }
    });

    // Return updated profile
    return this.getProfile(userId);
  }

  /**
   * Update user avatar
   */
  async updateAvatar(
    userId: string,
    dto: UpdateAvatarDto,
  ): Promise<UserProfileResponseDto> {
    // Verify media exists
    const media = await this.prisma.media.findUnique({
      where: { id: dto.mediaId },
    });

    if (!media) {
      throw new BadRequestException('Media not found');
    }

    // Update user avatar
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarId: dto.mediaId },
    });

    return this.getProfile(userId);
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount(userId: string, reason?: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Soft delete user
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      // Revoke all refresh tokens
      await tx.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: {
          isRevoked: true,
          revokedAt: new Date(),
          revokedReason: 'Account deleted',
        },
      });

      // Deactivate all device tokens
      await tx.deviceToken.updateMany({
        where: { userId, isActive: true },
        data: { isActive: false },
      });

      // Log the deletion reason if provided (optional audit log)
      if (reason) {
        // This could be stored in an audit log table in the future
        console.log(`User ${userId} deleted account. Reason: ${reason}`);
      }
    });
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private async updateTouristProfile(
    tx: Prisma.TransactionClient,
    userId: string,
    data:
      | Prisma.TouristProfileUpdateInput
      | Prisma.TouristProfileUncheckedUpdateInput,
  ): Promise<void> {
    const touristCreate = {
      ...(data as Prisma.TouristProfileUncheckedCreateInput),
      userId,
    };
    const touristUpdate = data as Prisma.TouristProfileUpdateInput;

    await tx.touristProfile.upsert({
      where: { userId },
      create: touristCreate,
      update: touristUpdate,
    });
  }

  private async updateGuideProfile(
    tx: Prisma.TransactionClient,
    userId: string,
    data:
      Prisma.GuideProfileUpdateInput | Prisma.GuideProfileUncheckedUpdateInput,
  ): Promise<void> {
    const guideCreate = {
      ...(data as Prisma.GuideProfileUncheckedCreateInput),
      userId,
    };
    const guideUpdate = data as Prisma.GuideProfileUpdateInput;

    await tx.guideProfile.upsert({
      where: { userId },
      create: guideCreate,
      update: guideUpdate,
    });
  }

  private async updateAdminProfile(
    tx: Prisma.TransactionClient,
    userId: string,
    data:
      Prisma.AdminProfileUpdateInput | Prisma.AdminProfileUncheckedUpdateInput,
  ): Promise<void> {
    const adminCreate = {
      ...(data as Prisma.AdminProfileUncheckedCreateInput),
      userId,
    };
    const adminUpdate = data as Prisma.AdminProfileUpdateInput;

    await tx.adminProfile.upsert({
      where: { userId },
      create: adminCreate,
      update: adminUpdate,
    });
  }

  private mapToProfileResponse(
    user: Prisma.UserGetPayload<{
      include: { touristProfile: true; guideProfile: true; adminProfile: true };
    }>,
  ): UserProfileResponseDto {
    return new UserProfileResponseDto({
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      isActive: user.isActive,
      avatarId: user.avatarId,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      touristProfile: user.touristProfile
        ? {
            fullName: user.touristProfile.fullName,
            displayName: user.touristProfile.displayName,
            bio: user.touristProfile.bio,
            gender: user.touristProfile.gender,
            dateOfBirth: user.touristProfile.dateOfBirth?.toISOString() ?? null,
            nationality: user.touristProfile.nationality,
            preferredLanguage: user.touristProfile.preferredLanguage,
            emergencyContactName: user.touristProfile.emergencyContactName,
            emergencyContactPhone: user.touristProfile.emergencyContactPhone,
          }
        : null,
      guideProfile: user.guideProfile
        ? {
            fullName: user.guideProfile.fullName,
            displayName: user.guideProfile.displayName,
            bio: user.guideProfile.bio,
            gender: user.guideProfile.gender,
            dateOfBirth: user.guideProfile.dateOfBirth?.toISOString() ?? null,
            languagesSpoken: user.guideProfile.languagesSpoken,
            experienceYears: user.guideProfile.experienceYears,
            totalTripsCompleted: user.guideProfile.totalTripsCompleted,
            averageRating: user.guideProfile.averageRating?.toString() ?? null,
            totalReviews: user.guideProfile.totalReviews,
            totalEarnings: user.guideProfile.totalEarnings?.toString() ?? null,
            pendingPayout: user.guideProfile.pendingPayout?.toString() ?? null,
            currentVerificationStatus:
              user.guideProfile.currentVerificationStatus,
          }
        : null,
      adminProfile: user.adminProfile
        ? {
            fullName: user.adminProfile.fullName,
            department: user.adminProfile.department,
            isSuperAdmin: user.adminProfile.isSuperAdmin,
            permissions: user.adminProfile.permissions,
          }
        : null,
    });
  }
}
