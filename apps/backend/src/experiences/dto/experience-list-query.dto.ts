import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExperienceDifficulty } from '../../generated/prisma/client';

export enum ExperienceSortBy {
  PRICE = 'price',
  RATING = 'rating',
  DURATION = 'duration',
  NEWEST = 'newest',
  POPULARITY = 'popularity',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ExperienceListQueryDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  guideId?: string;

  @IsOptional()
  @IsString()
  destinationId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minDuration?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxDuration?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minRating?: number;

  @IsOptional()
  @IsEnum(ExperienceDifficulty)
  difficulty?: ExperienceDifficulty;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsDateString()
  availableDate?: string;

  @IsOptional()
  @IsEnum(ExperienceSortBy)
  sortBy?: ExperienceSortBy = ExperienceSortBy.POPULARITY;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  limit?: number = 20;
}
