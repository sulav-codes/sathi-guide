import type { Prisma } from '../generated/prisma/client';
import type {
  Currency,
  ExperienceDifficulty,
  ExperienceStatus,
  PricingUnit,
} from '../generated/prisma/client';

export interface ExperienceWithRelations {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImageId: string | null;
  coverImage: {
    key: string;
  } | null;
  basePrice: Prisma.Decimal;
  currency: Currency;
  durationHours: Prisma.Decimal;
  minParticipants: number;
  maxParticipants: number;
  difficulty: ExperienceDifficulty | null;
  averageRating: Prisma.Decimal;
  totalReviews: number;
  status: ExperienceStatus;
  isActive: boolean;
  languagesOffered: string[];
  categoryId: string;
  category: {
    name: string;
    slug: string;
  };
  location: {
    city: string;
    district: string;
    province: string | null;
    country: string;
    latitude: Prisma.Decimal;
    longitude: Prisma.Decimal;
    addressLine: string | null;
  };
  guideProfile: {
    id: string;
    fullName: string;
    displayName: string | null;
    averageRating: Prisma.Decimal;
    totalReviews: number;
    languagesSpoken: string[];
    user: {
      avatar: { key: string } | null;
    };
  };
}

export interface ExperienceDetailWithRelations extends ExperienceWithRelations {
  description: string;
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string | null;
  createdAt: Date;
  updatedAt: Date;
  meetingLocation?: {
    city: string;
    district: string;
    province: string | null;
    country: string;
    latitude: Prisma.Decimal;
    longitude: Prisma.Decimal;
    addressLine: string | null;
  } | null;
  images?: {
    id: string;
    mediaId: string;
    displayOrder: number;
    media: {
      key: string;
    };
  }[];
  pricingRules?: {
    id: string;
    name: string;
    unit: PricingUnit;
    amount: Prisma.Decimal;
    currency: Currency;
    validFrom: Date | null;
    validUntil: Date | null;
    minGroupSize: number | null;
    maxGroupSize: number | null;
    isActive: boolean;
  }[];
}
