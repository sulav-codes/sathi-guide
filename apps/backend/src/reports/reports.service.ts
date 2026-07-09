import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportStatus, Prisma } from '../generated/prisma/client';
import type { ReportWithRelations } from './report-mapper.types';
import { CreateReportDto } from './dto/create-report.dto';
import { ResolveReportDto, DismissReportDto } from './dto/resolve-report.dto';
import { AllReportsQueryDto } from './dto/all-reports-query.dto';
import { MyReportsQueryDto } from './dto/my-reports-query.dto';
import {
  ReportResponseDto,
  ReportListResponseDto,
} from './dto/report-response.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /reports - Create a report
   */
  async create(
    reporterId: string,
    dto: CreateReportDto,
  ): Promise<ReportResponseDto> {
    const report = await this.prisma.report.create({
      data: {
        reporterId,
        targetType: dto.targetType,
        targetId: dto.targetId,
        targetUserId: dto.targetUserId,
        reason: dto.reason,
        detail: dto.detail,
        status: ReportStatus.PENDING,
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            touristProfile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        targetUser: {
          select: {
            id: true,
            email: true,
            guideProfile: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(report);
  }

  /**
   * GET /reports/my - Get my submitted reports
   */
  async findMyReports(
    reporterId: string,
    query: MyReportsQueryDto,
  ): Promise<ReportListResponseDto> {
    const { page, limit } = query;

    const where = {
      reporterId,
    };

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              touristProfile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          targetUser: {
            select: {
              id: true,
              email: true,
              guideProfile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page! - 1) * limit!,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    const items = reports.map((report) => this.mapToResponseDto(report));
    const totalPages = Math.ceil(total / limit!);

    return {
      items,
      total,
      page: page!,
      limit: limit!,
      totalPages,
    };
  }

  /**
   * GET /reports - Get all reports (admin only)
   */
  async findAll(query: AllReportsQueryDto): Promise<ReportListResponseDto> {
    const { status, targetType, reason, page, limit } = query;

    const where: Prisma.ReportWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (targetType) {
      where.targetType = targetType;
    }

    if (reason) {
      where.reason = reason;
    }

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: {
          reporter: {
            select: {
              id: true,
              email: true,
              touristProfile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
          targetUser: {
            select: {
              id: true,
              email: true,
              guideProfile: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page! - 1) * limit!,
        take: limit,
      }),
      this.prisma.report.count({ where }),
    ]);

    const items = reports.map((report) => this.mapToResponseDto(report));
    const totalPages = Math.ceil(total / limit!);

    return {
      items,
      total,
      page: page!,
      limit: limit!,
      totalPages,
    };
  }

  /**
   * PATCH /reports/:id/resolve - Resolve a report (admin only)
   */
  async resolve(
    adminId: string,
    reportId: string,
    dto: ResolveReportDto,
  ): Promise<ReportResponseDto> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status === ReportStatus.RESOLVED) {
      throw new ForbiddenException('This report has already been resolved');
    }

    const updatedReport = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedById: adminId,
        resolutionNote: dto.note,
        resolutionAction: dto.action,
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            touristProfile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        targetUser: {
          select: {
            id: true,
            email: true,
            guideProfile: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(updatedReport);
  }

  /**
   * PATCH /reports/:id/dismiss - Dismiss a report (admin only)
   */
  async dismiss(
    adminId: string,
    reportId: string,
    dto: DismissReportDto,
  ): Promise<ReportResponseDto> {
    const report = await this.prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status === ReportStatus.DISMISSED) {
      throw new ForbiddenException('This report has already been dismissed');
    }

    const updatedReport = await this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: ReportStatus.DISMISSED,
        resolvedAt: new Date(),
        resolvedById: adminId,
        resolutionNote: dto.reason,
      },
      include: {
        reporter: {
          select: {
            id: true,
            email: true,
            touristProfile: {
              select: {
                fullName: true,
              },
            },
          },
        },
        targetUser: {
          select: {
            id: true,
            email: true,
            guideProfile: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

    return this.mapToResponseDto(updatedReport);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapToResponseDto(report: ReportWithRelations): ReportResponseDto {
    return {
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      reason: report.reason,
      detail: report.detail,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
      updatedAt: report.updatedAt.toISOString(),
      reporter: {
        id: report.reporter.id,
        fullName: report.reporter.touristProfile?.fullName || 'Unknown',
        email: report.reporter.email,
      },
      targetUser: report.targetUser
        ? {
            id: report.targetUser.id,
            fullName: report.targetUser.guideProfile?.fullName || 'Unknown',
            email: report.targetUser.email,
          }
        : null,
      resolution: {
        resolvedAt: report.resolvedAt?.toISOString() || null,
        resolvedById: report.resolvedById,
        resolutionNote: report.resolutionNote,
        resolutionAction: report.resolutionAction,
      },
    };
  }
}
