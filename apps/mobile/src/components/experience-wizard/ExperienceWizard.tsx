import { useState, useRef } from "react";
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
    draftExperienceId: initialValues?.draftExperienceId ?? initialExperienceId,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const experienceIdRef = useRef<string | undefined>(initialExperienceId);
  const [experienceIdState, setExperienceIdState] = useState<
    string | undefined
  >(initialExperienceId);

  const experienceId = experienceIdState ?? formData.draftExperienceId;
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
      let resolvedId = experienceIdRef.current ?? experienceId;
      console.log(
        "[Wizard] handleNext step",
        currentStep,
        "resolvedId =",
        resolvedId,
      );

      if (currentStep === 0) {
        if (resolvedId) {
          // Update draft (works for edit mode AND if they went back in create mode)
          await apiClient.updateExperience(resolvedId, {
            title: formData.title,
            categoryId: formData.categoryId,
            shortDescription: formData.shortDescription,
            description: formData.fullDescription,
          });
        } else if (!isEditMode) {
          const res = await apiClient.createDraftExperience({
            title: formData.title,
            categoryId: formData.categoryId,
            shortDescription: formData.shortDescription,
            description: formData.fullDescription,
          });

          resolvedId = res.id;
          experienceIdRef.current = res.id;
          setExperienceIdState(res.id);

          setFormData((prev) => ({ ...prev, draftExperienceId: res.id }));
          console.log("[Wizard] Draft created, id =", res.id);
        }
      } else if (currentStep === 1) {
        if (!resolvedId)
          throw new Error("Experience ID missing on step 2. Please restart.");
        if (!formData.latitude || !formData.longitude) {
          throw new Error(
            "Please tap on the map to pin your meeting location.",
          );
        }
        if (!formData.district.trim()) {
          throw new Error(
            "District is required. Please fill in the location details.",
          );
        }

        await apiClient.updateExperienceLocation(resolvedId, {
          location: {
            latitude: formData.latitude,
            longitude: formData.longitude,
            addressLine: formData.meetingPoint || undefined,
            city: formData.municipality || formData.district,
            district: formData.district,
            province: formData.province || undefined,
          },
        });
      } else if (currentStep === 2) {
        if (!resolvedId)
          throw new Error("Experience ID missing on step 3. Please restart.");

        await apiClient.updateExperience(resolvedId, {
          durationHours: Number(formData.durationHours),
          maxParticipants: Number(formData.maxGroupSize),
          difficulty: formData.difficulty || undefined,
          inclusions: formData.includedItems
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
          cancellationPolicy: formData.requirements,
        });
      } else if (currentStep === 3) {
        if (!resolvedId)
          throw new Error("Experience ID missing on step 4. Please restart.");

        await apiClient.updateExperiencePricing(resolvedId, {
          basePrice: Number(formData.basePrice),
          pricingRules: [
            {
              name: "Standard",
              unit: (formData.pricingType === "per_person"
                ? "PER_PERSON"
                : "PER_GROUP") as any,
              amount: Number(formData.basePrice),
            },
          ],
        });
      }

      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        if (!resolvedId) {
          throw new Error(
            "Experience ID is missing. Please restart the wizard.",
          );
        }
        if (!isEditMode) {
          await apiClient.publishExperience(resolvedId);
        }
        onSubmit(formData);
      }
    } catch (err: any) {
      const errorMessage = Array.isArray(err?.message)
        ? err.message.join("\n")
        : err?.message || "Failed to save step.";
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
