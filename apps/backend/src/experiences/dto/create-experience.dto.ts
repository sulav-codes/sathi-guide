import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsInt,
  Min,
  Max,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ExperienceDifficulty,
  PricingUnit,
  Currency,
} from '../../generated/prisma/client';

export class CreateLocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsString()
  city!: string;

  @IsString()
  district!: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

export class CreatePricingRuleDto {
  @IsString()
  name!: string;

  @IsEnum(PricingUnit)
  unit!: PricingUnit;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.NPR;

  @IsOptional()
  @IsInt()
  @Min(1)
  minGroupSize?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxGroupSize?: number;
}

export class CreateExperienceDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsString()
  shortDescription!: string;

  @IsString()
  description!: string;

  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsString()
  destinationId?: string;

  @IsOptional()
  @IsEnum(ExperienceDifficulty)
  difficulty?: ExperienceDifficulty;

  @IsNumber()
  @Min(0.5)
  durationHours!: number;

  @IsInt()
  @Min(1)
  minParticipants!: number;

  @IsInt()
  @Min(1)
  maxParticipants!: number;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  languagesOffered!: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  inclusions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exclusions?: string[];

  @IsOptional()
  @IsString()
  cancellationPolicy?: string;

  @IsOptional()
  @IsString()
  coverImageId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  imageIds?: string[];

  @ValidateNested()
  @Type(() => CreateLocationDto)
  location!: CreateLocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  meetingLocation?: CreateLocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePricingRuleDto)
  @ArrayMinSize(1)
  pricingRules!: CreatePricingRuleDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;
}
