import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  BookingStatus,
  BookingStatus as PrismaBookingStatus,
  Role,
  Prisma,
  Currency,
} from '../generated/prisma/client';
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
} from './dto/my-bookings-query.dto';
import {
  BookingResponseDto,
  BookingListResponseDto,
} from './dto/booking-response.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // TOURIST ENDPOINTS
  // ============================================================================

  /**
   * POST /bookings - Create new booking request
   * Tourist creates a booking for an experience
   */
  async create(
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
    let pricingRule = dto.pricingRuleId
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
      // Check if guide is available on this date
      const existingLock = await tx.availabilityLock.findFirst({
        where: {
          guideProfileId: experience.guideProfileId,
          date: tripDate,
        },
      });

      if (existingLock) {
        throw new ConflictException(
          'The guide is not available on this date. Please choose another date.',
        );
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
              location: {
                include: {
                  location: true,
                },
              },
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
          startTime: dto.startTime || '00:00',
          endTime: dto.endTime || '23:59',
        },
      });

      return newBooking;
    });

    return this.mapToResponseDto(booking);
  }

  /**
   * GET /bookings/my - List tourist's bookings
   */
  async findMyBookings(
    touristId: string,
    query: MyBookingsQueryDto,
  ): Promise<BookingListResponseDto> {
    const { status, sortBy, order, page, limit } = query;

    const where: any = {
      touristId,
    };

    if (status) {
      where.stateLog = {
        some: {
          toStatus: status,
        },
      };
    }

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'tripDate':
        orderBy = { tripDate: order };
        break;
      case 'updatedAt':
        orderBy = { updatedAt: order };
        break;
      case 'createdAt':
      default:
        orderBy = { createdAt: order };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
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
              location: {
                include: {
                  location: true,
                },
              },
            },
          },
          pricingSnapshot: true,
          stateLog: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy,
        skip: (page! - 1) * limit!,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    const items = bookings.map((booking) => this.mapToResponseDto(booking));
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
   * GET /bookings/:id - Get booking details (tourist or guide)
   */
  async findOne(
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
            location: {
              include: {
                location: true,
              },
            },
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

    return this.mapToResponseDto(booking);
  }

  /**
   * PATCH /bookings/:id/cancel - Cancel booking (tourist)
   */
  async cancel(
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
      booking.stateLog[0]?.toStatus || BookingStatus.PENDING;

    // Can only cancel bookings that are PENDING or CONFIRMED
    if (
      ![BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(currentStatus)
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
  async findPendingRequests(
    guideUserId: string,
    query: BookingRequestsQueryDto,
  ): Promise<BookingListResponseDto> {
    const { sortBy, order, page, limit } = query;

    // Get guide profile
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId: guideUserId },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    // Find bookings with PENDING status for this guide's experiences
    const where: any = {
      experience: {
        guideProfileId: guide.id,
      },
      stateLog: {
        some: {
          toStatus: BookingStatus.PENDING,
        },
      },
      // Exclude bookings that have been cancelled, confirmed, or rejected
      NOT: {
        stateLog: {
          some: {
            toStatus: {
              in: [
                BookingStatus.CANCELLED,
                BookingStatus.CONFIRMED,
                BookingStatus.REJECTED,
              ],
            },
          },
        },
      },
    };

    // Build orderBy
    let orderBy: any = {};
    switch (sortBy) {
      case 'tripDate':
        orderBy = { tripDate: order };
        break;
      default:
        orderBy = { createdAt: order };
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          tourist: {
            include: {
              touristProfile: true,
              avatar: true,
            },
          },
          experience: {
            include: {
              category: true,
            },
          },
          pricingSnapshot: true,
          stateLog: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy,
        skip: (page! - 1) * limit!,
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    const items = bookings.map((booking) => this.mapToResponseDto(booking));
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
   * PATCH /bookings/:id/accept - Accept booking (guide)
   */
  async accept(
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

    const currentStatus = booking.stateLog[0]?.toStatus;

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
  async reject(
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

    const currentStatus = booking.stateLog[0]?.toStatus;

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
  async findUpcoming(
    guideUserId: string,
    query: UpcomingBookingsQueryDto,
  ): Promise<BookingListResponseDto> {
    const { limit } = query;

    // Get guide profile
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId: guideUserId },
    });

    if (!guide) {
      throw new NotFoundException('Guide profile not found');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find CONFIRMED bookings with trip date in the future
    const where: any = {
      experience: {
        guideProfileId: guide.id,
      },
      tripDate: {
        gte: today,
      },
      stateLog: {
        some: {
          toStatus: BookingStatus.CONFIRMED,
        },
      },
      // Exclude cancelled bookings
      NOT: {
        stateLog: {
          some: {
            toStatus: BookingStatus.CANCELLED,
          },
        },
      },
    };

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          tourist: {
            include: {
              touristProfile: true,
              avatar: true,
            },
          },
          experience: {
            include: {
              category: true,
            },
          },
          pricingSnapshot: true,
          stateLog: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
        orderBy: {
          tripDate: 'asc',
        },
        take: limit,
      }),
      this.prisma.booking.count({ where }),
    ]);

    const items = bookings.map((booking) => this.mapToResponseDto(booking));

    return {
      items,
      total,
      page: 1,
      limit: limit!,
      totalPages: 1,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private mapToResponseDto(booking: any): BookingResponseDto {
    const currentStatus =
      booking.stateLog?.[0]?.toStatus || BookingStatus.PENDING;
    const isCancelled = currentStatus === BookingStatus.CANCELLED;
    const isConfirmed = currentStatus === BookingStatus.CONFIRMED;
    const isCompleted = currentStatus === BookingStatus.COMPLETED;

    // Determine if can cancel (only PENDING or CONFIRMED bookings)
    const canCancel = [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(
      currentStatus,
    );

    // Determine if can review (only COMPLETED bookings without review)
    const canReview = isCompleted && !booking.review;

    return {
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
        averageRating: booking.experience.guideProfile.averageRating.toString(),
        totalReviews: booking.experience.guideProfile.totalReviews,
      },
      experience: {
        id: booking.experience.id,
        title: booking.experience.title,
        slug: booking.experience.slug,
        shortDescription: booking.experience.shortDescription,
        coverImageId: booking.experience.coverImageId,
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
      stateLog: booking.stateLog.map((log: any) => ({
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
    } as BookingResponseDto;
  }
}
