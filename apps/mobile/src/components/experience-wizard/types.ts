import { CreateExperienceDto } from "@/types/api";

export type WizardFormData = {
  // Step 1: Basic Info
  title: string;
  categoryId: string;
  shortDescription: string;
  
  // Step 2: Location
  province: string;
  district: string;
  municipality: string;
  meetingPoint: string;
  latitude?: number;
  longitude?: number;

  // Step 3: Details
  fullDescription: string;
  durationHours: string;
  maxGroupSize: string;
  includedItems: string; // we'll split by newline
  requirements: string; // we'll split by newline
  coverImageId: string;
  coverImageLocalUri?: string; // For optimistic UI display

  // Step 4: Pricing
  basePrice: string;
  pricingType: "per_person" | "flat_rate";
};

export const DEFAULT_FORM_DATA: WizardFormData = {
  title: "",
  categoryId: "",
  shortDescription: "",
  
  province: "",
  district: "",
  municipality: "",
  meetingPoint: "",
  latitude: undefined,
  longitude: undefined,

  fullDescription: "",
  durationHours: "",
  maxGroupSize: "10",
  includedItems: "",
  requirements: "",
  coverImageId: "",
  coverImageLocalUri: undefined,

  basePrice: "",
  pricingType: "per_person",
};

export type WizardStepProps = {
  formData: WizardFormData;
  updateData: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSaving: boolean;
  isEditMode?: boolean; // If true, disable certain fields
};
