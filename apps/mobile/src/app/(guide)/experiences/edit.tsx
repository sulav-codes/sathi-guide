import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ExperienceWizard } from "@/components/experience-wizard/ExperienceWizard";
import { WizardFormData } from "@/components/experience-wizard/types";
import { useExperience, useUpdateExperience } from "@/hooks/use-experiences";
import { UpdateExperienceDto } from "@/types/api";

export default function EditExperienceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  
  const { data: experience, isLoading } = useExperience(id as string);
  const updateExperience = useUpdateExperience(id as string);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!experience) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>Experience not found</Text>
      </SafeAreaView>
    );
  }

  const initialValues: Partial<WizardFormData> = {
    title: experience.title,
    shortDescription: experience.shortDescription,
    fullDescription: experience.description,
    categoryId: experience.category?.id || "",
    durationHours: experience.durationHours.toString(),
    maxGroupSize: experience.maxParticipants.toString(),
    difficulty: (experience.difficulty as WizardFormData["difficulty"]) || "",
    basePrice: experience.basePrice?.toString() || "0",
    // Infer pricing type from the first active pricing rule
    pricingType: experience.pricingRules?.[0]?.unit === "PER_GROUP" ? "flat_rate" : "per_person",
    // Location
    province: experience.location?.province || "",
    district: experience.location?.district || "",
    municipality: experience.location?.city || "",
    meetingPoint: experience.location?.addressLine || "",
    latitude: experience.location?.latitude ? parseFloat(experience.location.latitude) : undefined,
    longitude: experience.location?.longitude ? parseFloat(experience.location.longitude) : undefined,
    includedItems: experience.inclusions?.join('\n') || "",
    // Backend now returns the full public Supabase URL directly
    images: experience.images?.map(img => ({
      localUri: img.url,
      mediaId: img.mediaId,
      imageId: img.id,
    })) || [],
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>
          Edit Experience
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <ExperienceWizard
          initialValues={initialValues}
          isLoading={updateExperience.isPending}
          isEditMode={true}
          experienceId={id as string}
          onSubmit={(data: WizardFormData) => {
            const updateData: UpdateExperienceDto = {
              title: data.title,
              shortDescription: data.shortDescription,
              description: data.fullDescription,
              categoryId: data.categoryId,
              durationHours: Number(data.durationHours),
              maxParticipants: Number(data.maxGroupSize),
              inclusions: data.includedItems.split('\n').map(s => s.trim()).filter(Boolean),
            };

            updateExperience.mutate(updateData, {
              onSuccess: () => {
                Alert.alert("Success", "Experience updated successfully.");
                router.back();
              },
              onError: (err: any) => {
                const errorMessage = Array.isArray(err?.message) 
                  ? err.message.join('\n') 
                  : (err?.message || "Failed to update experience");
                Alert.alert("Error", errorMessage);
              }
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}