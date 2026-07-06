import { Exclude, Expose, Type } from 'class-transformer';
import { VerificationStatus, Gender } from '../../generated/prisma/client';

// Response DTO for GuideLocation
@Exclude()
export class GuideLocationResponseDto {
  @Expose()
  city!: string;

  @Expose()
  district!: string;

  @Expose()
  province!: string | null;

  @Expose()
  country!: string;

  @Expose()
  latitude!: string;

  @Expose()
  longitude!: string;
}

// Response DTO for GuideExpertise
@Exclude()
export class GuideExpertiseResponseDto {
  @Expose()
  categoryId!: string;

  @Expose()
  categoryName!: string;

  @Expose()
  categorySlug!: string;

  @Expose()
  yearsOfExperience!: number | null;
}

// Response DTO for GuideReviewSummary
@Exclude()
export class GuideReviewSummaryDto {
  @Expose()
  averageRating!: number;

  @Expose()
  totalReviews!: number;

  @Expose()
  fiveStar!: number;

  @Expose()
  fourStar!: number;

  @Expose()
  threeStar!: number;

  @Expose()
  twoStar!: number;

  @Expose()
  oneStar!: number;
}

// Response DTO for public guide listing
@Exclude()
export class GuideListItemDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  displayName!: string | null;

  @Expose()
  bio!: string | null;

  @Expose()
  avatarUrl!: string | null;

  @Expose()
  gender!: Gender | null;

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
  currentVerificationStatus!: VerificationStatus;

  @Expose()
  @Type(() => GuideLocationResponseDto)
  location!: GuideLocationResponseDto | null;

  @Expose()
  @Type(() => GuideExpertiseResponseDto)
  expertise!: GuideExpertiseResponseDto[];

  @Expose()
  basePrice!: string | null;

  @Expose()
  currency!: string | null;
}

// Response DTO for detailed public guide profile
@Exclude()
export class GuideDetailResponseDto extends GuideListItemDto {
  @Expose()
  dateOfBirth!: string | null;

  @Expose()
  totalEarnings!: string;

  @Expose()
  @Type(() => GuideReviewSummaryDto)
  reviewSummary!: GuideReviewSummaryDto;

  @Expose()
  createdAt!: string;
}

// Response DTO for guide's own profile (private data)
@Exclude()
export class GuidePrivateProfileDto extends GuideDetailResponseDto {
  @Expose()
  pendingPayout!: string;

  @Expose()
  email!: string;

  @Expose()
  phone!: string | null;

  @Expose()
  isEmailVerified!: boolean;

  @Expose()
  isPhoneVerified!: boolean;
}

// Response DTO for pending guides (admin view)
@Exclude()
export class PendingGuideResponseDto {
  @Expose()
  id!: string;

  @Expose()
  userId!: string;

  @Expose()
  fullName!: string;

  @Expose()
  displayName!: string | null;

  @Expose()
  email!: string;

  @Expose()
  submittedAt!: string;

  @Expose()
  currentVerificationStatus!: VerificationStatus;

  @Expose()
  documentCount!: number;
}

// Response wrapper for paginated guide list
export class GuideListResponseDto {
  items!: GuideListItemDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
