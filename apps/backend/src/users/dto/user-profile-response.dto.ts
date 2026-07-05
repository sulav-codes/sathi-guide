import { Exclude, Expose, Type } from 'class-transformer';
import { Role, Gender } from '../../generated/prisma/client';

// Simple user DTO for /users/me endpoint (lightweight version of full profile)
@Exclude()
export class GetMeDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  phone!: string | null;

  @Expose()
  role!: Role;

  @Expose()
  isEmailVerified!: boolean;

  @Expose()
  isPhoneVerified!: boolean;

  @Expose()
  avatarId!: string | null;

  @Expose()
  createdAt!: string;

  @Expose()
  lastLoginAt!: string | null;
}

// Response DTO for TouristProfile
@Exclude()
export class TouristProfileResponseDto {
  @Expose()
  fullName!: string;

  @Expose()
  displayName!: string | null;

  @Expose()
  bio!: string | null;

  @Expose()
  gender!: Gender | null;

  @Expose()
  dateOfBirth!: string | null;

  @Expose()
  nationality!: string | null;

  @Expose()
  preferredLanguage!: string;

  @Expose()
  emergencyContactName!: string | null;

  @Expose()
  emergencyContactPhone!: string | null;
}

// Response DTO for GuideProfile
@Exclude()
export class GuideProfileResponseDto {
  @Expose()
  fullName!: string;

  @Expose()
  displayName!: string | null;

  @Expose()
  bio!: string | null;

  @Expose()
  gender!: Gender | null;

  @Expose()
  dateOfBirth!: string | null;

  @Expose()
  languagesSpoken!: string[];

  @Expose()
  experienceYears!: number;

  @Expose()
  totalTripsCompleted!: number;

  @Expose()
  averageRating!: string;

  @Expose()
  totalReviews!: number;

  @Expose()
  totalEarnings!: string;

  @Expose()
  pendingPayout!: string;

  @Expose()
  currentVerificationStatus!: string;
}

// Response DTO for AdminProfile
@Exclude()
export class AdminProfileResponseDto {
  @Expose()
  fullName!: string;

  @Expose()
  department!: string | null;

  @Expose()
  isSuperAdmin!: boolean;

  @Expose()
  permissions!: string[];
}

// Main User Profile Response DTO
@Exclude()
export class UserProfileResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  phone!: string | null;

  @Expose()
  role!: Role;

  @Expose()
  isEmailVerified!: boolean;

  @Expose()
  isPhoneVerified!: boolean;

  @Expose()
  isActive!: boolean;

  @Expose()
  avatarId!: string | null;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;

  @Expose()
  @Type(() => TouristProfileResponseDto)
  touristProfile!: TouristProfileResponseDto | null;

  @Expose()
  @Type(() => GuideProfileResponseDto)
  guideProfile!: GuideProfileResponseDto | null;

  @Expose()
  @Type(() => AdminProfileResponseDto)
  adminProfile!: AdminProfileResponseDto | null;

  constructor(partial: Partial<UserProfileResponseDto>) {
    Object.assign(this, partial);
  }
}
