import { Exclude, Expose, Type } from 'class-transformer';
import {
  ReportStatus,
  ReportTargetType,
  ReportReason,
} from '../../generated/prisma/client';

// Response DTO for Report Reporter
@Exclude()
export class ReportReporterResponseDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  email!: string;
}

// Response DTO for Report Target User
@Exclude()
export class ReportTargetUserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  fullName!: string;

  @Expose()
  email!: string;
}

// Response DTO for Report Resolution
@Exclude()
export class ReportResolutionResponseDto {
  @Expose()
  resolvedAt!: string | null;

  @Expose()
  resolvedById!: string | null;

  @Expose()
  resolutionNote!: string | null;

  @Expose()
  resolutionAction!: string | null;
}

// Main Response DTO for Report
@Exclude()
export class ReportResponseDto {
  @Expose()
  id!: string;

  @Expose()
  targetType!: ReportTargetType;

  @Expose()
  targetId!: string;

  @Expose()
  reason!: ReportReason;

  @Expose()
  detail!: string | null;

  @Expose()
  status!: ReportStatus;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;

  @Expose()
  @Type(() => ReportReporterResponseDto)
  reporter!: ReportReporterResponseDto;

  @Expose()
  @Type(() => ReportTargetUserResponseDto)
  targetUser!: ReportTargetUserResponseDto | null;

  @Expose()
  @Type(() => ReportResolutionResponseDto)
  resolution!: ReportResolutionResponseDto;
}

// Response wrapper for paginated report list
export class ReportListResponseDto {
  items!: ReportResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}
