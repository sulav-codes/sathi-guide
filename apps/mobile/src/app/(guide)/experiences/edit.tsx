import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ExperienceForm } from "@/components/ExperienceForm";
import { useExperience, useUpdateExperience } from "@/hooks/use-experiences";
import { CreateExperienceDto } from "@/types/api";

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

  const initialValues: Partial<CreateExperienceDto> = {
    title: experience.title,
    shortDescription: experience.shortDescription,
    description: experience.description,
    categoryId: experience.category.id,
    difficulty: experience.difficulty || "MODERATE",
    durationHours: parseFloat(experience.durationHours),
    minParticipants: experience.minParticipants,
    maxParticipants: experience.maxParticipants,
    basePrice: parseFloat(experience.basePrice),
    location: {
      ...experience.location,
      latitude: parseFloat(experience.location.latitude),
      longitude: parseFloat(experience.location.longitude),
      addressLine: experience.location.addressLine || undefined,
      province: experience.location.province || undefined,
    },
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
        <ExperienceForm
          initialValues={initialValues}
          isLoading={updateExperience.isPending}
          submitLabel="Save Changes"
          onSubmit={(data) => {
            updateExperience.mutate(data, {
              onSuccess: () => {
                Alert.alert("Success", "Experience updated successfully.");
                router.back();
              },
              onError: (err: any) => {
                Alert.alert("Error", err?.message || "Failed to update experience");
              }
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}