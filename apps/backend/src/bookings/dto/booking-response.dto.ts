import { Exclude, Expose, Type } from 'class-transformer';
import {
  BookingStatus,
  Currency,
  PricingUnit,
} from '../../generated/prisma/client';

// Response DTO for Guide Info (nested in booking)
@Exclude()
export class BookingGuideResponseDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  displayName!: string | null;

  @Expose()
  avatarUrl!: string | null;

  @Expose()
  averageRating!: string;

  @Expose()
  totalReviews!: number;
}

// Response DTO for Experience Info (nested in booking)
@Exclude()
export class BookingExperienceResponseDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  shortDescription!: string;

  @Expose()
  coverImage!: { key: string; url: string } | null;

  @Expose()
  durationHours!: string;

  @Expose()
  difficulty!: string | null;
}

// Response DTO for Tourist Info (nested in booking)
@Exclude()
export class BookingTouristResponseDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  displayName!: string | null;

  @Expose()
  avatarUrl!: string | null;

  @Expose()
  phone!: string | null;
}

// Response DTO for Pricing Snapshot
@Exclude()
export class BookingPricingSnapshotResponseDto {
  @Expose()
  id!: string;

  @Expose()
  unit!: PricingUnit;

  @Expose()
  agreedRate!: string;

  @Expose()
  currency!: Currency;

  @Expose()
  groupSize!: number;

  @Expose()
  durationHours!: string | null;

  @Expose()
  baseAmount!: string;

  @Expose()
  discountAmount!: string;

  @Expose()
  platformFeeAmount!: string;

  @Expose()
  platformFeePercent!: string;

  @Expose()
  taxAmount!: string;

  @Expose()
  totalAmount!: string;

  @Expose()
  promoCodeApplied!: string | null;

  @Expose()
  promoDiscountAmount!: string | null;
}

// Response DTO for Booking State Log Entry
@Exclude()
export class BookingStateLogEntryDto {
  @Expose()
  id!: string;

  @Expose()
  fromStatus!: BookingStatus | null;

  @Expose()
  toStatus!: BookingStatus;

  @Expose()
  actorId!: string;

  @Expose()
  actorRole!: string;

  @Expose()
  reason!: string | null;

  @Expose()
  reasonCode!: string | null;

  @Expose()
  note!: string | null;

  @Expose()
  createdAt!: string;
}

// Main Response DTO for Booking
@Exclude()
export class BookingResponseDto {
  @Expose()
  id!: string;

  @Expose()
  status!: string;

  @Expose()
  tripDate!: string;

  @Expose()
  startTime!: string | null;

  @Expose()
  endTime!: string | null;

  @Expose()
  durationHours!: string | null;

  @Expose()
  groupSize!: number;

  @Expose()
  touristNote!: string | null;

  @Expose()
  guideNote!: string | null;

  @Expose()
  currency!: string;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;

  @Expose()
  @Type(() => BookingTouristResponseDto)
  tourist!: BookingTouristResponseDto;

  @Expose()
  @Type(() => BookingGuideResponseDto)
  guide!: BookingGuideResponseDto;

  @Expose()
  @Type(() => BookingExperienceResponseDto)
  experience!: BookingExperienceResponseDto;

  @Expose()
  @Type(() => BookingPricingSnapshotResponseDto)
  pricingSnapshot!: BookingPricingSnapshotResponseDto | null;

  @Expose()
  @Type(() => BookingStateLogEntryDto)
  stateLog!: BookingStateLogEntryDto[];

  @Expose()
  canCancel!: boolean;

  @Expose()
  canReview!: boolean;
}

// Response wrapper for paginated booking list
export class BookingListResponseDto {
  items!: BookingResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
