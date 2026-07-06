import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  IsDateString,
  Min,
  Max,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../generated/prisma/client';

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

export class CreateGuideExpertiseDto {
  @IsString()
  categoryId!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsOfExperience?: number;
}

export class CreateGuideProfileDto {
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  languagesSpoken!: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  experienceYears?: number;

  @ValidateNested()
  @Type(() => CreateLocationDto)
  location!: CreateLocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGuideExpertiseDto)
  expertise!: CreateGuideExpertiseDto[];
}
