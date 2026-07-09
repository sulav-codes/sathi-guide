import type {
  ReportStatus,
  ReportTargetType,
  ReportReason,
  ResolutionAction,
} from '../generated/prisma/client';

export interface ReportWithRelations {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  detail: string | null;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
  reporter: {
    id: string;
    email: string;
    touristProfile: {
      fullName: string;
    } | null;
  };
  targetUser: {
    id: string;
    email: string;
    guideProfile: {
      fullName: string;
    } | null;
  } | null;
  resolvedAt: Date | null;
  resolvedById: string | null;
  resolutionNote: string | null;
  resolutionAction: ResolutionAction | null;
}
