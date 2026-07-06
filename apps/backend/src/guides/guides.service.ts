import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, VerificationStatus } from '../generated/prisma/client';
import {
  GuideListQueryDto,
  GuideSortBy,
  SortOrder,
} from './dto/guide-list-query.dto';
import {
  GuideListItemDto,
  GuideDetailResponseDto,
  GuidePrivateProfileDto,
  GuideListResponseDto,
  PendingGuideResponseDto,
} from './dto/guide-response.dto';
import { CreateGuideProfileDto } from './dto/create-guide-profile.dto';
import { UpdateGuideProfileDto } from './dto/update-guide-profile.dto';
import {
  CreateAvailabilityDto,
  CreateBlockedPeriodDto,
} from './dto/availability.dto';
import { VerifyGuideDto } from './dto/verify-guide.dto';
import { PendingGuidesQueryDto } from './dto/pending-guides-query.dto';

@Injectable()
export class GuidesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  /**
   * GET /guides - List all approved guides with filters
   */
  async findAll(query: GuideListQueryDto): Promise<GuideListResponseDto> {
    const {
      location,
      city,
      expertise,
      categoryId,
      minRating,
      maxRating,
      minPrice,
      maxPrice,
      language,
      sortBy = GuideSortBy.RATING,
      order = SortOrder.DESC,
      page = 1,
      limit = 20,
    } = query;

    // Build where clause
    const where: any = {
      currentVerificationStatus: VerificationStatus.APPROVED,
      user: {
        isActive: true,
        isBanned: false,
        deletedAt: null,
      },
    };

    // Location filters
    if (city || location) {
      where.location = {
        location: {
          city: city || location,
        },
      };
    }

    // Rating filter
    if (minRating !== undefined || maxRating !== undefined) {
      where.averageRating = {};
      if (minRating !== undefined) {
        where.averageRating.gte = minRating;
      }
      if (maxRating !== undefined) {
        where.averageRating.lte = maxRating;
      }
    }

    // Language filter
    if (language) {
      where.languagesSpoken = {
        has: language,
      };
    }

    // Expertise/Category filter
    let expertiseFilter: any = {};
    if (categoryId) {
      expertiseFilter = {
        some: {
          categoryId,
        },
      };
    }
    if (expertise) {
      expertiseFilter = {
        some: {
          category: {
            slug: expertise,
          },
        },
      };
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case GuideSortBy.RATING:
        orderBy = { averageRating: order };
        break;
      case GuideSortBy.EXPERIENCE:
        orderBy = { experienceYears: order };
        break;
      case GuideSortBy.REVIEWS:
        orderBy = { totalReviews: order };
        break;
      case GuideSortBy.NEWEST:
        orderBy = { createdAt: order };
        break;
      default:
        orderBy = { averageRating: SortOrder.DESC };
    }

    // Execute query
    const [guides, total] = await Promise.all([
      this.prisma.guideProfile.findMany({
        where: {
          ...where,
          ...expertiseFilter,
        },
        include: {
          user: {
            select: {
              avatarId: true,
            },
          },
          location: {
            include: {
              location: true,
            },
          },
          expertiseCategories: {
            include: {
              category: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.guideProfile.count({
        where: {
          ...where,
          ...expertiseFilter,
        },
      }),
    ]);

    // Map to response DTOs
    const items = guides.map((guide) => this.mapToListItem(guide));
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * GET /guides/:id - Get specific guide public profile
   */
  async findOne(id: string): Promise<GuideDetailResponseDto> {
    const guide = await this.prisma.guideProfile.findFirst({
      where: {
        id,
        currentVerificationStatus: VerificationStatus.APPROVED,
        user: {
          isActive: true,
          isBanned: false,
          deletedAt: null,
        },
      },
      include: {
        user: {
          select: {
            avatarId: true,
            createdAt: true,
          },
        },
        location: {
          include: {
            location: true,
          },
        },
        expertiseCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!guide) {
      throw new NotFoundException(`Guide with ID "${id}" not found`);
    }

    // Get review summary
    const reviewStats = await this.prisma.review.groupBy({
      by: ['overallRating'],
      where: {
        subjectId: guide.userId,
        status: 'VISIBLE',
      },
      _count: {
        overallRating: true,
      },
    });

    const totalReviews = reviewStats.reduce((sum, stat) => sum + stat._count.overallRating, 0);
    const averageRating = totalReviews > 0
      ? reviewStats.reduce((sum, stat) => sum + (stat.overallRating * stat._count.overallRating), 0) / totalReviews
      : 0;

    return this.mapToDetailResponse(guide, {
      totalReviews,
      averageRating,
      reviewDistribution: {
        fiveStar: reviewStats.find(r => r.overallRating === 5)?._count.overallRating || 0,
        fourStar: reviewStats.find(r => r.overallRating === 4)?._count.overallRating || 0,
        threeStar: reviewStats.find(r => r.overallRating === 3)?._count.overallRating || 0,
        twoStar: reviewStats.find(r => r.overallRating === 2)?._count.overallRating || 0,
        oneStar: reviewStats.find(r => r.overallRating === 1)?._count.overallRating || 0,
      },
    });
  }

  // ============================================================================
  // GUIDE-ONLY ENDPOINTS
  // ============================================================================

  /**
   * Get guide's own profile (private data)
   */
  async getMyProfile(userId: string): Promise<GuidePrivateProfileDto> {
    const guide = await this.prisma.guideProfile.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            avatarId: true,
            isEmailVerified: true,
            isPhoneVerified: true,
            createdAt: true,
          },
        },
        location: {
          include: {
            location: true,
          },
        },
        expertiseCategories: {
          include: {
            category: true,
          },
        },
      },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    // Get review stats
    const reviewStats = await this.prisma.review.groupBy({
      by: ['overallRating'],
      where: {
        subjectId: guide.userId,
        status: 'VISIBLE',
      },
      _count: {
        overallRating: true,
      },
    });

    const totalReviews = reviewStats.reduce((sum, stat) => sum + stat._count.overallRating, 0);
    const averageRating = totalReviews > 0
      ? reviewStats.reduce((sum, stat) => sum + (stat.overallRating * stat._count.overallRating), 0) / totalReviews
      : 0;

    return {
      ...this.mapToDetailResponse(guide, {
        totalReviews,
        averageRating,
        reviewDistribution: {
          fiveStar: reviewStats.find(r => r.overallRating === 5)?._count.overallRating || 0,
          fourStar: reviewStats.find(r => r.overallRating === 4)?._count.overallRating || 0,
          threeStar: reviewStats.find(r => r.overallRating === 3)?._count.overallRating || 0,
          twoStar: reviewStats.find(r => r.overallRating === 2)?._count.overallRating || 0,
          oneStar: reviewStats.find(r => r.overallRating === 1)?._count.overallRating || 0,
        },
      }),
      pendingPayout: guide.pendingPayout.toString(),
      email: guide.user.email,
      phone: guide.user.phone,
      isEmailVerified: guide.user.isEmailVerified,
      isPhoneVerified: guide.user.isPhoneVerified,
    } as GuidePrivateProfileDto;
  }

  /**
   * POST /guides/profile - Create guide profile (when user upgrades to guide role)
   */
  async createProfile(
    userId: string,
    dto: CreateGuideProfileDto,
  ): Promise<GuidePrivateProfileDto> {
    // Check if user already has a guide profile
    const existingProfile = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Guide profile already exists for this user');
    }

    // Check if user exists and get current role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create guide profile in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Update user role to GUIDE if not already
      if (user.role !== Role.GUIDE) {
        await tx.user.update({
          where: { id: userId },
          data: { role: Role.GUIDE },
        });
      }

      // Create location
      const location = await tx.location.create({
        data: {
          latitude: dto.location.latitude,
          longitude: dto.location.longitude,
          addressLine: dto.location.addressLine,
          city: dto.location.city,
          district: dto.location.district,
          province: dto.location.province,
          country: dto.location.country || 'Nepal',
        },
      });

      // Create guide profile
      const profile = await tx.guideProfile.create({
        data: {
          userId,
          fullName: dto.fullName,
          displayName: dto.displayName,
          bio: dto.bio,
          gender: dto.gender,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
          languagesSpoken: dto.languagesSpoken,
          experienceYears: dto.experienceYears || 0,
          location: {
            create: {
              locationId: location.id,
            },
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              avatarId: true,
              isEmailVerified: true,
              isPhoneVerified: true,
              createdAt: true,
            },
          },
          location: {
            include: {
              location: true,
            },
          },
          expertiseCategories: {
            include: {
              category: true,
            },
          },
        },
      });

      // Create guide expertise entries
      if (dto.expertise && dto.expertise.length > 0) {
        await tx.guideExpertise.createMany({
          data: dto.expertise.map((exp) => ({
            guideProfileId: profile.id,
            categoryId: exp.categoryId,
            yearsOfExperience: exp.yearsOfExperience,
          })),
        });
      }

      return profile;
    });

    return this.getMyProfile(userId);
  }

  /**
   * PATCH /guides/profile - Update guide profile
   */
  async updateProfile(
    userId: string,
    dto: UpdateGuideProfileDto,
  ): Promise<GuidePrivateProfileDto> {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    await this.prisma.guideProfile.update({
      where: { userId },
      data: {
        fullName: dto.fullName,
        displayName: dto.displayName,
        bio: dto.bio,
        gender: dto.gender,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        languagesSpoken: dto.languagesSpoken,
        experienceYears: dto.experienceYears,
      },
    });

    return this.getMyProfile(userId);
  }

  /**
   * POST /guides/expertise - Add expertise to guide profile
   */
  async addExpertise(
    userId: string,
    categoryId: string,
    yearsOfExperience?: number,
  ): Promise<void> {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    // Check if category exists
    const category = await this.prisma.expertiseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException('Expertise category not found');
    }

    // Check if already has this expertise
    const existingExpertise = await this.prisma.guideExpertise.findUnique({
      where: {
        guideProfileId_categoryId: {
          guideProfileId: profile.id,
          categoryId,
        },
      },
    });

    if (existingExpertise) {
      throw new ConflictException('Guide already has this expertise');
    }

    await this.prisma.guideExpertise.create({
      data: {
        guideProfileId: profile.id,
        categoryId,
        yearsOfExperience,
      },
    });
  }

  /**
   * DELETE /guides/expertise/:categoryId - Remove expertise from guide profile
   */
  async removeExpertise(userId: string, categoryId: string): Promise<void> {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    await this.prisma.guideExpertise.deleteMany({
      where: {
        guideProfileId: profile.id,
        categoryId,
      },
    });
  }

  /**
   * PATCH /guides/location - Update guide location
   */
  async updateLocation(
    userId: string,
    locationData: {
      latitude: number;
      longitude: number;
      city: string;
      district: string;
      province?: string;
      country?: string;
      addressLine?: string;
    },
  ): Promise<void> {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { userId },
      include: {
        location: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // If location exists, update it; otherwise create new location
      if (profile.location) {
        await tx.location.update({
          where: { id: profile.location.locationId },
          data: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            city: locationData.city,
            district: locationData.district,
            province: locationData.province,
            country: locationData.country || 'Nepal',
            addressLine: locationData.addressLine,
          },
        });
      } else {
        const newLocation = await tx.location.create({
          data: {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            city: locationData.city,
            district: locationData.district,
            province: locationData.province,
            country: locationData.country || 'Nepal',
            addressLine: locationData.addressLine,
          },
        });

        await tx.guideLocation.create({
          data: {
            guideProfileId: profile.id,
            locationId: newLocation.id,
          },
        });
      }
    });
  }

  // ============================================================================
  // AVAILABILITY & BLOCKED PERIODS
  // ============================================================================

  /**
   * POST /guides/blocked-periods - Create blocked period
   */
  async createBlockedPeriod(
    userId: string,
    dto: CreateBlockedPeriodDto,
  ): Promise<void> {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    await this.prisma.guideBlockedPeriod.create({
      data: {
        guideProfileId: profile.id,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
      },
    });
  }

  /**
   * GET /guides/blocked-periods - Get guide's blocked periods
   */
  async getBlockedPeriods(userId: string): Promise<any[]> {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    const periods = await this.prisma.guideBlockedPeriod.findMany({
      where: {
        guideProfileId: profile.id,
        endDate: {
          gte: new Date(), // Only return future and current blocked periods
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return periods.map(period => ({
      id: period.id,
      startDate: period.startDate.toISOString().split('T')[0],
      endDate: period.endDate.toISOString().split('T')[0],
      reason: period.reason,
    }));
  }

  /**
   * DELETE /guides/blocked-periods/:id - Delete blocked period
   */
  async deleteBlockedPeriod(userId: string, periodId: string): Promise<void> {
    const profile = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Guide profile not found');
    }

    const period = await this.prisma.guideBlockedPeriod.findFirst({
      where: {
        id: periodId,
        guideProfileId: profile.id,
      },
    });

    if (!period) {
      throw new NotFoundException('Blocked period not found');
    }

    await this.prisma.guideBlockedPeriod.delete({
      where: { id: periodId },
    });
  }

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  /**
   * GET /guides/pending - List guides awaiting verification (admin)
   */
  async findPending(
    query: PendingGuidesQueryDto,
  ): Promise<{ items: PendingGuideResponseDto[]; total: number }> {
    const { status, page = 1, limit = 20 } = query;

    const where: any = {
      currentVerificationStatus: status || VerificationStatus.PENDING,
    };

    const [guides, total] = await Promise.all([
      this.prisma.guideProfile.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              createdAt: true,
            },
          },
          idDocuments: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.guideProfile.count({ where }),
    ]);

    const items = guides.map((guide) => ({
      id: guide.id,
      userId: guide.userId,
      fullName: guide.fullName,
      displayName: guide.displayName,
      email: guide.user.email,
      submittedAt: guide.createdAt.toISOString(),
      currentVerificationStatus: guide.currentVerificationStatus,
      documentCount: guide.idDocuments.length,
    }));

    return { items, total };
  }

  /**
   * PATCH /guides/:id/approve - Approve guide verification (admin)
   */
  async approveGuide(
    guideId: string,
    adminId: string,
    dto: VerifyGuideDto,
  ): Promise<void> {
    const guide = await this.prisma.guideProfile.findUnique({
      where: { id: guideId },
    });

    if (!guide) {
      throw new NotFoundException('Guide not found');
    }

    if (guide.currentVerificationStatus === VerificationStatus.APPROVED) {
      throw new ConflictException('Guide is already approved');
    }

    await this.prisma.$transaction(async (tx) => {
      // Update guide profile status
      await tx.guideProfile.update({
        where: { id: guideId },
        data: {
          currentVerificationStatus: VerificationStatus.APPROVED,
        },
      });

      // Create verification log entry
      await tx.guideVerification.create({
        data: {
          guideProfileId: guideId,
          status: VerificationStatus.APPROVED,
          note: dto.note,
          reviewedById: adminId,
          documentsReviewed: dto.documentsReviewed || [],
        },
      });
    });
  }

  /**
   * PATCH /guides/:id/reject - Reject guide verification (admin)
   */
  async rejectGuide(
    guideId: string,
    adminId: string,
    dto: VerifyGuideDto,
  ): Promise<void> {
    const guide = await this.prisma.guideProfile.findUnique({
      where: { id: guideId },
    });

    if (!guide) {
      throw new NotFoundException('Guide not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Update guide profile status
      await tx.guideProfile.update({
        where: { id: guideId },
        data: {
          currentVerificationStatus: VerificationStatus.REJECTED,
        },
      });

      // Create verification log entry
      await tx.guideVerification.create({
        data: {
          guideProfileId: guideId,
          status: VerificationStatus.REJECTED,
          note: dto.note,
          reviewedById: adminId,
          documentsReviewed: dto.documentsReviewed || [],
        },
      });
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapToListItem(guide: any): GuideListItemDto {
    return {
      id: guide.id,
      fullName: guide.fullName,
      displayName: guide.displayName,
      bio: guide.bio,
      avatarUrl: guide.user?.avatarId || null,
      gender: guide.gender,
      languagesSpoken: guide.languagesSpoken,
      experienceYears: guide.experienceYears,
      totalTripsCompleted: guide.totalTripsCompleted,
      averageRating: guide.averageRating.toString(),
      totalReviews: guide.totalReviews,
      currentVerificationStatus: guide.currentVerificationStatus,
      location: guide.location
        ? {
            city: guide.location.location.city,
            district: guide.location.location.district,
            province: guide.location.location.province,
            country: guide.location.location.country,
            latitude: guide.location.location.latitude.toString(),
            longitude: guide.location.location.longitude.toString(),
          }
        : null,
      expertise: guide.expertiseCategories.map((exp: any) => ({
        categoryId: exp.categoryId,
        categoryName: exp.category.name,
        categorySlug: exp.category.slug,
        yearsOfExperience: exp.yearsOfExperience,
      })),
      basePrice: null, // Will be populated from experiences
      currency: null,
    };
  }

  private mapToDetailResponse(
    guide: any,
    reviewStats: {
      totalReviews: number;
      averageRating: number;
      reviewDistribution: {
        fiveStar: number;
        fourStar: number;
        threeStar: number;
        twoStar: number;
        oneStar: number;
      };
    },
  ): GuideDetailResponseDto {
    const base = this.mapToListItem(guide);

    return {
      ...base,
      dateOfBirth: guide.dateOfBirth?.toISOString() || null,
      totalEarnings: guide.totalEarnings.toString(),
      reviewSummary: {
        averageRating: reviewStats.averageRating,
        totalReviews: reviewStats.totalReviews,
        fiveStar: reviewStats.reviewDistribution.fiveStar,
        fourStar: reviewStats.reviewDistribution.fourStar,
        threeStar: reviewStats.reviewDistribution.threeStar,
        twoStar: reviewStats.reviewDistribution.twoStar,
        oneStar: reviewStats.reviewDistribution.oneStar,
      },
      createdAt: guide.createdAt.toISOString(),
    };
  }
}
