import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Currency } from '../../generated/prisma/client';
import {
  CreateLocationDto,
  CreatePricingRuleDto,
} from './create-experience.dto';

/** PATCH /experiences/:id/location */
export class UpdateExperienceLocationDto {
  @ValidateNested()
  @Type(() => CreateLocationDto)
  location!: CreateLocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLocationDto)
  meetingLocation?: CreateLocationDto;
}

/** PATCH /experiences/:id/pricing */
export class UpdateExperiencePricingDto {
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

/** POST /experiences/:id/images */
export class AddExperienceImageDto {
  /** The media record ID returned after confirming the upload */
  @IsString()
  @IsNotEmpty()
  mediaId!: string;

  /** Explicit order position. If not provided, appended at the end. */
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
