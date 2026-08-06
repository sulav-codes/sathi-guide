import { Expose, Type } from 'class-transformer';
import {
  ExperienceStatus,
  ExperienceDifficulty,
  PricingUnit,
  Currency,
} from '../../generated/prisma/client';

// Response DTO for Experience Guide (nested)
export class ExperienceGuideResponseDto {
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

  @Expose()
  languagesSpoken!: string[];
}

export class MediaReferenceDto {
  @Expose()
  key!: string;

  @Expose()
  url!: string;
}

/** Returned by POST /experiences/draft */
export class DraftExperienceResponseDto {
  @Expose()
  id!: string;

  @Expose()
  status!: string;
}

/** Returned by POST /experiences/:id/images */
export class AddImageResponseDto {
  @Expose()
  id!: string;

  @Expose()
  mediaId!: string;

  @Expose()
  displayOrder!: number;
}

/** Generic { message } response */
export class MessageResponseDto {
  @Expose()
  message!: string;
}

// Shared Sub-DTOs
// Response DTO for Experience Category
export class ExperienceCategoryResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  slug!: string;

  @Expose()
  description!: string | null;

  @Expose()
  iconKey!: string | null;
}

// Response DTO for Experience Location
export class ExperienceLocationResponseDto {
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

  @Expose()
  addressLine!: string | null;
}

// Response DTO for Experience Pricing Rule
export class ExperiencePricingRuleResponseDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  unit!: PricingUnit;

  @Expose()
  amount!: string;

  @Expose()
  currency!: Currency;

  @Expose()
  minGroupSize!: number | null;

  @Expose()
  maxGroupSize!: number | null;

  @Expose()
  isActive!: boolean;
}

// Response DTO for Experience Image
export class ExperienceImageResponseDto {
  @Expose()
  id!: string;

  @Expose()
  mediaId!: string;

  @Expose()
  key!: string;

  @Expose()
  url!: string;

  @Expose()
  displayOrder!: number;
}

// Response DTO for Experience List Item (public)
export class ExperienceListItemDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  shortDescription!: string;

  @Expose()
  @Type(() => MediaReferenceDto)
  coverImage!: MediaReferenceDto | null;

  @Expose()
  basePrice!: string;

  @Expose()
  currency!: Currency;

  @Expose()
  durationHours!: string;

  @Expose()
  minParticipants!: number;

  @Expose()
  maxParticipants!: number;

  @Expose()
  difficulty!: ExperienceDifficulty | null;

  @Expose()
  averageRating!: string;

  @Expose()
  totalReviews!: number;

  @Expose()
  status!: ExperienceStatus;

  @Expose()
  isActive!: boolean;

  @Expose()
  languagesOffered!: string[];

  @Expose()
  @Type(() => ExperienceCategoryResponseDto)
  category!: ExperienceCategoryResponseDto;

  @Expose()
  @Type(() => ExperienceLocationResponseDto)
  location!: ExperienceLocationResponseDto;

  @Expose()
  @Type(() => ExperienceGuideResponseDto)
  guide!: ExperienceGuideResponseDto;
}

// Response DTO for Experience Detail (public)
export class ExperienceDetailResponseDto extends ExperienceListItemDto {
  @Expose()
  description!: string;

  @Expose()
  inclusions!: string[];

  @Expose()
  exclusions!: string[];

  @Expose()
  cancellationPolicy!: string | null;

  @Expose()
  @Type(() => ExperienceLocationResponseDto)
  meetingLocation!: ExperienceLocationResponseDto | null;

  @Expose()
  @Type(() => ExperienceImageResponseDto)
  images!: ExperienceImageResponseDto[];

  @Expose()
  imageKeys!: string[];

  @Expose()
  @Type(() => ExperiencePricingRuleResponseDto)
  pricingRules!: ExperiencePricingRuleResponseDto[];

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;
}

// Response DTO for Guide's Own Experience
export class MyExperienceListItemDto {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  slug!: string;

  @Expose()
  shortDescription!: string;

  @Expose()
  @Type(() => MediaReferenceDto)
  coverImage!: MediaReferenceDto | null;

  @Expose()
  basePrice!: string;

  @Expose()
  currency!: Currency;

  @Expose()
  durationHours!: string;

  @Expose()
  minParticipants!: number;

  @Expose()
  maxParticipants!: number;

  @Expose()
  difficulty!: ExperienceDifficulty | null;

  @Expose()
  averageRating!: string;

  @Expose()
  totalReviews!: number;

  @Expose()
  status!: ExperienceStatus;

  @Expose()
  isActive!: boolean;

  @Expose()
  @Type(() => ExperienceCategoryResponseDto)
  category!: ExperienceCategoryResponseDto;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;

  @Expose()
  totalBookings!: number;

  @Expose()
  upcomingBookings!: number;
}

// Response wrapper for paginated experience list
export class ExperienceListResponseDto {
  @Expose()
  @Type(() => ExperienceListItemDto)
  items!: ExperienceListItemDto[];

  @Expose()
  total!: number;

  @Expose()
  page!: number;

  @Expose()
  limit!: number;

  @Expose()
  totalPages!: number;
}

// Response wrapper for my experiences list
export class MyExperienceListResponseDto {
  @Expose()
  @Type(() => MyExperienceListItemDto) // Teaches class-transformer how to instantiate items
  items!: MyExperienceListItemDto[];

  @Expose()
  total!: number;

  @Expose()
  page!: number;

  @Expose()
  limit!: number;

  @Expose()
  totalPages!: number;
}
