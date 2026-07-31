import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ReviewStatus,
  BookingStatus,
  Prisma,
} from '../generated/prisma/client';

type ReviewWithRelations = Prisma.ReviewGetPayload<{
  include: {
    author: {
      include: {
        touristProfile: true;
        avatar: true;
      };
    };
    subject: {
      include: {
        guideProfile: true;
        avatar: true;
      };
    };
    booking: {
      include: {
        experience: true;
      };
    };
  };
}>;

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GuideReviewsQueryDto } from './dto/guide-reviews-query.dto';
import {
  ReviewResponseDto,
  ReviewListResponseDto,
  CanReviewResponseDto,
  ReviewSummaryResponseDto,
} from './dto/review-response.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * POST /reviews - Create review after completed booking
   */
  async create(
    authorId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Get booking with all necessary info
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        experience: {
          include: {
            guideProfile: true,
          },
        },
        tourist: true,
        stateLog: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify the user is the tourist who made the booking
    if (booking.touristId !== authorId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    // Check booking is completed
    const currentStatus = booking.stateLog[0]?.toStatus;
    if (currentStatus !== BookingStatus.COMPLETED) {
      throw new BadRequestException('You can only review completed bookings');
    }

    // Check if review already exists for this booking
    const existingReview = await this.prisma.review.findUnique({
      where: { bookingId: dto.bookingId },
    });

    if (existingReview) {
      throw new ConflictException('A review already exists for this booking');
    }

    // Get guide user ID
    const guideUserId = booking.experience.guideProfile.userId;

    // Create review and update guide's average rating in a transaction
    const review = await this.prisma.$transaction(async (tx) => {
      // Create the review
      const newReview = await tx.review.create({
        data: {
          bookingId: dto.bookingId,
          authorId,
          subjectId: guideUserId,
          overallRating: dto.overallRating,
          communicationRating: dto.communicationRating || null,
          punctualityRating: dto.punctualityRating || null,
          knowledgeRating: dto.knowledgeRating || null,
          valueRating: dto.valueRating || null,
          comment: dto.comment || null,
          status: ReviewStatus.VISIBLE,
        },
        include: {
          author: {
            include: {
              touristProfile: true,
              avatar: true,
            },
          },
          subject: {
            include: {
              guideProfile: true,
              avatar: true,
            },
          },
          booking: {
            include: {
              experience: true,
            },
          },
        },
      });

      // Update guide's average rating
      await this.updateGuideRating(tx, guideUserId);

      return newReview;
    });

    return this.mapToResponseDto(review);
  }

  /**
   * GET /reviews/guide/:guideId - Get all reviews for a guide (public)
   */
  async findByGuide(
    guideId: string,
    query: GuideReviewsQueryDto,
  ): Promise<ReviewListResponseDto> {
    const { page, limit } = query;

    // Verify guide exists
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId: guideId },
    });

    if (!guide) {
      throw new NotFoundException('Guide not found');
    }

    const where: Prisma.ReviewWhereInput = {
      subjectId: guideId,
      status: ReviewStatus.VISIBLE,
    };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        include: {
          author: {
            include: {
              touristProfile: true,
              avatar: true,
            },
          },
          subject: {
            include: {
              guideProfile: true,
              avatar: true,
            },
          },
          booking: {
            include: {
              experience: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page! - 1) * limit!,
        take: limit,
      }),
      this.prisma.review.count({ where }),
    ]);

    const items = reviews.map((review) => this.mapToResponseDto(review));
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
   * GET /reviews/guide/:guideId/summary - Get review summary for a guide (public)
   */
  async getReviewSummary(guideId: string): Promise<ReviewSummaryResponseDto> {
    // Verify guide exists
    const guide = await this.prisma.guideProfile.findUnique({
      where: { userId: guideId },
    });

    if (!guide) {
      throw new NotFoundException('Guide not found');
    }

    const reviewStats = await this.prisma.review.groupBy({
      by: ['overallRating'],
      where: {
        subjectId: guideId,
        status: ReviewStatus.VISIBLE,
      },
      _count: {
        overallRating: true,
      },
    });

    const totalReviews = reviewStats.reduce(
      (sum, stat) => sum + stat._count.overallRating,
      0,
    );

    const averageRating =
      totalReviews > 0
        ? reviewStats.reduce(
            (sum, stat) => sum + stat.overallRating * stat._count.overallRating,
            0,
          ) / totalReviews
        : 0;

    return {
      averageRating: Math.round(averageRating * 100) / 100,
      totalReviews,
      fiveStar:
        reviewStats.find((r) => r.overallRating === 5)?._count.overallRating ||
        0,
      fourStar:
        reviewStats.find((r) => r.overallRating === 4)?._count.overallRating ||
        0,
      threeStar:
        reviewStats.find((r) => r.overallRating === 3)?._count.overallRating ||
        0,
      twoStar:
        reviewStats.find((r) => r.overallRating === 2)?._count.overallRating ||
        0,
      oneStar:
        reviewStats.find((r) => r.overallRating === 1)?._count.overallRating ||
        0,
    };
  }

  /**
   * PATCH /reviews/:id - Edit own review (author)
   */
  async update(
    authorId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        author: {
          include: {
            touristProfile: true,
            avatar: true,
          },
        },
        subject: {
          include: {
            guideProfile: true,
            avatar: true,
          },
        },
        booking: {
          include: {
            experience: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    // Check if review is editable (within 30 days of creation)
    const daysSinceCreation =
      (new Date().getTime() - review.createdAt.getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceCreation > 30) {
      throw new BadRequestException(
        'Reviews can only be edited within 30 days of creation',
      );
    }

    // Update review and guide's average rating in transaction
    const updatedReview = await this.prisma.$transaction(async (tx) => {
      const newReview = await tx.review.update({
        where: { id: reviewId },
        data: {
          overallRating: dto.overallRating,
          communicationRating: dto.communicationRating,
          punctualityRating: dto.punctualityRating,
          knowledgeRating: dto.knowledgeRating,
          valueRating: dto.valueRating,
          comment: dto.comment,
        },
        include: {
          author: {
            include: {
              touristProfile: true,
              avatar: true,
            },
          },
          subject: {
            include: {
              guideProfile: true,
              avatar: true,
            },
          },
          booking: {
            include: {
              experience: true,
            },
          },
        },
      });

      // Create audit log entry for edit
      await tx.reviewAuditLog.create({
        data: {
          reviewId,
          eventType: 'EDITED',
          actorId: authorId,
          previousState: JSON.stringify(review),
          newState: JSON.stringify(newReview),
          note: 'Review edited by author',
        },
      });

      // Update guide's average rating
      await this.updateGuideRating(tx, review.subjectId);

      return newReview;
    });

    return this.mapToResponseDto(updatedReview);
  }

  /**
   * DELETE /reviews/:id - Delete own review (author)
   * Soft delete - sets status to DELETED
   */
  async remove(authorId: string, reviewId: string): Promise<void> {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Soft delete and update guide's rating in transaction
    await this.prisma.$transaction(async (tx) => {
      // Update review status to DELETED
      await tx.review.update({
        where: { id: reviewId },
        data: { status: ReviewStatus.DELETED },
      });

      // Create audit log entry
      await tx.reviewAuditLog.create({
        data: {
          reviewId,
          eventType: 'STATUS_CHANGED',
          actorId: authorId,
          previousState: JSON.stringify({ status: review.status }),
          newState: JSON.stringify({ status: ReviewStatus.DELETED }),
          note: 'Review deleted by author',
        },
      });

      // Update guide's average rating
      await this.updateGuideRating(tx, review.subjectId);
    });
  }

  /**
   * GET /reviews/can-review - Check if user can review a guide
   */
  async canReview(
    touristId: string,
    guideId: string,
  ): Promise<CanReviewResponseDto> {
    // Check if there's a completed booking with this guide
    const completedBooking = await this.prisma.booking.findFirst({
      where: {
        touristId,
        experience: {
          guideProfile: {
            userId: guideId,
          },
        },
        stateLog: {
          some: {
            toStatus: BookingStatus.COMPLETED,
          },
        },
      },
      include: {
        review: true,
      },
    });

    if (!completedBooking) {
      return {
        canReview: false,
        reason:
          'You need a completed booking with this guide to leave a review',
      };
    }

    if (completedBooking.review) {
      return {
        canReview: false,
        reason: 'You have already reviewed this booking',
      };
    }

    return {
      canReview: true,
      completedBookingId: completedBooking.id,
    };
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async updateGuideRating(
    tx: Prisma.TransactionClient,
    guideUserId: string,
  ): Promise<void> {
    // Calculate new average rating from all visible reviews
    const reviewStats = await tx.review.groupBy({
      by: ['overallRating'],
      where: {
        subjectId: guideUserId,
        status: ReviewStatus.VISIBLE,
      },
      _count: {
        overallRating: true,
      },
    });

    const totalReviews = reviewStats.reduce(
      (sum: number, stat) => sum + stat._count.overallRating,
      0,
    );

    const averageRating =
      totalReviews > 0
        ? reviewStats.reduce(
            (sum: number, stat) =>
              sum + stat.overallRating * stat._count.overallRating,
            0,
          ) / totalReviews
        : 0;

    // Update guide profile
    await tx.guideProfile.update({
      where: { userId: guideUserId },
      data: {
        averageRating,
        totalReviews,
      },
    });
  }

  private mapToResponseDto(review: ReviewWithRelations): ReviewResponseDto {
    const isEditable =
      review.status === ReviewStatus.VISIBLE &&
      (new Date().getTime() - review.createdAt.getTime()) /
        (1000 * 60 * 60 * 24) <=
        30;

    return {
      id: review.id,
      overallRating: review.overallRating,
      communicationRating: review.communicationRating,
      punctualityRating: review.punctualityRating,
      knowledgeRating: review.knowledgeRating,
      valueRating: review.valueRating,
      comment: review.comment,
      status: review.status,
      guideResponse: review.guideResponse,
      respondedAt: review.respondedAt?.toISOString() || null,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      author: {
        id: review.author.id,
        fullName: review.author.touristProfile?.fullName || 'Unknown',
        displayName: review.author.touristProfile?.displayName || null,
        avatarUrl: review.author.avatar?.id || null,
      },
      subject: {
        id: review.subject.id,
        fullName: review.subject.guideProfile?.fullName || 'Unknown',
        displayName: review.subject.guideProfile?.displayName || null,
        avatarUrl: review.subject.avatar?.id || null,
      },
      booking: {
        id: review.booking.id,
        tripDate: review.booking.tripDate.toISOString().split('T')[0],
        experienceTitle: review.booking.experience?.title || 'Unknown',
      },
      isEditable,
    };
  }
}
