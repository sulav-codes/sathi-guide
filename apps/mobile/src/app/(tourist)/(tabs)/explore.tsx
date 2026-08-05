import { useState } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useExperiences } from "@/hooks/use-experiences";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ExperienceCardSkeleton } from "@/components/ExperienceCardSkeleton";
import { ThemedView } from "@/components/themed-view";

export default function ExploreScreen() {
  const { initialLocation } = useLocalSearchParams<{ initialLocation?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [locationSearch, setLocationSearch] = useState(initialLocation || "");

  const { data: experiences, isLoading, error } = useExperiences({
    ...(locationSearch ? { location: locationSearch } : {}),
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-3 flex-row items-center gap-3 border-b" style={{ borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Explore Experiences
        </Text>
      </View>

      {/* Filters */}
      <View className="px-5 py-4">
        <ThemedView
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderRadius: 12,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.card,
          }}
        >
          <IconSymbol name="mappin.and.ellipse" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by city, district..."
            placeholderTextColor={colors.textMuted}
            value={locationSearch}
            onChangeText={setLocationSearch}
            style={{
              flex: 1,
              fontSize: 14,
              color: colors.text,
              paddingVertical: 12,
            }}
          />
          {locationSearch.length > 0 && (
            <TouchableOpacity onPress={() => setLocationSearch("")}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </ThemedView>
      </View>

      {/* Results */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {isLoading ? (
          <View>
            {[1, 2, 3, 4, 5].map((key) => (
              <ExperienceCardSkeleton key={key} colors={colors} />
            ))}
          </View>
        ) : error ? (
          <Text style={{ color: colors.secondary, textAlign: "center", padding: 20 }}>
            Failed to load experiences.
          </Text>
        ) : !experiences?.items?.length ? (
          <View className="items-center py-20 px-8">
            <IconSymbol name="magnifyingglass" size={48} color={colors.textMuted} />
            <Text className="text-lg font-bold mt-4 text-center" style={{ color: colors.text }}>
              No experiences found
            </Text>
            <Text className="text-sm mt-2 text-center" style={{ color: colors.textMuted }}>
              Try adjusting your location filter to see more options.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {experiences.items.map((exp: any) => (
              <ExperienceCard
                key={exp.id}
                item={exp}
                colors={colors}
                onPress={() => router.push(`/(tourist)/experience/${exp.id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
