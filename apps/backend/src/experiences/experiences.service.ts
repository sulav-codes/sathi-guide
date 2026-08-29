import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Experience,
  ExperienceStatus,
  Prisma,
  UploadPurpose,
} from '../generated/prisma/client';
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
  ExperienceCategoryResponseDto,
  DraftExperienceResponseDto,
  AddImageResponseDto,
} from './dto/experience-response.dto';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { CreateDraftExperienceDto } from './dto/create-draft-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';
import {
  UpdateExperienceLocationDto,
  UpdateExperiencePricingDto,
  AddExperienceImageDto,
} from './dto/update-experience-subresources.dto';
import { UploadsService } from '../uploads/uploads.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ExperiencesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

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
      guideId,
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

    // Guide profile filter — used for "Experiences by this guide" on guide profile page
    if (guideId) {
      where.guideProfileId = guideId;
    }

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
          coverImage: {
            select: { key: true },
          },
          guideProfile: {
            include: {
              user: {
                select: {
                  avatar: { select: { key: true } },
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

    const rawResult = {
      items,
      total,
      page,
      limit,
      totalPages,
    };
    return plainToInstance(ExperienceListResponseDto, rawResult);
  }

  /**
   * GET /experiences/nearby - List experiences near a location using PostGIS
   */
  async findNearby(lat: number, lng: number, radiusMeters: number = 50000) {
    const nearbyLocations = await this.prisma.$queryRaw<{ id: string }[]>`
      SELECT id 
      FROM locations 
      WHERE ST_DWithin(
        geom::geography, 
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography, 
        ${radiusMeters}
      )
    `;

    if (!nearbyLocations.length) {
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
    }

    const locationIds = nearbyLocations.map((l) => l.id);

    const experiences = await this.prisma.experience.findMany({
      where: {
        status: ExperienceStatus.PUBLISHED,
        isActive: true,
        locationId: { in: locationIds },
      },
      include: {
        category: true,
        location: true,
        coverImage: { select: { key: true } },
        guideProfile: {
          include: {
            user: {
              select: {
                avatar: { select: { key: true } },
              },
            },
          },
        },
      },
      take: 50,
    });

    const items = experiences.map((exp) =>
      this.mapToListItem(exp as ExperienceWithRelations),
    );

    return {
      items,
      total: items.length,
      page: 1,
      limit: 50,
      totalPages: 1,
    };
  }

  /**
   * GET /experiences/:id - Get specific experience public detail
   */
  async findOne(id: string): Promise<ExperienceDetailResponseDto> {
    const experience = await this.prisma.experience.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        category: true,
        location: true,
        meetingLocation: true,
        coverImage: {
          select: { key: true },
        },
        guideProfile: {
          include: {
            user: {
              select: {
                avatar: { select: { key: true } },
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

    const mappedData = this.mapToDetailResponse(experience);
    return plainToInstance(ExperienceDetailResponseDto, mappedData);
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
      select: { id: true },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    const [experiences, total] = await Promise.all([
      this.prisma.experience.findMany({
        where: { guideProfileId: guide.id },
        include: {
          category: true,
          coverImage: { select: { key: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.experience.count({
        where: { guideProfileId: guide.id },
      }),
    ]);

    if (experiences.length === 0) {
      return plainToInstance(MyExperienceListResponseDto, {
        items: [],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    }

    const experienceIds = experiences.map((exp) => exp.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalBookingCounts, upcomingBookingCounts] = await Promise.all([
      this.prisma.booking.groupBy({
        by: ['experienceId'],
        _count: { _all: true },
        where: { experienceId: { in: experienceIds } },
      }),
      this.prisma.booking.groupBy({
        by: ['experienceId'],
        _count: { _all: true },
        where: {
          experienceId: { in: experienceIds },
          tripDate: { gte: today },
          stateLog: { some: { toStatus: 'CONFIRMED' } },
        },
      }),
    ]);

    const totalMap = new Map(
      totalBookingCounts.map((b) => [b.experienceId, b._count._all]),
    );
    const upcomingMap = new Map(
      upcomingBookingCounts.map((b) => [b.experienceId, b._count._all]),
    );

    const items = experiences.map((exp) => ({
      id: exp.id,
      title: exp.title,
      slug: exp.slug,
      shortDescription: exp.shortDescription,
      coverImage: exp.coverImage
        ? {
            key: exp.coverImage.key,
            url: this.uploadsService.getPublicUrl(
              exp.coverImage.key,
              UploadPurpose.EXPERIENCE,
            ),
          }
        : null,
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
      totalBookings: totalMap.get(exp.id) ?? 0,
      upcomingBookings: upcomingMap.get(exp.id) ?? 0,
    }));

    const rawResult = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Convert the response wrapper AND nested items into class instances
    return plainToInstance(MyExperienceListResponseDto, rawResult);
  }

  // ============================================================================
  // PUBLIC UTILITY ENDPOINTS
  // ============================================================================

  /**
   * GET /experiences/categories - List all active expertise categories
   */
  async getCategories(): Promise<ExperienceCategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
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
    return plainToInstance(ExperienceCategoryResponseDto, categories);
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
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, isActive: true },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Generate slug if not provided
    const slug =
      dto.slug ||
      `${dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;

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
          coverImage: { select: { key: true } },
          guideProfile: {
            include: {
              user: {
                select: {
                  avatar: { select: { key: true } },
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
        coverImage: { select: { key: true } },
        guideProfile: {
          include: {
            user: {
              select: {
                avatar: { select: { key: true } },
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
  // DRAFT CREATION
  // ============================================================================

  /**
   * POST /experiences/draft - Create a minimal DRAFT experience from Step 1 data.
   * Returns only { id, status } — the wizard uses the ID for all subsequent PATCHes.
   */
  async createDraft(
    userId: string,
    dto: CreateDraftExperienceDto,
  ): Promise<{ id: string; status: string }> {
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId },
    });
    if (!guide) throw new NotFoundException('Guide profile not found');

    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, isActive: true },
    });
    if (!category) throw new NotFoundException('Category not found');

    const slug = `${dto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')}-${Date.now().toString(36)}`;

    // We need non-nullable DB fields — use placeholder Location row
    const placeholderLocation = await this.prisma.location.create({
      data: { latitude: 0, longitude: 0, city: 'TBD', district: 'TBD' },
    });

    const experience = await this.prisma.experience.create({
      data: {
        title: dto.title,
        slug,
        shortDescription: dto.shortDescription,
        description: dto.description,
        categoryId: dto.categoryId,
        guideProfileId: guide.id,
        locationId: placeholderLocation.id,
        durationHours: new Prisma.Decimal(1),
        maxParticipants: 1,
        basePrice: new Prisma.Decimal(0),
        status: ExperienceStatus.DRAFT,
      },
      select: { id: true, status: true },
    });

    return plainToInstance(DraftExperienceResponseDto, {
      id: experience.id,
      status: experience.status,
    });
  }

  // ============================================================================
  // STEP-LEVEL UPDATES
  // ============================================================================

  /**
   * PATCH /experiences/:id/location
   */
  async updateLocation(
    userId: string,
    id: string,
    dto: UpdateExperienceLocationDto,
  ): Promise<ExperienceDetailResponseDto> {
    const { experience } = await this.verifyOwnership(userId, id);

    await this.prisma.$transaction(async (tx) => {
      // Update or replace the main location
      await tx.location.update({
        where: { id: experience.locationId },
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

      if (dto.meetingLocation) {
        if (experience.meetingLocationId) {
          await tx.location.update({
            where: { id: experience.meetingLocationId },
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
        } else {
          const newMeeting = await tx.location.create({
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
          await tx.experience.update({
            where: { id },
            data: { meetingLocationId: newMeeting.id },
          });
        }
      }
    });

    return this.findOne(id);
  }

  /**
   * PATCH /experiences/:id/pricing
   */
  async updatePricing(
    userId: string,
    id: string,
    dto: UpdateExperiencePricingDto,
  ): Promise<ExperienceDetailResponseDto> {
    await this.verifyOwnership(userId, id);

    const basePrice =
      dto.basePrice ??
      (dto.pricingRules.length > 0 ? dto.pricingRules[0].amount : 0);

    await this.prisma.$transaction(async (tx) => {
      // Deactivate all existing pricing rules
      await tx.experiencePricingRule.updateMany({
        where: { experienceId: id },
        data: { isActive: false },
      });

      // Create new rules
      await tx.experiencePricingRule.createMany({
        data: dto.pricingRules.map((rule) => ({
          experienceId: id,
          name: rule.name,
          unit: rule.unit,
          amount: new Prisma.Decimal(rule.amount),
          currency: rule.currency || 'NPR',
          minGroupSize: rule.minGroupSize,
          maxGroupSize: rule.maxGroupSize,
          isActive: true,
        })),
      });

      await tx.experience.update({
        where: { id },
        data: {
          basePrice: new Prisma.Decimal(basePrice),
          currency: dto.currency || 'NPR',
        },
      });
    });

    return this.findOne(id);
  }

  // ============================================================================
  // IMAGE MANAGEMENT
  // ============================================================================

  private readonly MAX_IMAGES = 5;

  /**
   * POST /experiences/:id/images
   * Attach an already-uploaded (confirmed) media record to an experience.
   */
  async addImage(
    userId: string,
    experienceId: string,
    dto: AddExperienceImageDto,
  ): Promise<{ id: string; mediaId: string; displayOrder: number }> {
    await this.verifyOwnership(userId, experienceId);

    const existingCount = await this.prisma.experienceImage.count({
      where: { experienceId },
    });

    if (existingCount >= this.MAX_IMAGES) {
      throw new BadRequestException(
        `An experience can have at most ${this.MAX_IMAGES} images.`,
      );
    }

    const displayOrder = dto.displayOrder ?? existingCount;
    const isFirstImage = existingCount === 0;

    const image = await this.prisma.$transaction(async (tx) => {
      const img = await tx.experienceImage.create({
        data: {
          experienceId,
          mediaId: dto.mediaId,
          displayOrder,
        },
      });

      // Auto-set as cover if it's the first image
      if (isFirstImage) {
        await tx.experience.update({
          where: { id: experienceId },
          data: { coverImageId: dto.mediaId },
        });
      }

      return img;
    });

    return plainToInstance(AddImageResponseDto, {
      id: image.id,
      mediaId: image.mediaId,
      displayOrder: image.displayOrder,
    });
  }

  /**
   * DELETE /experiences/:id/images/:imageId
   * Remove an image from an experience. Also deletes the file from storage.
   */
  async removeImage(
    userId: string,
    experienceId: string,
    imageId: string,
  ): Promise<void> {
    const { experience } = await this.verifyOwnership(userId, experienceId);

    const image = await this.prisma.experienceImage.findFirst({
      where: { id: imageId, experienceId },
      include: { media: true },
    });

    if (!image)
      throw new NotFoundException('Image not found on this experience');

    await this.prisma.$transaction(async (tx) => {
      await tx.experienceImage.delete({ where: { id: imageId } });

      // If this was the cover image, promote the next image (lowest displayOrder)
      if (experience.coverImageId === image.mediaId) {
        const nextImage = await tx.experienceImage.findFirst({
          where: { experienceId, id: { not: imageId } },
          orderBy: { displayOrder: 'asc' },
        });
        await tx.experience.update({
          where: { id: experienceId },
          data: { coverImageId: nextImage?.mediaId ?? null },
        });
      }
    });

    // Delete file from storage — non-blocking, don't fail the request if this errors
    try {
      await this.uploadsService.deleteByMediaId(image.mediaId, userId);
    } catch (err) {
      // Swallow — the DB record is already deleted, but log for observability
      console.error(
        `[ExperiencesService] Failed to delete storage file for mediaId ${image.mediaId}:`,
        err,
      );
    }
  }

  // ============================================================================
  // PUBLISH
  // ============================================================================

  /**
   * PATCH /experiences/:id/publish
   * Full validation then status → PUBLISHED.
   */
  async publish(
    userId: string,
    id: string,
  ): Promise<ExperienceDetailResponseDto> {
    const { experience } = await this.verifyOwnership(userId, id);

    // Full validation: ensure required fields are present
    const errors: string[] = [];
    if (!experience.locationId) {
      errors.push('Location is required');
    } else {
      // Detect the placeholder location that was auto-created with the draft
      const loc = await this.prisma.location.findUnique({
        where: { id: experience.locationId },
        select: { city: true },
      });
      if (loc?.city === 'TBD')
        errors.push('Location must be updated before publishing');
    }
    if (Number(experience.basePrice) === 0) errors.push('Pricing must be set');
    if (Number(experience.durationHours) < 0.5)
      errors.push('Duration must be at least 30 minutes');
    if (experience.maxParticipants < 1)
      errors.push('Max participants must be at least 1');

    const imageCount = await this.prisma.experienceImage.count({
      where: { experienceId: id },
    });
    if (imageCount === 0)
      errors.push('At least one image is required to publish');

    if (errors.length > 0) {
      throw new BadRequestException(
        `Cannot publish experience: ${errors.join('; ')}`,
      );
    }

    await this.prisma.experience.update({
      where: { id },
      data: { status: ExperienceStatus.PUBLISHED },
    });

    return this.findOne(id);
  }

  // ============================================================================
  // SHARED OWNERSHIP CHECK
  // ============================================================================

  private async verifyOwnership(
    userId: string,
    experienceId: string,
  ): Promise<{
    guide: { id: string };
    experience: Experience;
  }> {
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId },
      select: { id: true },
    });
    if (!guide) throw new NotFoundException('Guide profile not found');

    const experience = await this.prisma.experience.findFirst({
      where: { id: experienceId, guideProfileId: guide.id },
    });
    if (!experience) {
      throw new NotFoundException(
        'Experience not found or you do not have permission to modify it',
      );
    }

    return { guide, experience };
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
      coverImage: exp.coverImage
        ? {
            key: exp.coverImage.key,
            url: this.uploadsService.getPublicUrl(
              exp.coverImage.key,
              UploadPurpose.EXPERIENCE,
            ),
          }
        : null,
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
        avatarUrl: exp.guideProfile.user.avatar?.key
          ? this.uploadsService.getPublicUrl(
              exp.guideProfile.user.avatar.key,
              UploadPurpose.AVATAR,
            )
          : null,
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
          key: img.media.key,
          url: this.uploadsService.getPublicUrl(
            img.media.key,
            UploadPurpose.EXPERIENCE,
          ),
          displayOrder: img.displayOrder,
        })) || [],
      imageKeys: exp.images?.map((img) => img.media.key) || [],
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
