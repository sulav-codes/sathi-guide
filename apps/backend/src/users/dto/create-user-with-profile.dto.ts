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
import { Role, Gender } from '../../generated/prisma/client';

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#^])[A-Za-z\d@$!%*?&\-_#^]+$/;

const PASSWORD_COMPLEXITY_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&-_#^)';

export class CreateUserWithProfileDto {
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

  @IsOptional()
  @IsEnum(Gender, {
    message: 'Gender must be one of: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY',
  })
  gender?: Gender;

  // Tourist fields
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Nationality must not exceed 100 characters' })
  nationality?: string;

  // Guide fields
  @IsOptional()
  experienceYears?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true, message: 'Each language must be a string' })
  @MaxLength(15, {
    each: true,
    message: 'Each language must not exceed 15 characters',
  })
  languagesSpoken?: string[];
}
