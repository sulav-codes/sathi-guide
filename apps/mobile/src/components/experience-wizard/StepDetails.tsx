import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { WizardStepProps } from "./types";
import { WizardFooter } from "./WizardFooter";
import { ThemedText } from "../themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

const DIFFICULTIES = [
  { value: "EASY", label: "Easy", color: "#22C55E" },
  { value: "MODERATE", label: "Moderate", color: "#F59E0B" },
  { value: "CHALLENGING", label: "Challenging", color: "#EF4444" },
  { value: "DIFFICULT", label: "Difficult", color: "#7C3AED" },
] as const;

export function StepDetails({
  formData,
  updateData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  isSaving,
}: WizardStepProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const isNextDisabled =
    !formData.durationHours.trim() ||
    !formData.maxGroupSize.trim();

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5 pt-6 pb-4" keyboardShouldPersistTaps="handled">
        <ThemedText className="text-3xl font-extrabold mb-8 tracking-tight">
          Experience Details
        </ThemedText>

        <View className="flex-row gap-4 mb-8">
          <View className="flex-1">
            <ThemedText className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">DURATION (HOURS)</ThemedText>
            <TextInput
              className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-base"
              style={{ color: colors.text }}
              placeholder="e.g. 4"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={formData.durationHours}
              onChangeText={(val) => updateData({ durationHours: val })}
            />
          </View>
          <View className="flex-1">
            <ThemedText className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">MAX GROUP SIZE</ThemedText>
            <TextInput
              className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-base"
              style={{ color: colors.text }}
              placeholder="e.g. 10"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={formData.maxGroupSize}
              onChangeText={(val) => updateData({ maxGroupSize: val })}
            />
          </View>
        </View>

        <View className="mb-8">
          <ThemedText className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">DIFFICULTY LEVEL</ThemedText>
          <View className="flex-row flex-wrap gap-3">
            {DIFFICULTIES.map((d) => {
              const selected = formData.difficulty === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => updateData({ difficulty: d.value })}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 2,
                    borderColor: selected ? d.color : colorScheme === "dark" ? "#374151" : "#E5E7EB",
                    backgroundColor: selected
                      ? d.color + "20"
                      : colorScheme === "dark"
                      ? "#111827"
                      : "#F9FAFB",
                  }}
                >
                  <ThemedText
                    style={{
                      fontWeight: "600",
                      fontSize: 14,
                      color: selected ? d.color : colors.text,
                    }}
                  >
                    {d.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View className="mb-8">
          <ThemedText className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">WHAT&apos;S INCLUDED</ThemedText>
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            List items included in the price (one per line).
          </ThemedText>
          <TextInput
            className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-base"
            style={{ color: colors.text, minHeight: 120 }}
            placeholder={"e.g. Lunch\nEquipment\nTransport"}
            placeholderTextColor="#9CA3AF"
            value={formData.includedItems}
            onChangeText={(val) => updateData({ includedItems: val })}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View className="mb-8">
          <ThemedText className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">REQUIREMENTS</ThemedText>
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            List what travelers should bring or need to know (one per line).
          </ThemedText>
          <TextInput
            className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-base"
            style={{ color: colors.text, minHeight: 120 }}
            placeholder={"e.g. Good hiking shoes\nWater bottle\nWarm jacket"}
            placeholderTextColor="#9CA3AF"
            value={formData.requirements}
            onChangeText={(val) => updateData({ requirements: val })}
            multiline
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <WizardFooter
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isSaving={isSaving}
        nextDisabled={isNextDisabled}
      />
    </View>
  );
}
