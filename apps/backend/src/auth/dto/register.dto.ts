import { Role } from '../../generated/prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#^])[A-Za-z\d@$!%*?&\-_#^]+$/;

const PASSWORD_COMPLEXITY_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&-_#^)';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100, { message: 'Full name must not exceed 100 characters' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Full name can only contain letters and spaces',
  })
  fullName!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(254, { message: 'Email must not exceed 254 characters' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  @Matches(PASSWORD_REGEX, { message: PASSWORD_COMPLEXITY_MESSAGE })
  password!: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be one of: TOURIST, GUIDE' })
  role?: Role;

  @IsOptional()
  @IsPhoneNumber(undefined, {
    message: 'Please provide a valid phone number in international format',
  })
  phone?: string;

  // Tourist fields

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nationality must not exceed 100 characters' })
  nationality?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Preferred language must not exceed 100 characters',
  })
  preferredLanguage?: string;

  @IsOptional()
  @IsPhoneNumber(undefined, {
    message:
      'Please provide a valid emergency contact number in international format',
  })
  @MaxLength(100, {
    message: 'Emergency contact must not exceed 100 characters',
  })
  emergencyContact?: string;

  // Guide fields
  @IsOptional()
  citizenshipNumber?: string;

  @IsOptional()
  citizenshipImage?: string;

  @IsOptional()
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  languagesSpoken?: string[];

  @IsOptional()
  currentLocation?: string;
}
