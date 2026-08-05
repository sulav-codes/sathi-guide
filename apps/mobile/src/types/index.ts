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
  | "bell.slash.fill"
  | "magnifyingglass"
  | "building.columns.fill"
  | "figure.walk"
  | "fork.knife"
  | "photo.on.rectangle.angled.fill"
  | "heart"
  | "figure.outdoor.cycle.circle.fill"
  | "envelope"
  | "envelope.fill"
  | "square.and.arrow.up"
  | "cross.case.fill"
  | "lock.fill"
  | "eye"
  | "eye.slash"
  | "exclamationmark.triangle.fill"
  | "globe"
  | "applelogo"
  | "phone.fill"
  | "suitcase.fill"
  | "map.fill"
  | "moon.fill"
  | "mountain.2.fill"
  | "checkmark.circle.fill"
  | "circle"
  | "checkmark"
  | "star.fill"
  | "shield.fill"
  | "person.crop.circle"
  | "person.crop.circle.badge.checkmark"
  | "trash"
  | "plus"
  | "arrow.left"
  | "share"
  | "clock"
  | "clock.fill"
  | "person.3.fill"
  | "tag"
  | "xmark.circle.fill"
  | "xmark"
  | "checkmark.seal.fill"
  | "checkmark.shield.fill"
  | "xmark.seal.fill"
  | "shield.lefthalf.filled"
  | "person.text.rectangle"
  | "doc.text.fill"
  | "leaf.fill"
  | "museum.fill"
  | "camera.fill"
  | "mappin.and.ellipse"
  | "photo"
  | "safari"
  ;

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
  slug?: string; // optional — used for icon/color mapping in useCategories
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

// Re-export auth types for convenience
export * from "./auth";
export * from "./api";
