import {
  IsString,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsUUID()
  experienceId!: string;

  @IsDateString()
  tripDate!: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  durationHours?: number;

  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  groupSize!: number;

  @IsOptional()
  @IsString()
  touristNote?: string;

  @IsOptional()
  @IsUUID()
  pricingRuleId?: string;

  @IsOptional()
  @IsString()
  promoCode?: string;
}
