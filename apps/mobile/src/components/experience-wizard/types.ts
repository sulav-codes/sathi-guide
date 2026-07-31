export type WizardFormData = {
  // Step 1: Basic Info (creates DRAFT)
  title: string;
  categoryId: string;
  shortDescription: string;
  fullDescription: string;

  // Step 2: Location
  province: string;
  district: string;
  municipality: string;
  meetingPoint: string;
  latitude?: number;
  longitude?: number;

  // Step 3: Details
  durationHours: string;
  maxGroupSize: string;
  includedItems: string; // split by newline on submit
  requirements: string;

  // Step 4: Pricing
  basePrice: string;
  pricingType: "per_person" | "flat_rate";

  // Step 5: Images (uploaded after draft is created)
  images: Array<{ localUri: string; mediaId: string; imageId?: string }>;
};

export const DEFAULT_FORM_DATA: WizardFormData = {
  title: "",
  categoryId: "",
  shortDescription: "",
  fullDescription: "",

  province: "",
  district: "",
  municipality: "",
  meetingPoint: "",
  latitude: undefined,
  longitude: undefined,

  durationHours: "",
  maxGroupSize: "10",
  includedItems: "",
  requirements: "",

  basePrice: "",
  pricingType: "per_person",

  images: [],
};

export type WizardStepProps = {
  formData: WizardFormData;
  updateData: (updates: Partial<WizardFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSaving: boolean;
  isEditMode?: boolean;
  /** The draft experience ID — available from Step 2 onwards */
  experienceId?: string;
};
