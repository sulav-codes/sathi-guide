import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ThemedText } from "../themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ThemedView } from "../themed-view";

interface WizardFooterProps {
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSaving: boolean;
  nextDisabled?: boolean;
}

export function WizardFooter({
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  isSaving,
  nextDisabled = false,
}: WizardFooterProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <ThemedView className="px-5 py-5 border-t border-gray-100 dark:border-neutral-900 flex-row justify-between items-center rounded-3xl">
      {!isFirstStep ? (
        <TouchableOpacity
          onPress={onPrev}
          disabled={isSaving}
          className="px-6 py-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900"
        >
          <ThemedText className="font-semibold">
            Back
          </ThemedText>
        </TouchableOpacity>
      ) : (
        <View /> // Placeholder for flex-between
      )}

      <TouchableOpacity
        onPress={onNext}
        disabled={isSaving || nextDisabled}
        style={{
          backgroundColor: isSaving || nextDisabled ? "#D1D5DB" : colors.tint,
        }}
        className="px-10 py-4 rounded-2xl flex-row items-center justify-center min-w-[140px]"
      >
        {isSaving ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText className="font-bold text-white tracking-wide">
            {isLastStep ? "Submit" : "Next"}
          </ThemedText>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
}
