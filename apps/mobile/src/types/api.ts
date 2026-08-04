// src/types/api.ts
import { Category, Experience, Guide } from "./index";
import { UserRole } from "./auth";

// Enums
export type ExperienceStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
export type ExperienceDifficulty = "EASY" | "MODERATE" | "CHALLENGING" | "DIFFICULT";
export type PricingUnit = "PER_PERSON" | "PER_GROUP" | "PER_HOUR" | "PER_DAY" | "FLAT_RATE";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED_BY_TOURIST"
  | "CANCELLED_BY_GUIDE"
  | "COMPLETED"
  | "REFUNDED";

export type Currency = "NPR" | "USD";

// Generic Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Category shape returned by GET /experiences/categories
export interface ExperienceCategoryApi {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: string | null;
  color: string | null;
}

// Shared Sub-types
export interface ExperienceCategoryResponse {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconKey: string | null;
}

export interface ExperienceLocationResponse {
  city: string;
  district: string;
  province: string | null;
  country: string;
  latitude: string;
  longitude: string;
  addressLine: string | null;
}

export interface ExperienceGuideResponse {
  id: string;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
  averageRating: string;
  totalReviews: number;
  languagesSpoken: string[];
}

export interface ExperiencePricingRuleResponse {
  id: string;
  name: string;
  unit: PricingUnit;
  amount: string;
  currency: Currency;
  minGroupSize: number | null;
  maxGroupSize: number | null;
  isActive: boolean;
}

export interface ExperienceImageResponse {
  id: string;
  mediaId: string;
  url: string;
  displayOrder: number;
}

// Experience Types
export interface ExperienceListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: { key: string; url: string } | null;
  basePrice: string;
  currency: Currency;
  durationHours: string;
  minParticipants: number;
  maxParticipants: number;
  difficulty: ExperienceDifficulty | null;
  averageRating: string;
  totalReviews: number;
  status: ExperienceStatus;
  isActive: boolean;
  languagesOffered: string[];
  category: ExperienceCategoryResponse;
  location: ExperienceLocationResponse;
  guide: ExperienceGuideResponse;
}

export interface ExperienceDetail extends ExperienceListItem {
  description: string;
  inclusions: string[];
  exclusions: string[];
  cancellationPolicy: string | null;
  meetingLocation: ExperienceLocationResponse | null;
  images: ExperienceImageResponse[];
  pricingRules: ExperiencePricingRuleResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface MyExperienceListItem extends Omit<ExperienceListItem, "guide"> {
  createdAt: string;
  updatedAt: string;
  totalBookings: number;
  upcomingBookings: number;
}

// Booking Sub-types
export interface BookingGuideResponse {
  id: string;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
  averageRating: string;
  totalReviews: number;
}

export interface BookingExperienceResponse {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  coverImage: { key: string; url: string } | null;
  durationHours: string;
  difficulty: string | null;
}

export interface BookingTouristResponse {
  id: string;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
  phone: string | null;
}

export interface BookingPricingSnapshotResponse {
  id: string;
  unit: PricingUnit;
  agreedRate: string;
  currency: Currency;
  groupSize: number;
  durationHours: string | null;
  baseAmount: string;
  discountAmount: string;
  platformFeeAmount: string;
  platformFeePercent: string;
  taxAmount: string;
  totalAmount: string;
  promoCodeApplied: string | null;
  promoDiscountAmount: string | null;
}

export interface BookingStateLogEntry {
  id: string;
  fromStatus: BookingStatus | null;
  toStatus: BookingStatus;
  actorId: string;
  actorRole: string;
  reason: string | null;
  reasonCode: string | null;
  note: string | null;
  createdAt: string;
}

// Booking Types
export interface BookingResponse {
  id: string;
  status: BookingStatus;
  tripDate: string;
  startTime: string | null;
  endTime: string | null;
  durationHours: string | null;
  groupSize: number;
  touristNote: string | null;
  guideNote: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  tourist: BookingTouristResponse;
  guide: BookingGuideResponse;
  experience: BookingExperienceResponse;
  pricingSnapshot: BookingPricingSnapshotResponse | null;
  stateLog: BookingStateLogEntry[];
  canCancel: boolean;
  canReview: boolean;
}

// Guide Types
export interface GuideExpertiseCategory {
  categoryId: string;
  yearsOfExperience: number | null;
  category: {
    name: string;
    slug: string;
  };
}

export interface GuideListItem {
  id: string;
  fullName: string;
  displayName: string | null;
  bio: string | null;
  gender: string | null;
  languagesSpoken: string[];
  experienceYears: number;
  totalTripsCompleted: number;
  averageRating: string;
  totalReviews: number;
  currentVerificationStatus: string;
  user: {
    avatarId: string | null;
  };
  location?: {
    location: {
      city: string;
      district: string;
      province: string | null;
      country: string;
      latitude: string;
      longitude: string;
    };
  } | null;
  expertiseCategories: GuideExpertiseCategory[];
}

export interface GuideDetail extends GuideListItem {
  dateOfBirth: string | null;
  totalEarnings: string;
  createdAt: string;
}

// DTOs for Creation / Updates
export interface CreateExperienceDto {
  title: string;
  slug?: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  destinationId?: string;
  difficulty?: ExperienceDifficulty;
  durationHours: number;
  minParticipants: number;
  maxParticipants: number;
  languagesOffered: string[];
  inclusions?: string[];
  exclusions?: string[];
  cancellationPolicy?: string;
  coverImageId?: string;
  imageIds?: string[];
  location: {
    latitude: number;
    longitude: number;
    addressLine?: string;
    city: string;
    district: string;
    province?: string;
    country?: string;
  };
  meetingLocation?: {
    latitude: number;
    longitude: number;
    addressLine?: string;
    city: string;
    district: string;
    province?: string;
    country?: string;
  };
  pricingRules: {
    name: string;
    unit: PricingUnit;
    amount: number;
    currency?: Currency;
    minGroupSize?: number;
    maxGroupSize?: number;
  }[];
  basePrice?: number;
  currency?: Currency;
}

export type UpdateExperienceDto = Partial<Omit<CreateExperienceDto, 'slug' | 'location' | 'meetingLocation' | 'pricingRules'>>;

export interface CreateBookingDto {
  experienceId: string;
  tripDate: string;
  startTime?: string;
  endTime?: string;
  durationHours?: number;
  groupSize: number;
  touristNote?: string;
  pricingRuleId?: string;
  promoCode?: string;
}
