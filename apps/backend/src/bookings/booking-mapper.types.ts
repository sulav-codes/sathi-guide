import type { Prisma } from '../generated/prisma/client';
import type {
  BookingStatus,
  Currency,
  PricingUnit,
  Role,
} from '../generated/prisma/client';

export interface BookingWithRelations {
  id: string;
  touristId: string;
  experienceId: string;
  tripDate: Date;
  startTime: string | null;
  endTime: string | null;
  durationHours: Prisma.Decimal | null;
  groupSize: number;
  touristNote: string | null;
  guideNote: string | null;
  currency: Currency;
  createdAt: Date;
  updatedAt: Date;
  tourist: {
    id: string;
    phone: string | null;
    touristProfile: {
      fullName: string;
      displayName: string | null;
    } | null;
    avatar: {
      id: string;
    } | null;
  };
  experience: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    coverImageId: string | null;
    coverImage: { key: string } | null;
    durationHours: Prisma.Decimal;
    difficulty: string | null;
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
      user: {
        avatar: {
          id: string;
        } | null;
      };
    };
  };
  pricingSnapshot?: {
    id: string;
    unit: PricingUnit;
    agreedRate: Prisma.Decimal;
    currency: Currency;
    groupSize: number;
    durationHours: Prisma.Decimal | null;
    baseAmount: Prisma.Decimal;
    discountAmount: Prisma.Decimal;
    platformFeeAmount: Prisma.Decimal;
    platformFeePercent: Prisma.Decimal;
    taxAmount: Prisma.Decimal;
    totalAmount: Prisma.Decimal;
    promoCodeApplied: string | null;
    promoDiscountAmount: Prisma.Decimal | null;
  } | null;
  stateLog: {
    id: string;
    fromStatus: BookingStatus | null;
    toStatus: BookingStatus;
    actorId: string;
    actorRole: Role;
    reason: string | null;
    reasonCode: string | null;
    note: string | null;
    metadata: Prisma.JsonValue | null;
    createdAt: Date;
  }[];
}
