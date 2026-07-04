// src/types/index.ts

export type IconSymbolName =
  | "house.fill"
  | "paperplane.fill"
  | "chevron.right"
  | "chevron.left"
  | "calendar"
  | "message.fill"
  | "person.fill"
  | "line.3.horizontal"
  | "bell.fill"
  | "magnifyingglass"
  | "building.columns.fill"
  | "figure.walk"
  | "fork.knife"
  | "photo.on.rectangle.angled.fill"
  | "heart"
  | "figure.outdoor.cycle.circle.fill"
  | "envelope"
  | "lock.fill"
  | "eye"
  | "eye.slash"
  | "exclamationmark.triangle.fill"
  | "globe"
  | "applelogo"
  | "phone.fill"
  | "suitcase.fill"
  | "map.fill"
  | "mountain.2.fill"
  | "checkmark.circle.fill"
  | "circle"
  | "checkmark";

export interface Experience {
  id: string;
  title: string;
  rating: number;
  reviews: number;
  price: string;
  priceValue: number;
  image: string;
  duration?: string;
  location?: string;
}

export interface Category {
  id: string;
  label: string;
  icon: IconSymbolName;
  color: string;
}

export interface DateItem {
  day: string;
  date: number;
  month: string;
}

export interface Guide {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  travelers: number;
  yearsExp: number;
  avatar: string;
  about: string;
  languages: string[];
}

export interface Inclusion {
  id: string;
  label: string;
}

export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword?: string;
  fullName?: string;
  phone?: string;
  experienceYears?: string;
  languages?: string[];
  hasGuideLicense?: boolean;
  licenseNumber?: string;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  phone?: string;
  experienceYears?: string;
  languages?: string;
  hasGuideLicense?: string;
  licenseNumber?: string;
  gender?: string;
  nationality?: string;
  preferredLanguage?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  terms?: string;
}

// Re-export auth types for convenience
export * from './auth';
