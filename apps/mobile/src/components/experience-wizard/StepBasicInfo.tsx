import { View, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { WizardStepProps } from "./types";
import { WizardFooter } from "./WizardFooter";
import { ThemedText } from "../themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useCategories } from "@/hooks/use-experiences";
import { IconSymbol } from "../ui/icon-symbol";

export function StepBasicInfo({
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
  const { data: categories } = useCategories();

  const isNextDisabled = 
    !formData.title.trim() || 
    !formData.categoryId || 
    !formData.shortDescription.trim();

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5 pt-6 pb-4" keyboardShouldPersistTaps="handled">
        <ThemedText className="text-3xl font-extrabold mb-8 tracking-tight">
          Basic Info
        </ThemedText>

        {/* Title */}
        <View className="mb-8">
          <ThemedText className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">EXPERIENCE TITLE</ThemedText>
          <TextInput
            className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-base"
            style={{ color: colors.text }}
            placeholder="e.g. Sunrise hike to Nagarkot"
            placeholderTextColor="#9CA3AF"
            value={formData.title}
            onChangeText={(val) => updateData({ title: val })}
            maxLength={100}
          />
          <ThemedText className="text-xs text-gray-400 mt-2 text-right">
            {formData.title.length}/100
          </ThemedText>
        </View>

        {/* Category */}
        <View className="mb-8">
          <ThemedText className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">CATEGORY</ThemedText>
          <View className="flex-row flex-wrap gap-3">
            {categories?.map((cat) => {
              const isSelected = formData.categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => updateData({ categoryId: cat.id })}
                  className={`flex-row items-center px-4 py-2.5 rounded-2xl border ${
                    isSelected ? 'border-transparent' : 'border-gray-200 bg-white'
                  }`}
                  style={{
                    backgroundColor: isSelected ? cat.color : undefined,
                  }}
                >
                  <IconSymbol 
                    name={cat.icon} 
                    size={18} 
                    color={isSelected ? '#fff' : colors.text} 
                  />
                  <ThemedText 
                    className="ml-2 font-medium" 
                    style={{ color: isSelected ? '#fff' : colors.text }}
                  >
                    {cat.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Short Description */}
        <View className="mb-8">
          <ThemedText className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">SHORT DESCRIPTION</ThemedText>
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            A 1-2 line summary that appears on the card.
          </ThemedText>
          <TextInput
            className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-base"
            style={{ color: colors.text }}
            placeholder="Enjoy a breathtaking sunrise over the Himalayas..."
            placeholderTextColor="#9CA3AF"
            value={formData.shortDescription}
            onChangeText={(val) => updateData({ shortDescription: val })}
            multiline
            numberOfLines={3}
            maxLength={150}
            textAlignVertical="top"
          />
          <ThemedText className="text-xs text-gray-400 mt-2 text-right">
            {formData.shortDescription.length}/150
          </ThemedText>
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
