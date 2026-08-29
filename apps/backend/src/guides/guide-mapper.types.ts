import type { Prisma } from '../generated/prisma/client';
import type { Gender, VerificationStatus } from '../generated/prisma/client';

/**
 * Shape returned by Prisma when querying a GuideProfile with
 * `include: { user, location: { include: { location } }, expertiseCategories: { include: { category } } }`
 *
 * Used by `mapToListItem` and `mapToDetailResponse` in the guides service.
 */
export interface GuideWithRelations {
  id: string;
  fullName: string;
  displayName: string | null;
  bio: string | null;
  gender: Gender | null;
  languagesSpoken: string[];
  experienceYears: number;
  totalTripsCompleted: number;
  averageRating: Prisma.Decimal;
  totalReviews: number;
  currentVerificationStatus: VerificationStatus;
  user: {
    avatar: { key: string } | null;
  };
  location?: {
    location: {
      city: string;
      district: string;
      province: string | null;
      country: string;
      latitude: Prisma.Decimal;
      longitude: Prisma.Decimal;
    };
  } | null;
  expertiseCategories: {
    categoryId: string;
    yearsOfExperience: number | null;
    category: {
      name: string;
      slug: string;
    };
  }[];
}

/**
 * Extended shape for the detail view — includes dateOfBirth, totalEarnings, and createdAt.
 */
export interface GuideDetailWithRelations extends GuideWithRelations {
  dateOfBirth: Date | null;
  totalEarnings: Prisma.Decimal;
  createdAt: Date;
}

/**
 * Computed review statistics passed to `mapToDetailResponse`.
 */
export interface GuideReviewStats {
  totalReviews: number;
  averageRating: number;
  reviewDistribution: {
    fiveStar: number;
    fourStar: number;
    threeStar: number;
    twoStar: number;
    oneStar: number;
  };
}
