import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ExperienceWizard } from "@/components/experience-wizard/ExperienceWizard";
import { WizardFormData } from "@/components/experience-wizard/types";
import { CreateExperienceDto } from "@/types/api";
import { useCreateExperience } from "@/hooks/use-experiences";

export default function CreateExperienceScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const createExperience = useCreateExperience();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>
          New Experience
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <ExperienceWizard
          isLoading={createExperience.isPending}
          onSubmit={(data: WizardFormData) => {
            const dto: CreateExperienceDto = {
              title: data.title,
              shortDescription: data.shortDescription,
              description: data.fullDescription,
              categoryId: data.categoryId,
              durationHours: Number(data.durationHours),
              minParticipants: 1,
              maxParticipants: Number(data.maxGroupSize),
              languagesOffered: ["English"],
              inclusions: data.includedItems.split('\n').map(s => s.trim()).filter(Boolean),
              coverImageId: data.coverImageId,
              location: {
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                addressLine: data.meetingPoint,
                city: data.municipality || data.district,
                district: data.district,
                province: data.province,
              },
              pricingRules: [
                {
                  name: "Standard",
                  // Use any to bypass strict type checking if PricingUnit enum isn't fully exported in frontend
                  unit: (data.pricingType === "per_person" ? "PER_PERSON" : "PER_GROUP") as any,
                  amount: Number(data.basePrice),
                }
              ],
              basePrice: Number(data.basePrice),
            };

            createExperience.mutate(dto, {
              onSuccess: () => {
                Alert.alert("Success", "Experience created successfully.");
                router.replace("/(guide)/experiences/mine?tab=DRAFTS");
              },
              onError: (err: any) => {
                const errorMessage = Array.isArray(err?.message) 
                  ? err.message.join('\n') 
                  : (err?.message || "Failed to create experience");
                Alert.alert("Error", errorMessage);
              }
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}