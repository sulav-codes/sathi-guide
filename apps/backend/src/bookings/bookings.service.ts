import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, Role, Prisma } from '../generated/prisma/client';
import type { BookingWithRelations } from './booking-mapper.types';

const BOOKING_FULL_INCLUDE = {
  tourist: {
    include: {
      touristProfile: true,
      avatar: true,
    },
  },
  experience: {
    include: {
      guideProfile: {
        include: {
          user: {
            include: {
              avatar: true,
            },
          },
        },
      },
      coverImage: { select: { key: true } },
      category: true,
      location: true,
    },
  },
  pricingSnapshot: true,
  stateLog: {
    orderBy: {
      createdAt: Prisma.SortOrder.desc,
    },
    take: 1,
  },
};
import { CreateBookingDto } from './dto/create-booking.dto';
import {
  CancelBookingDto,
  AcceptBookingDto,
  RejectBookingDto,
} from './dto/update-booking.dto';
import {
  MyBookingsQueryDto,
  BookingRequestsQueryDto,
  UpcomingBookingsQueryDto,
  BookingSortBy,
  SortOrder as DtoSortOrder,
} from './dto/my-bookings-query.dto';
import {
  BookingResponseDto,
  BookingListResponseDto,
} from './dto/booking-response.dto';
import { UploadsService } from '../uploads/uploads.service';
import { UploadPurpose } from '../generated/prisma/client';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) {}

  // ============================================================================
  // TOURIST ENDPOINTS
  // ============================================================================

  /**
   * POST /bookings - Create new booking request
   * Tourist creates a booking for an experience
   */
  async createBooking(
    touristId: string,
    dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    // Get experience with guide and pricing info
    const experience = await this.prisma.experience.findUnique({
      where: { id: dto.experienceId },
      include: {
        guideProfile: {
          include: {
            user: true,
          },
        },
        pricingRules: {
          where: { isActive: true },
        },
        location: true,
      },
    });

    if (!experience) {
      throw new NotFoundException('Experience not found');
    }

    if (!experience.isActive || experience.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'This experience is not available for booking',
      );
    }

    // Validate trip date is in the future
    const tripDate = new Date(dto.tripDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (tripDate < today) {
      throw new BadRequestException('Trip date must be in the future');
    }

    // Get pricing rule
    const pricingRule = dto.pricingRuleId
      ? experience.pricingRules.find((r) => r.id === dto.pricingRuleId)
      : experience.pricingRules[0];

    if (!pricingRule) {
      throw new BadRequestException(
        'No valid pricing rule found for this experience',
      );
    }

    // Calculate pricing
    const baseAmount = pricingRule.amount.mul(dto.groupSize);
    const platformFeePercent = new Prisma.Decimal(10); // 10% platform fee
    const platformFeeAmount = baseAmount.mul(platformFeePercent).div(100);
    const discountAmount = new Prisma.Decimal(0);
    const taxAmount = new Prisma.Decimal(0);
    const totalAmount = baseAmount
      .add(platformFeeAmount)
      .sub(discountAmount)
      .add(taxAmount);

    // Create booking in transaction
    const booking = await this.prisma.$transaction(async (tx) => {
      // Check if guide is available on this date (with time overlap check)
      const startTime = dto.startTime || '00:00';
      const endTime = dto.endTime || '23:59';

      const existingLocks = await tx.availabilityLock.findMany({
        where: {
          guideProfileId: experience.guideProfileId,
          date: tripDate,
        },
      });

      // Check for time overlap
      for (const lock of existingLocks) {
        const isOverlapping = this.checkTimeOverlap(
          startTime,
          endTime,
          lock.startTime,
          lock.endTime,
        );
        if (isOverlapping) {
          throw new ConflictException(
            'The guide is not available during this time slot. Please choose another time.',
          );
        }
      }

      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          touristId,
          experienceId: dto.experienceId,
          tripDate,
          startTime: dto.startTime || null,
          endTime: dto.endTime || null,
          durationHours: dto.durationHours
            ? new Prisma.Decimal(dto.durationHours)
            : null,
          groupSize: dto.groupSize,
          touristNote: dto.touristNote || null,
          currency: experience.currency,
        },
        include: {
          tourist: {
            include: {
              touristProfile: true,
              avatar: true,
            },
          },
          experience: {
            include: {
              guideProfile: {
                include: {
                  user: {
                    include: {
                      avatar: true,
                    },
                  },
                },
              },
              category: true,
              location: true,
            },
          },
        },
      });

      // Create pricing snapshot
      await tx.bookingPricingSnapshot.create({
        data: {
          bookingId: newBooking.id,
          pricingRuleId: pricingRule.id,
          unit: pricingRule.unit,
          agreedRate: pricingRule.amount,
          currency: pricingRule.currency,
          groupSize: dto.groupSize,
          durationHours: dto.durationHours
            ? new Prisma.Decimal(dto.durationHours)
            : null,
          baseAmount,
          discountAmount,
          platformFeeAmount,
          platformFeePercent,
          taxAmount,
          totalAmount,
        },
      });

      // Create initial state log
      await tx.bookingStateLog.create({
        data: {
          bookingId: newBooking.id,
          fromStatus: null,
          toStatus: BookingStatus.PENDING,
          actorId: touristId,
          actorRole: Role.TOURIST,
          reason: 'Booking created',
          reasonCode: 'BOOKING_CREATED',
        },
      });

      // Create availability lock (prevents double booking)
      await tx.availabilityLock.create({
        data: {
          guideProfileId: experience.guideProfileId,
          experienceId: dto.experienceId,
          bookingId: newBooking.id,
          date: tripDate,
          startTime: startTime,
          endTime: endTime,
        },
      });

      // Return fully populated booking to match response shape
      return tx.booking.findUniqueOrThrow({
        where: { id: newBooking.id },
        include: BOOKING_FULL_INCLUDE,
      });
    });

    return plainToInstance(BookingResponseDto, this.mapToResponseDto(booking));
  }

  /**
   * GET /bookings/my - List tourist's bookings
   */
  async findMyBookings(
    touristId: string,
    query: MyBookingsQueryDto,
  ): Promise<BookingListResponseDto> {
    const {
      status,
      sortBy = BookingSortBy.CREATED_AT,
      order = DtoSortOrder.DESC,
      page = 1,
      limit = 20,
    } = query;

    const where: Prisma.BookingWhereInput = {
      touristId,
    };

    // Build orderBy
    let orderBy: Prisma.BookingOrderByWithRelationInput = {};
    if (sortBy === BookingSortBy.TRIP_DATE) {
      orderBy = { tripDate: order };
    } else if (sortBy === BookingSortBy.UPDATED_AT) {
      orderBy = { updatedAt: order };
    } else {
      orderBy = { createdAt: order };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: BOOKING_FULL_INCLUDE,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    // Filter by status if provided (client-side for now)
    let filteredBookings = bookings;
    if (status) {
      filteredBookings = bookings.filter((b) => {
        const currentStatus = b.stateLog[0]?.toStatus as
          BookingStatus | undefined;
        return currentStatus === status;
      });
    }

    const items = filteredBookings.map((booking) =>
      this.mapToResponseDto(booking),
    );
    const totalPages = Math.ceil(total / limit);

    return { items, total, page, limit, totalPages };
  }

  /**
   * GET /bookings/:id - Get booking details (tourist or guide)
   */
  async findOneBooking(
    userId: string,
    userRole: Role,
    bookingId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tourist: {
          include: {
            touristProfile: true,
            avatar: true,
          },
        },
        experience: {
          include: {
            guideProfile: {
              include: {
                user: {
                  include: {
                    avatar: true,
                  },
                },
              },
            },
            category: true,
            location: true,
            coverImage: { select: { key: true } },
          },
        },
        pricingSnapshot: true,
        stateLog: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check authorization
    const isTourist = booking.touristId === userId;
    const isGuide = booking.experience.guideProfile.userId === userId;
    const isAdmin = userRole === Role.ADMIN;

    if (!isTourist && !isGuide && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to view this booking',
      );
    }

    return plainToInstance(BookingResponseDto, this.mapToResponseDto(booking));
  }

  /**
   * PATCH /bookings/:id/cancel - Cancel booking (tourist)
   */
  async cancelBooking(
    touristId: string,
    bookingId: string,
    dto: CancelBookingDto,
  ): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        stateLog: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.touristId !== touristId) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    const currentStatus =
      (booking.stateLog[0]?.toStatus as BookingStatus | undefined) ||
      BookingStatus.PENDING;

    // Can only cancel bookings that are PENDING or CONFIRMED
    if (
      currentStatus !== BookingStatus.PENDING &&
      currentStatus !== BookingStatus.CONFIRMED
    ) {
      throw new BadRequestException(
        `Cannot cancel booking with status: ${currentStatus}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Create state log entry
      await tx.bookingStateLog.create({
        data: {
          bookingId,
          fromStatus: currentStatus,
          toStatus: BookingStatus.CANCELLED,
          actorId: touristId,
          actorRole: Role.TOURIST,
          reason: dto.reason,
          reasonCode: dto.reasonCode || 'TOURIST_CANCELLED',
        },
      });

      // Remove availability lock
      await tx.availabilityLock.deleteMany({
        where: { bookingId },
      });
    });
  }

  // ============================================================================
  // GUIDE ENDPOINTS
  // ============================================================================

  /**
   * GET /bookings/requests - List pending booking requests (guide)
   */
  async findPendingBookingRequests(
    guideUserId: string,
    query: BookingRequestsQueryDto,
  ): Promise<BookingListResponseDto> {
    const {
      sortBy = BookingSortBy.CREATED_AT,
      order = DtoSortOrder.DESC,
      page = 1,
      limit = 20,
    } = query;

    // Get guide profile
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId: guideUserId },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    // Build orderBy
    let orderBy: Prisma.BookingOrderByWithRelationInput = {};
    if (sortBy === BookingSortBy.TRIP_DATE) {
      orderBy = { tripDate: order };
    } else {
      orderBy = { createdAt: order };
    }

    // Find all bookings for this guide's experiences
    const allBookings = await this.prisma.booking.findMany({
      where: {
        experience: {
          guideProfileId: guide.id,
        },
      },
      include: BOOKING_FULL_INCLUDE,
      orderBy,
    });

    // Filter to only PENDING bookings
    const pendingBookings = allBookings.filter((booking) => {
      const currentStatus = booking.stateLog[0]?.toStatus as
        BookingStatus | undefined;
      return currentStatus === BookingStatus.PENDING;
    });

    // Paginate
    const total = pendingBookings.length;
    const paginatedBookings = pendingBookings.slice(
      (page - 1) * limit,
      page * limit,
    );

    const items = paginatedBookings.map((booking) =>
      this.mapToResponseDto(booking),
    );
    const totalPages = Math.ceil(total / limit);

    return { items, total, page, limit, totalPages };
  }

  /**
   * PATCH /bookings/:id/accept - Accept booking (guide)
   */
  async acceptBooking(
    guideUserId: string,
    bookingId: string,
    dto: AcceptBookingDto,
  ): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        experience: true,
        stateLog: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify guide owns this experience
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId: guideUserId },
    });

    if (!guide || booking.experience.guideProfileId !== guide.id) {
      throw new ForbiddenException(
        'You can only accept bookings for your own experiences',
      );
    }

    const currentStatus = booking.stateLog[0]?.toStatus as
      BookingStatus | undefined;

    // Can only accept PENDING bookings
    if (currentStatus !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Cannot accept booking with status: ${currentStatus}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Create state log entry
      await tx.bookingStateLog.create({
        data: {
          bookingId,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.CONFIRMED,
          actorId: guideUserId,
          actorRole: Role.GUIDE,
          reason: 'Guide accepted the booking',
          reasonCode: 'GUIDE_ACCEPTED',
          note: dto.guideNote,
        },
      });

      // Update guide note if provided
      if (dto.guideNote) {
        await tx.booking.update({
          where: { id: bookingId },
          data: { guideNote: dto.guideNote },
        });
      }
    });
  }

  /**
   * PATCH /bookings/:id/reject - Reject booking (guide)
   */
  async rejectBooking(
    guideUserId: string,
    bookingId: string,
    dto: RejectBookingDto,
  ): Promise<void> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        experience: true,
        stateLog: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify guide owns this experience
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId: guideUserId },
    });

    if (!guide || booking.experience.guideProfileId !== guide.id) {
      throw new ForbiddenException(
        'You can only reject bookings for your own experiences',
      );
    }

    const currentStatus = booking.stateLog[0]?.toStatus as
      BookingStatus | undefined;

    // Can only reject PENDING bookings
    if (currentStatus !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Cannot reject booking with status: ${currentStatus}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Create state log entry
      await tx.bookingStateLog.create({
        data: {
          bookingId,
          fromStatus: BookingStatus.PENDING,
          toStatus: BookingStatus.REJECTED,
          actorId: guideUserId,
          actorRole: Role.GUIDE,
          reason: dto.reason,
          reasonCode: dto.reasonCode || 'GUIDE_REJECTED',
        },
      });

      // Remove availability lock
      await tx.availabilityLock.deleteMany({
        where: { bookingId },
      });
    });
  }

  /**
   * GET /bookings/upcoming - List upcoming confirmed bookings (guide)
   */
  async findUpcomingBookings(
    guideUserId: string,
    query: UpcomingBookingsQueryDto,
  ): Promise<BookingListResponseDto> {
    const { limit = 20 } = query;

    // Get guide profile
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId: guideUserId },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find bookings with trip date in the future
    const allBookings = await this.prisma.booking.findMany({
      where: {
        experience: {
          guideProfileId: guide.id,
        },
        tripDate: {
          gte: today,
        },
      },
      include: BOOKING_FULL_INCLUDE,
      orderBy: {
        tripDate: 'asc',
      },
    });

    // Filter to only CONFIRMED bookings
    const confirmedBookings = allBookings.filter((booking) => {
      const currentStatus = booking.stateLog[0]?.toStatus as
        BookingStatus | undefined;
      return currentStatus === BookingStatus.CONFIRMED;
    });

    const total = confirmedBookings.length;
    const limitedBookings = confirmedBookings.slice(0, limit);

    const items = limitedBookings.map((booking) =>
      this.mapToResponseDto(booking),
    );

    return {
      items,
      total,
      page: 1,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * GET /bookings/history - List past/completed/cancelled bookings (guide)
   */
  async findBookingHistory(
    guideUserId: string,
    query: BookingRequestsQueryDto,
  ): Promise<BookingListResponseDto> {
    const page: number = query.page ?? 1;
    const limit: number = query.limit ?? 20;

    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId: guideUserId },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    const allBookings = await this.prisma.booking.findMany({
      where: {
        experience: {
          guideProfileId: guide.id,
        },
      },
      include: BOOKING_FULL_INCLUDE,
      orderBy: {
        tripDate: 'desc',
      },
    });

    // Filter to only COMPLETED or CANCELLED/REJECTED bookings
    const historyBookings = allBookings.filter((booking) => {
      const currentStatus = booking.stateLog[0]?.toStatus as
        BookingStatus | undefined;
      return (
        currentStatus === BookingStatus.COMPLETED ||
        currentStatus === BookingStatus.CANCELLED ||
        currentStatus === BookingStatus.REJECTED
      );
    });

    const total = historyBookings.length;
    const startIndex = (page - 1) * limit;
    const limitedBookings = historyBookings.slice(
      startIndex,
      startIndex + limit,
    );

    const items = limitedBookings.map((booking) =>
      this.mapToResponseDto(booking),
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Check if two time ranges overlap
   */
  private checkTimeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string,
  ): boolean {
    // Convert HH:MM to minutes since midnight for easier comparison
    const toMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const s1 = toMinutes(start1);
    const e1 = toMinutes(end1);
    const s2 = toMinutes(start2);
    const e2 = toMinutes(end2);

    // Check if ranges overlap
    return s1 < e2 && s2 < e1;
  }

  private mapToResponseDto(booking: BookingWithRelations): BookingResponseDto {
    const currentStatus =
      booking.stateLog?.[0]?.toStatus || BookingStatus.PENDING;
    const isCompleted = currentStatus === BookingStatus.COMPLETED;

    // Determine if can cancel (only PENDING or CONFIRMED bookings)
    const canCancel =
      currentStatus === BookingStatus.PENDING ||
      currentStatus === BookingStatus.CONFIRMED;

    // Determine if can review (only COMPLETED bookings without review)
    const canReview = isCompleted;

    // Use plainToInstance with excludeExtraneousValues so @Exclude()/@Expose()
    // decorators are respected for nested DTO classes.
    return plainToInstance(
      BookingResponseDto,
      {
        id: booking.id,
        status: currentStatus,
        tripDate: booking.tripDate.toISOString().split('T')[0],
        startTime: booking.startTime,
        endTime: booking.endTime,
        durationHours: booking.durationHours?.toString() || null,
        groupSize: booking.groupSize,
        touristNote: booking.touristNote,
        guideNote: booking.guideNote,
        currency: booking.currency,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        tourist: {
          id: booking.tourist.id,
          fullName: booking.tourist.touristProfile?.fullName || 'Unknown',
          displayName: booking.tourist.touristProfile?.displayName || null,
          avatarUrl: booking.tourist.avatar?.id || null,
          phone: booking.tourist.phone,
        },
        guide: {
          id: booking.experience.guideProfile.id,
          fullName: booking.experience.guideProfile.fullName,
          displayName: booking.experience.guideProfile.displayName,
          avatarUrl: booking.experience.guideProfile.user.avatar?.id || null,
          averageRating:
            booking.experience.guideProfile.averageRating.toString(),
          totalReviews: booking.experience.guideProfile.totalReviews,
        },
        experience: {
          id: booking.experience.id,
          title: booking.experience.title,
          slug: booking.experience.slug,
          shortDescription: booking.experience.shortDescription,
          coverImage: booking.experience.coverImage
            ? {
                key: booking.experience.coverImage.key,
                url: this.uploadsService.getPublicUrl(
                  booking.experience.coverImage.key,
                  UploadPurpose.EXPERIENCE,
                ),
              }
            : null,
          durationHours: booking.experience.durationHours.toString(),
          difficulty: booking.experience.difficulty,
        },
        pricingSnapshot: booking.pricingSnapshot
          ? {
              id: booking.pricingSnapshot.id,
              unit: booking.pricingSnapshot.unit,
              agreedRate: booking.pricingSnapshot.agreedRate.toString(),
              currency: booking.pricingSnapshot.currency,
              groupSize: booking.pricingSnapshot.groupSize,
              durationHours:
                booking.pricingSnapshot.durationHours?.toString() || null,
              baseAmount: booking.pricingSnapshot.baseAmount.toString(),
              discountAmount: booking.pricingSnapshot.discountAmount.toString(),
              platformFeeAmount:
                booking.pricingSnapshot.platformFeeAmount.toString(),
              platformFeePercent:
                booking.pricingSnapshot.platformFeePercent.toString(),
              taxAmount: booking.pricingSnapshot.taxAmount.toString(),
              totalAmount: booking.pricingSnapshot.totalAmount.toString(),
              promoCodeApplied: booking.pricingSnapshot.promoCodeApplied,
              promoDiscountAmount:
                booking.pricingSnapshot.promoDiscountAmount?.toString() || null,
            }
          : null,
        stateLog: booking.stateLog.map((log) => ({
          id: log.id,
          fromStatus: log.fromStatus,
          toStatus: log.toStatus,
          actorId: log.actorId,
          actorRole: log.actorRole,
          reason: log.reason,
          reasonCode: log.reasonCode,
          note: log.note,
          createdAt: log.createdAt.toISOString(),
        })),
        canCancel,
        canReview,
      },
      { excludeExtraneousValues: true },
    );
  }
}
