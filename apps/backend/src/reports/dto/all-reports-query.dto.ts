import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import {
  ReportStatus,
  ReportTargetType,
  ReportReason,
} from '../../generated/prisma/client';

export { ReportStatus, ReportTargetType, ReportReason };

export class AllReportsQueryDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsEnum(ReportTargetType)
  targetType?: ReportTargetType;

  @IsOptional()
  @IsEnum(ReportReason)
  reason?: ReportReason;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;
}
