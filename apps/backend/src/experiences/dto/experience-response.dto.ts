import { Exclude, Expose, Type } from 'class-transformer';
import {
  ExperienceStatus,
  ExperienceDifficulty,
  PricingUnit,
  Currency,
} from '../../generated/prisma/client';

// Response DTO for Experience Guide (nested)
@Exclude()
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

// Response DTO for Experience Category
@Exclude()
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
@Exclude()
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
@Exclude()
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
@Exclude()
export class ExperienceImageResponseDto {
  @Expose()
  id!: string;

  @Expose()
  mediaId!: string;

  @Expose()
  displayOrder!: number;
}

// Response DTO for Experience List Item (public)
@Exclude()
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
  coverImageId!: string | null;

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
@Exclude()
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
  @Type(() => ExperiencePricingRuleResponseDto)
  pricingRules!: ExperiencePricingRuleResponseDto[];

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;
}

// Response DTO for Guide's Own Experience
@Exclude()
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
  coverImageId!: string | null;

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
  items!: ExperienceListItemDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

// Response wrapper for my experiences list
export class MyExperienceListResponseDto {
  items!: MyExperienceListItemDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
