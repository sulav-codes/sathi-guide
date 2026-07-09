import { Exclude, Expose, Type } from 'class-transformer';
import { ReviewStatus } from '../../generated/prisma/client';

// Response DTO for Review Author (Tourist)
@Exclude()
export class ReviewAuthorResponseDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  displayName!: string | null;

  @Expose()
  avatarUrl!: string | null;
}

// Response DTO for Review Subject (Guide)
@Exclude()
export class ReviewSubjectResponseDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  displayName!: string | null;

  @Expose()
  avatarUrl!: string | null;
}

// Response DTO for Booking (nested)
@Exclude()
export class ReviewBookingResponseDto {
  @Expose()
  id!: string;

  @Expose()
  tripDate!: string;

  @Expose()
  experienceTitle!: string;
}

// Main Response DTO for Review
@Exclude()
export class ReviewResponseDto {
  @Expose()
  id!: string;

  @Expose()
  overallRating!: number;

  @Expose()
  communicationRating!: number | null;

  @Expose()
  punctualityRating!: number | null;

  @Expose()
  knowledgeRating!: number | null;

  @Expose()
  valueRating!: number | null;

  @Expose()
  comment!: string | null;

  @Expose()
  status!: ReviewStatus;

  @Expose()
  guideResponse!: string | null;

  @Expose()
  respondedAt!: string | null;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;

  @Expose()
  @Type(() => ReviewAuthorResponseDto)
  author!: ReviewAuthorResponseDto;

  @Expose()
  @Type(() => ReviewSubjectResponseDto)
  subject!: ReviewSubjectResponseDto;

  @Expose()
  @Type(() => ReviewBookingResponseDto)
  booking!: ReviewBookingResponseDto;

  @Expose()
  isEditable!: boolean;
}

// Response DTO for Review Summary (for Guide Profile)
@Exclude()
export class ReviewSummaryResponseDto {
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

// Response wrapper for paginated review list
export class ReviewListResponseDto {
  items!: ReviewResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

// Response DTO for can review check
export class CanReviewResponseDto {
  canReview!: boolean;
  reason?: string;
  completedBookingId?: string;
}
