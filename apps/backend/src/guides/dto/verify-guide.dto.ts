import { IsString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { VerificationStatus } from '../../generated/prisma/client';

export class VerifyGuideDto {
  @IsEnum(VerificationStatus)
  status!: VerificationStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  documentsReviewed?: string[];
}

export class RejectGuideDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  note?: string;
}
