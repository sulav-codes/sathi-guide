import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ExperienceForm } from "@/components/ExperienceForm";
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
        <ExperienceForm
          isLoading={createExperience.isPending}
          submitLabel="Create Experience"
          onSubmit={(data) => {
            createExperience.mutate(data, {
              onSuccess: () => {
                Alert.alert("Success", "Experience created successfully.");
                router.back();
              },
              onError: (err: any) => {
                Alert.alert("Error", err?.message || "Failed to create experience");
              }
            });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}