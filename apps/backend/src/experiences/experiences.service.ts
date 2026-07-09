import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExperienceStatus, Prisma } from '../generated/prisma/client';
import type {
  ExperienceWithRelations,
  ExperienceDetailWithRelations,
} from './experience-mapper.types';
import {
  ExperienceListQueryDto,
  ExperienceSortBy,
  SortOrder,
} from './dto/experience-list-query.dto';
import {
  ExperienceListItemDto,
  ExperienceDetailResponseDto,
  ExperienceListResponseDto,
  MyExperienceListResponseDto,
} from './dto/experience-response.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperiencesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // PUBLIC ENDPOINTS
  // ============================================================================

  /**
   * GET /experiences - List all published experiences with filters
   */
  async findAll(
    query: ExperienceListQueryDto,
  ): Promise<ExperienceListResponseDto> {
    const {
      categoryId,
      minPrice,
      maxPrice,
      minDuration,
      maxDuration,
      minRating,
      difficulty,
      language,
      sortBy = ExperienceSortBy.POPULARITY,
      order = SortOrder.DESC,
      page = 1,
      limit = 20,
    } = query;

    // Build where clause
    const where: Prisma.ExperienceWhereInput = {
      status: ExperienceStatus.PUBLISHED,
      isActive: true,
    };

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Price filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) {
        where.basePrice.gte = new Prisma.Decimal(minPrice);
      }
      if (maxPrice !== undefined) {
        where.basePrice.lte = new Prisma.Decimal(maxPrice);
      }
    }

    // Duration filter
    if (minDuration !== undefined || maxDuration !== undefined) {
      where.durationHours = {};
      if (minDuration !== undefined) {
        where.durationHours.gte = new Prisma.Decimal(minDuration);
      }
      if (maxDuration !== undefined) {
        where.durationHours.lte = new Prisma.Decimal(maxDuration);
      }
    }

    // Rating filter
    if (minRating !== undefined) {
      where.averageRating = {
        gte: new Prisma.Decimal(minRating),
      };
    }

    // Difficulty filter
    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Language filter
    if (language) {
      where.languagesOffered = {
        has: language,
      };
    }

    // Build orderBy
    let orderBy: Prisma.ExperienceOrderByWithRelationInput = {};
    switch (sortBy) {
      case ExperienceSortBy.PRICE:
        orderBy = { basePrice: order };
        break;
      case ExperienceSortBy.RATING:
        orderBy = { averageRating: order };
        break;
      case ExperienceSortBy.DURATION:
        orderBy = { durationHours: order };
        break;
      case ExperienceSortBy.NEWEST:
        orderBy = { createdAt: order };
        break;
      case ExperienceSortBy.POPULARITY:
      default:
        orderBy = { totalReviews: SortOrder.DESC };
        break;
    }

    // Execute query
    const [experiences, total] = await Promise.all([
      this.prisma.experience.findMany({
        where,
        include: {
          category: true,
          location: true,
          guideProfile: {
            include: {
              user: {
                select: {
                  avatarId: true,
                },
              },
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.experience.count({ where }),
    ]);

    // Map to response DTOs
    const items = experiences.map((exp) => this.mapToListItem(exp));
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
   * GET /experiences/:id - Get specific experience public detail
   */
  async findOne(id: string): Promise<ExperienceDetailResponseDto> {
    const experience = await this.prisma.experience.findFirst({
      where: {
        id,
        status: ExperienceStatus.PUBLISHED,
        isActive: true,
      },
      include: {
        category: true,
        location: true,
        meetingLocation: true,
        guideProfile: {
          include: {
            user: {
              select: {
                avatarId: true,
              },
            },
          },
        },
        images: {
          include: {
            media: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        pricingRules: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!experience) {
      throw new NotFoundException(`Experience with ID "${id}" not found`);
    }

    return this.mapToDetailResponse(experience);
  }

  // ============================================================================
  // GUIDE-ONLY ENDPOINTS
  // ============================================================================

  /**
   * GET /experiences/my - Get current guide's experiences
   */
  async findMyExperiences(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<MyExperienceListResponseDto> {
    // Get guide profile
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    const [experiences, total] = await Promise.all([
      this.prisma.experience.findMany({
        where: {
          guideProfileId: guide.id,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.experience.count({
        where: {
          guideProfileId: guide.id,
        },
      }),
    ]);

    // Get booking counts for each experience
    const items = await Promise.all(
      experiences.map(async (exp) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [totalBookings, upcomingBookings] = await Promise.all([
          this.prisma.booking.count({
            where: {
              experienceId: exp.id,
            },
          }),
          this.prisma.booking.count({
            where: {
              experienceId: exp.id,
              tripDate: {
                gte: today,
              },
              stateLog: {
                some: {
                  toStatus: 'CONFIRMED',
                },
              },
            },
          }),
        ]);

        return {
          id: exp.id,
          title: exp.title,
          slug: exp.slug,
          shortDescription: exp.shortDescription,
          coverImageId: exp.coverImageId,
          basePrice: exp.basePrice.toString(),
          currency: exp.currency,
          durationHours: exp.durationHours.toString(),
          minParticipants: exp.minParticipants,
          maxParticipants: exp.maxParticipants,
          difficulty: exp.difficulty,
          averageRating: exp.averageRating.toString(),
          totalReviews: exp.totalReviews,
          status: exp.status,
          isActive: exp.isActive,
          category: exp.category,
          createdAt: exp.createdAt.toISOString(),
          updatedAt: exp.updatedAt.toISOString(),
          totalBookings,
          upcomingBookings,
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // ============================================================================
  // PUBLIC UTILITY ENDPOINTS
  // ============================================================================

  /**
   * GET /experiences/categories - List all active expertise categories
   */
  async getCategories() {
    return this.prisma.expertiseCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        iconKey: true,
      },
    });
  }


  /**
   * POST /experiences - Create new experience (guide)
   */
  async create(
    userId: string,
    dto: CreateExperienceDto,
  ): Promise<ExperienceDetailResponseDto> {
    // Get guide profile
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    // Verify category exists
    const category = await this.prisma.expertiseCategory.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Generate slug if not provided
    const slug =
      dto.slug ||
      dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Calculate base price from pricing rules
    const basePrice =
      dto.basePrice ||
      (dto.pricingRules && dto.pricingRules.length > 0
        ? dto.pricingRules[0].amount
        : 0);

    // Create experience in transaction
    const experience = await this.prisma.$transaction(async (tx) => {
      // Create main location
      const location = await tx.location.create({
        data: {
          latitude: new Prisma.Decimal(dto.location.latitude),
          longitude: new Prisma.Decimal(dto.location.longitude),
          addressLine: dto.location.addressLine,
          city: dto.location.city,
          district: dto.location.district,
          province: dto.location.province,
          country: dto.location.country || 'Nepal',
        },
      });

      // Create meeting location if provided
      let meetingLocationId: string | undefined;
      if (dto.meetingLocation) {
        const meetingLocation = await tx.location.create({
          data: {
            latitude: new Prisma.Decimal(dto.meetingLocation.latitude),
            longitude: new Prisma.Decimal(dto.meetingLocation.longitude),
            addressLine: dto.meetingLocation.addressLine,
            city: dto.meetingLocation.city,
            district: dto.meetingLocation.district,
            province: dto.meetingLocation.province,
            country: dto.meetingLocation.country || 'Nepal',
          },
        });
        meetingLocationId = meetingLocation.id;
      }

      // Create experience
      const newExperience = await tx.experience.create({
        data: {
          title: dto.title,
          slug,
          shortDescription: dto.shortDescription,
          description: dto.description,
          categoryId: dto.categoryId,
          destinationId: dto.destinationId,
          difficulty: dto.difficulty,
          durationHours: new Prisma.Decimal(dto.durationHours),
          minParticipants: dto.minParticipants,
          maxParticipants: dto.maxParticipants,
          languagesOffered: dto.languagesOffered,
          inclusions: dto.inclusions || [],
          exclusions: dto.exclusions || [],
          cancellationPolicy: dto.cancellationPolicy,
          coverImageId: dto.coverImageId,
          basePrice: new Prisma.Decimal(basePrice),
          currency: dto.currency || 'NPR',
          guideProfileId: guide.id,
          locationId: location.id,
          meetingLocationId,
        },
        include: {
          category: true,
          location: true,
          meetingLocation: true,
          guideProfile: {
            include: {
              user: {
                select: {
                  avatarId: true,
                },
              },
            },
          },
          images: {
            include: {
              media: true,
            },
          },
          pricingRules: true,
        },
      });

      // Create pricing rules
      if (dto.pricingRules && dto.pricingRules.length > 0) {
        await tx.experiencePricingRule.createMany({
          data: dto.pricingRules.map((rule) => ({
            experienceId: newExperience.id,
            name: rule.name,
            unit: rule.unit,
            amount: new Prisma.Decimal(rule.amount),
            currency: rule.currency || 'NPR',
            minGroupSize: rule.minGroupSize,
            maxGroupSize: rule.maxGroupSize,
            isActive: true,
          })),
        });
      }

      // Create experience images
      if (dto.imageIds && dto.imageIds.length > 0) {
        await tx.experienceImage.createMany({
          data: dto.imageIds.map((mediaId, index) => ({
            experienceId: newExperience.id,
            mediaId,
            displayOrder: index,
          })),
        });
      }

      return newExperience;
    });

    // Fetch complete experience with all relations for response
    return this.findOne(experience.id);
  }

  /**
   * PATCH /experiences/:id - Update experience (guide)
   */
  async update(
    userId: string,
    id: string,
    dto: UpdateExperienceDto,
  ): Promise<ExperienceDetailResponseDto> {
    // Get guide profile
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    // Verify experience exists and belongs to this guide
    const existingExperience = await this.prisma.experience.findFirst({
      where: {
        id,
        guideProfileId: guide.id,
      },
    });

    if (!existingExperience) {
      throw new NotFoundException(
        'Experience not found or you do not have permission to update it',
      );
    }

    // Update slug if title changed
    let slug = existingExperience.slug;
    if (dto.title && dto.title !== existingExperience.title) {
      slug = dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    // Update experience
    const updatedExperience = await this.prisma.experience.update({
      where: { id },
      data: {
        title: dto.title,
        slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        difficulty: dto.difficulty,
        durationHours: dto.durationHours
          ? new Prisma.Decimal(dto.durationHours)
          : undefined,
        minParticipants: dto.minParticipants,
        maxParticipants: dto.maxParticipants,
        languagesOffered: dto.languagesOffered,
        inclusions: dto.inclusions,
        exclusions: dto.exclusions,
        cancellationPolicy: dto.cancellationPolicy,
        coverImageId: dto.coverImageId,
      },
      include: {
        category: true,
        location: true,
        meetingLocation: true,
        guideProfile: {
          include: {
            user: {
              select: {
                avatarId: true,
              },
            },
          },
        },
        images: {
          include: {
            media: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        pricingRules: {
          where: {
            isActive: true,
          },
        },
      },
    });

    return this.mapToDetailResponse(updatedExperience);
  }

  /**
   * DELETE /experiences/:id - Delete experience (guide)
   */
  async remove(userId: string, id: string): Promise<void> {
    // Get guide profile
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    // Verify experience exists and belongs to this guide
    const experience = await this.prisma.experience.findFirst({
      where: {
        id,
        guideProfileId: guide.id,
      },
    });

    if (!experience) {
      throw new NotFoundException(
        'Experience not found or you do not have permission to delete it',
      );
    }

    // Soft delete by setting isActive to false and status to ARCHIVED
    await this.prisma.experience.update({
      where: { id },
      data: {
        isActive: false,
        status: ExperienceStatus.ARCHIVED,
      },
    });
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapToListItem(exp: ExperienceWithRelations): ExperienceListItemDto {
    return {
      id: exp.id,
      title: exp.title,
      slug: exp.slug,
      shortDescription: exp.shortDescription,
      coverImageId: exp.coverImageId,
      basePrice: exp.basePrice.toString(),
      currency: exp.currency,
      durationHours: exp.durationHours.toString(),
      minParticipants: exp.minParticipants,
      maxParticipants: exp.maxParticipants,
      difficulty: exp.difficulty,
      averageRating: exp.averageRating.toString(),
      totalReviews: exp.totalReviews,
      status: exp.status,
      isActive: exp.isActive,
      languagesOffered: exp.languagesOffered,
      category: {
        id: exp.categoryId,
        name: exp.category.name,
        slug: exp.category.slug,
        description: null,
        iconKey: null,
      },
      location: {
        city: exp.location.city,
        district: exp.location.district,
        province: exp.location.province,
        country: exp.location.country,
        latitude: exp.location.latitude.toString(),
        longitude: exp.location.longitude.toString(),
        addressLine: exp.location.addressLine,
      },
      guide: {
        id: exp.guideProfile.id,
        fullName: exp.guideProfile.fullName,
        displayName: exp.guideProfile.displayName,
        avatarUrl: exp.guideProfile.user.avatarId,
        averageRating: exp.guideProfile.averageRating.toString(),
        totalReviews: exp.guideProfile.totalReviews,
        languagesSpoken: exp.guideProfile.languagesSpoken,
      },
    };
  }

  private mapToDetailResponse(
    exp: ExperienceDetailWithRelations,
  ): ExperienceDetailResponseDto {
    const base = this.mapToListItem(exp);

    return {
      ...base,
      description: exp.description,
      inclusions: exp.inclusions,
      exclusions: exp.exclusions,
      cancellationPolicy: exp.cancellationPolicy,
      meetingLocation: exp.meetingLocation
        ? {
            city: exp.meetingLocation.city,
            district: exp.meetingLocation.district,
            province: exp.meetingLocation.province,
            country: exp.meetingLocation.country,
            latitude: exp.meetingLocation.latitude.toString(),
            longitude: exp.meetingLocation.longitude.toString(),
            addressLine: exp.meetingLocation.addressLine,
          }
        : null,
      images:
        exp.images?.map((img) => ({
          id: img.id,
          mediaId: img.mediaId,
          url: img.media.key,
          displayOrder: img.displayOrder,
        })) || [],
      pricingRules:
        exp.pricingRules?.map((rule) => ({
          id: rule.id,
          name: rule.name,
          unit: rule.unit,
          amount: rule.amount.toString(),
          currency: rule.currency,
          validFrom: rule.validFrom?.toISOString() || null,
          validUntil: rule.validUntil?.toISOString() || null,
          minGroupSize: rule.minGroupSize,
          maxGroupSize: rule.maxGroupSize,
          isActive: rule.isActive,
        })) || [],
      createdAt: exp.createdAt.toISOString(),
      updatedAt: exp.updatedAt.toISOString(),
    };
  }
}
