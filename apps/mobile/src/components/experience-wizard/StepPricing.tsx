import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { WizardStepProps } from "./types";
import { WizardFooter } from "./WizardFooter";
import { ThemedText } from "../themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "../ui/icon-symbol";

export function StepPricing({
  formData,
  updateData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  isSaving,
  isEditMode,
}: WizardStepProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const isNextDisabled = !formData.basePrice.trim();

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5 pt-6 pb-4" keyboardShouldPersistTaps="handled">
        <ThemedText className="text-3xl font-extrabold mb-6 tracking-tight">Pricing</ThemedText>
        

        <View className="mb-8">
          <ThemedText className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">BASE PRICE (NPR)</ThemedText>
          <TextInput
            className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-3xl font-bold"
            style={{ color: colors.text }}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={formData.basePrice}
            onChangeText={(val) => updateData({ basePrice: val })}
          />
        </View>

        <View className="mb-8">
          <ThemedText className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">PRICING STRUCTURE</ThemedText>
          
          <TouchableOpacity
            onPress={() => updateData({ pricingType: "per_person" })}
            className={`p-4 rounded-2xl border mb-3 flex-row items-center ${
              formData.pricingType === "per_person" 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
            }`}
          >
            <IconSymbol 
              name="person.fill" 
              size={24} 
              color={formData.pricingType === "per_person" ? '#22C55E' : colors.text} 
            />
            <View className="ml-4 flex-1">
              <ThemedText className="font-semibold text-base mb-0.5">Per Person</ThemedText>
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                Charge this price for each traveler. Best for group tours.
              </ThemedText>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              formData.pricingType === "per_person" ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'
            }`}>
              {formData.pricingType === "per_person" && (
                <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => updateData({ pricingType: "flat_rate" })}
            className={`p-4 rounded-2xl border flex-row items-center ${
              formData.pricingType === "flat_rate" 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                : 'border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
            }`}
          >
            <IconSymbol 
              name="tag" 
              size={24} 
              color={formData.pricingType === "flat_rate" ? '#22C55E' : colors.text} 
            />
            <View className="ml-4 flex-1">
              <ThemedText className="font-semibold text-base mb-0.5">Flat Rate</ThemedText>
              <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
                Charge this price for the whole group. Best for private vehicle tours.
              </ThemedText>
            </View>
            <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
              formData.pricingType === "flat_rate" ? 'border-green-500' : 'border-gray-300 dark:border-gray-600'
            }`}>
              {formData.pricingType === "flat_rate" && (
                <View className="w-2.5 h-2.5 rounded-full bg-green-500" />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <WizardFooter 
        onNext={onNext} 
        onPrev={onPrev} 
        isFirstStep={isFirstStep} 
        isLastStep={isLastStep} 
        isSaving={isSaving} 
        nextDisabled={isNextDisabled && !isEditMode}
      />
    </View>
  );
}
