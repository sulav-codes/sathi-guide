import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum GuideSortBy {
  RATING = 'rating',
  EXPERIENCE = 'experience',
  REVIEWS = 'reviews',
  PRICE = 'price',
  NEWEST = 'newest',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GuideListQueryDto {
  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  expertise?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minRating?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxRating?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsEnum(GuideSortBy)
  sortBy?: GuideSortBy = GuideSortBy.RATING;

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
