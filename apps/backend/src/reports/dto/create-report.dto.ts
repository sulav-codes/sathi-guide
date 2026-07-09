import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ReportTargetType, ReportReason } from '../../generated/prisma/client';

export { ReportTargetType, ReportReason };

export class CreateReportDto {
  @IsEnum(ReportTargetType)
  targetType!: ReportTargetType;

  @IsUUID()
  targetId!: string;

  @IsUUID()
  @IsOptional()
  targetUserId?: string;

  @IsEnum(ReportReason)
  reason!: ReportReason;

  @IsString()
  @IsOptional()
  detail?: string;
}
