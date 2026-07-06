import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ExperienceStatus } from '../../generated/prisma/client';

export class UpdateExperienceStatusDto {
  @IsEnum(ExperienceStatus)
  status!: ExperienceStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
