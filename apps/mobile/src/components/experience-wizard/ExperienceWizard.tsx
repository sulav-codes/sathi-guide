import { useState } from "react";
import { View, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ThemedView } from "../themed-view";
import { ThemedText } from "../themed-text";
import { WizardFormData, DEFAULT_FORM_DATA } from "./types";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepLocation } from "./StepLocation";
import { StepDetails } from "./StepDetails";
import { StepPricing } from "./StepPricing";
import { StepImages } from "./StepImages";
import { StepReview } from "./StepReview";
import { apiClient } from "@/lib/api";

interface ExperienceWizardProps {
  initialValues?: Partial<WizardFormData>;
  onSubmit: (data: WizardFormData) => void;
  isEditMode?: boolean;
  experienceId?: string;
  isLoading?: boolean;
}

export function ExperienceWizard({
  initialValues,
  onSubmit,
  isEditMode = false,
  experienceId: initialExperienceId,
  isLoading = false,
}: ExperienceWizardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [formData, setFormData] = useState<WizardFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialValues,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [experienceId, setExperienceId] = useState<string | undefined>(initialExperienceId);
  const [isSaving, setIsSaving] = useState(false);

  const updateData = (updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const steps = [
    { component: StepBasicInfo, title: "Basic Info" },
    { component: StepLocation, title: "Location" },
    { component: StepDetails, title: "Details" },
    { component: StepPricing, title: "Pricing" },
    { component: StepImages, title: "Photos" },
    { component: StepReview, title: "Review" },
  ];

  const handleNext = async () => {
    setIsSaving(true);
    try {
      if (currentStep === 0 && !isEditMode) {
        // Step 1: Create Draft
        const res = await apiClient.createDraftExperience({
          title: formData.title,
          categoryId: formData.categoryId,
          shortDescription: formData.shortDescription,
          description: formData.fullDescription,
        });
        setExperienceId(res.id);
      } else if (currentStep === 0 && isEditMode && experienceId) {
        await apiClient.updateExperience(experienceId, {
          title: formData.title,
          categoryId: formData.categoryId,
          shortDescription: formData.shortDescription,
          description: formData.fullDescription,
        });
      } else if (currentStep === 1 && experienceId) {
        // Step 2: Location
        await apiClient.updateExperienceLocation(experienceId, {
          location: {
            latitude: formData.latitude || 0,
            longitude: formData.longitude || 0,
            addressLine: formData.meetingPoint,
            city: formData.municipality || formData.district,
            district: formData.district,
            province: formData.province,
          }
        });
      } else if (currentStep === 2 && experienceId) {
        // Step 3: Details (PATCH main experience fields)
        await apiClient.updateExperience(experienceId, {
          durationHours: Number(formData.durationHours),
          maxParticipants: Number(formData.maxGroupSize),
          inclusions: formData.includedItems.split('\n').map(s => s.trim()).filter(Boolean),
          cancellationPolicy: formData.requirements, // Hack: using cancellationPolicy for requirements for now
        });
      } else if (currentStep === 3 && experienceId) {
        // Step 4: Pricing
        await apiClient.updateExperiencePricing(experienceId, {
          basePrice: Number(formData.basePrice),
          pricingRules: [
            {
              name: "Standard",
              unit: (formData.pricingType === "per_person" ? "PER_PERSON" : "PER_GROUP") as any,
              amount: Number(formData.basePrice),
            }
          ]
        });
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        if (!experienceId) {
          throw new Error("Experience ID is missing. Please restart the wizard.");
        }
        
        if (!isEditMode) {
          // Final publish only on creation flow
          await apiClient.publishExperience(experienceId);
        }
        
        onSubmit(formData);
      }
    } catch (err: any) {
      const errorMessage = Array.isArray(err?.message) 
        ? err.message.join('\n') 
        : (err?.message || "Failed to save step.");
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ThemedView className="flex-1 rounded-3xl">
        {/* Progress Indicator */}
        <View className="px-5 py-5 border-b border-gray-100 dark:border-gray-900">
          <ThemedText className="text-xs font-bold mb-3 tracking-widest text-gray-400 uppercase">
            STEP {currentStep + 1} OF {steps.length} —{" "}
            {steps[currentStep].title}
          </ThemedText>
          <View className="flex-row h-2 gap-2">
            {steps.map((_, index) => (
              <View
                key={index}
                className={`flex-1 rounded-full ${index <= currentStep ? "" : "bg-gray-200 dark:bg-neutral-800"}`}
                style={{
                  backgroundColor:
                    index <= currentStep
                      ? colors.tint
                      : colorScheme === "dark"
                        ? "#374151"
                        : "#E5E7EB",
                }}
              />
            ))}
          </View>
        </View>

        {/* Step Content */}
        <View className="flex-1">
          <CurrentStepComponent
            formData={formData}
            updateData={updateData}
            onNext={handleNext}
            onPrev={handlePrev}
            isFirstStep={currentStep === 0}
            isLastStep={currentStep === steps.length - 1}
            isSaving={isSaving || isLoading}
            isEditMode={isEditMode}
            experienceId={experienceId}
          />
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
