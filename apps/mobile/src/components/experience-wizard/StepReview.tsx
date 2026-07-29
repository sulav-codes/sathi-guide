import { View, ScrollView, Image as import_Image } from "react-native";
import { WizardStepProps } from "./types";
import { WizardFooter } from "./WizardFooter";
import { ThemedText } from "../themed-text";
import { useCategories } from "@/hooks/use-experiences";

export function StepReview({
  formData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  isSaving,
}: WizardStepProps) {
  const { data: categories } = useCategories();
  const selectedCategory = categories?.find(c => c.id === formData.categoryId);

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5 pt-6 pb-4">
        <ThemedText className="text-3xl font-extrabold mb-6 tracking-tight">
          Review Experience
        </ThemedText>

        <View className="bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden border border-gray-200 dark:border-neutral-800">
          
          {formData.coverImageLocalUri && (
            <View className="w-full h-48 bg-gray-200 dark:bg-neutral-800">
              <import_Image source={{ uri: formData.coverImageLocalUri }} className="w-full h-full" resizeMode="cover" />
            </View>
          )}

          <View className="p-6 space-y-5">
          
          <View className="mb-5">
            <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide">TITLE</ThemedText>
            <ThemedText className="font-bold text-xl">{formData.title}</ThemedText>
          </View>

          <View className="mb-5 flex-row justify-between border-b border-gray-100 dark:border-neutral-800 pb-5">
            <View>
              <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide">CATEGORY</ThemedText>
              <ThemedText className="font-medium text-base">{selectedCategory?.label || "None"}</ThemedText>
            </View>
            <View>
              <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide text-right">PRICE</ThemedText>
              <ThemedText className="font-bold text-lg text-green-600 dark:text-green-500">
                Rs. {formData.basePrice} <ThemedText className="text-sm font-normal text-gray-500 dark:text-gray-400">({formData.pricingType === "per_person" ? "Per Person" : "Flat Rate"})</ThemedText>
              </ThemedText>
            </View>
          </View>

          <View className="mb-5 border-b border-gray-100 dark:border-neutral-800 pb-5">
            <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide">LOCATION</ThemedText>
            <ThemedText className="text-base font-medium">{formData.meetingPoint}</ThemedText>
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {formData.district}, {formData.province}
            </ThemedText>
          </View>

          <View className="mb-5 flex-row justify-between border-b border-gray-100 dark:border-neutral-800 pb-5">
            <View>
              <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide">DURATION</ThemedText>
              <ThemedText className="text-base font-medium">{formData.durationHours} Hours</ThemedText>
            </View>
            <View>
              <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide text-right">MAX GROUP</ThemedText>
              <ThemedText className="text-base font-medium text-right">{formData.maxGroupSize} People</ThemedText>
            </View>
          </View>

          <View>
            <ThemedText className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 tracking-wide">SHORT DESCRIPTION</ThemedText>
            <ThemedText className="text-base leading-relaxed text-gray-700 dark:text-gray-300">{formData.shortDescription}</ThemedText>
          </View>

          </View>
        </View>
      </ScrollView>

      <WizardFooter 
        onNext={onNext} 
        onPrev={onPrev} 
        isFirstStep={isFirstStep} 
        isLastStep={isLastStep} 
        isSaving={isSaving} 
      />
    </View>
  );
}
