// src/types/index.ts

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
  icon: string;
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
