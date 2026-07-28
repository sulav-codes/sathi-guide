import { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ThemedView } from "../themed-view";
import { ThemedText } from "../themed-text";
import { WizardFormData, DEFAULT_FORM_DATA } from "./types";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepLocation } from "./StepLocation";
import { StepDetails } from "./StepDetails";
import { StepPricing } from "./StepPricing";
import { StepReview } from "./StepReview";

interface ExperienceWizardProps {
  initialValues?: Partial<WizardFormData>;
  onSubmit: (data: WizardFormData) => void;
  isLoading?: boolean;
  isEditMode?: boolean;
}

export function ExperienceWizard({
  initialValues,
  onSubmit,
  isLoading = false,
  isEditMode = false,
}: ExperienceWizardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [formData, setFormData] = useState<WizardFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialValues,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const updateData = (updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const steps = [
    { component: StepBasicInfo, title: "Basic Info" },
    { component: StepLocation, title: "Location" },
    { component: StepDetails, title: "Details" },
    { component: StepPricing, title: "Pricing" },
    { component: StepReview, title: "Review" },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onSubmit(formData);
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
            isSaving={isLoading}
            isEditMode={isEditMode}
          />
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
