// src/data/index.ts

import { Category, DateItem, Experience, Guide, Inclusion } from "../types";

export const CATEGORIES: Category[] = [
  {
    id: "1",
    label: "Culture",
    icon: "building.columns.fill",
    color: "#EF4444",
  },
  {
    id: "2",
    label: "Hiking",
    icon: "figure.walk",
    color: "#2DBE6C",
  },
  {
    id: "3",
    label: "Food",
    icon: "fork.knife",
    color: "#F5820A",
  },
  {
    id: "4",
    label: "Nature",
    icon: "photo.on.rectangle.angled.fill",
    color: "#10B981",
  },
  {
    id: "5",
    label: "Adventure",
    icon: "figure.outdoor.cycle.circle.fill",
    color: "#1A73E8",
  },
];

export const EXPERIENCES: Experience[] = [
  {
    id: "1",
    title: "Kathmandu Heritage Walk",
    rating: 4.9,
    reviews: 128,
    price: "NPR 1,500",
    priceValue: 1500,
    image: "https://picsum.photos/seed/kathmandu/200/200",
    duration: "3–4 hrs",
    location: "Kathmandu, Nepal",
  },
  {
    id: "2",
    title: "Day Hike to Nagarkot",
    rating: 4.8,
    reviews: 96,
    price: "NPR 2,200",
    priceValue: 2200,
    image: "https://picsum.photos/seed/nagarkot/200/200",
    duration: "6–8 hrs",
    location: "Nagarkot, Nepal",
  },
  {
    id: "3",
    title: "Momo Cooking Experience",
    rating: 4.9,
    reviews: 74,
    price: "NPR 1,800",
    priceValue: 1800,
    image: "https://picsum.photos/seed/momo/200/200",
    duration: "2–3 hrs",
    location: "Kathmandu, Nepal",
  },
  {
    id: "4",
    title: "Trishuli River Rafting",
    rating: 4.7,
    reviews: 55,
    price: "NPR 2,500",
    priceValue: 2500,
    image: "https://picsum.photos/seed/rafting/200/200",
    duration: "4–5 hrs",
    location: "Trishuli, Nepal",
  },
];

export const BOOKING_DATES: DateItem[] = [
  { day: "Sat", date: 24, month: "May" },
  { day: "Sun", date: 25, month: "May" },
  { day: "Mon", date: 26, month: "May" },
  { day: "Tue", date: 27, month: "May" },
  { day: "Wed", date: 28, month: "May" },
];

export const GUIDE: Guide = {
  id: "1",
  name: "Nima Sherpa",
  role: "Licensed Tour Guide",
  rating: 4.9,
  reviews: 256,
  travelers: 256,
  yearsExp: 5,
  avatar: "https://picsum.photos/seed/nima/120/120",
  about:
    "Namaste! I'm Nima, a local guide from Kathmandu. I love sharing Nepal's culture, mountains and hidden gems with travelers from around the world. Let's explore together!",
  languages: ["English", "Nepali", "Hindi"],
};

export const INCLUSIONS: Inclusion[] = [
  { id: "1", label: "Local Guide" },
  { id: "2", label: "Bottled Water" },
  { id: "3", label: "Entrance Fees" },
  { id: "4", label: "Local Tips & Stories" },
];

export const TOP_EXPERIENCES: Experience[] = [
  {
    id: "1",
    title: "Kathmandu Heritage Walk",
    rating: 4.9,
    reviews: 128,
    price: "NPR 1,500",
    priceValue: 1500,
    image: "https://picsum.photos/seed/boudha/200/200",
  },
  {
    id: "2",
    title: "Day Hike to Nagarkot",
    rating: 4.8,
    reviews: 96,
    price: "NPR 2,200",
    priceValue: 2200,
    image: "https://picsum.photos/seed/nagarkot2/200/200",
  },
  {
    id: "3",
    title: "Bhaktapur Cultural Tour",
    rating: 4.9,
    reviews: 82,
    price: "NPR 1,800",
    priceValue: 1800,
    image: "https://picsum.photos/seed/bhaktapur/200/200",
  },
];
