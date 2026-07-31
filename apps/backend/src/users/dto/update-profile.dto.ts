import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender } from '../../generated/prisma/client';

// DTO for updating Tourist Profile
export class UpdateTouristProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyContactName?: string;

  @IsOptional()
  @IsPhoneNumber()
  emergencyContactPhone?: string;
}

// DTO for updating Guide Profile
export class UpdateGuideProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString({ each: true })
  @MaxLength(15, { each: true })
  languagesSpoken?: string[];

  @IsOptional()
  @Type(() => Number)
  @MaxLength(2)
  experienceYears?: number;
}

// DTO for updating Admin Profile
export class UpdateAdminProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;
}

// Main DTO for updating user profile
export class UpdateProfileDto {
  // Common fields that apply to all roles
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  // Role-specific profile updates
  @IsOptional()
  @ValidateIf((o: UpdateProfileDto) => o.touristProfile !== undefined)
  touristProfile?: UpdateTouristProfileDto;

  @IsOptional()
  @ValidateIf((o: UpdateProfileDto) => o.guideProfile !== undefined)
  guideProfile?: UpdateGuideProfileDto;

  @IsOptional()
  @ValidateIf((o: UpdateProfileDto) => o.adminProfile !== undefined)
  adminProfile?: UpdateAdminProfileDto;
}
