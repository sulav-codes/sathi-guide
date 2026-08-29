import { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, TextInput, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useExperiences, useNearbyExperiences } from "@/hooks/use-experiences";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ExperienceCardSkeleton } from "@/components/ExperienceCardSkeleton";
import { ThemedView } from "@/components/themed-view";

export default function ExploreScreen() {
  const { initialLocation } = useLocalSearchParams<{ initialLocation?: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [locationSearch, setLocationSearch] = useState(initialLocation || "");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // If user types a manual location, clear coords so we use text search
  const handleTextSearchChange = (text: string) => {
    setLocationSearch(text);
    if (text.length > 0) {
      setCoords(null);
    }
  };

  const requestLocation = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
      setLocationSearch(""); // Clear manual search when using GPS
    } catch (error) {
      console.log("Error getting location", error);
    } finally {
      setIsLocating(false);
    }
  };

  // Queries
  const { 
    data: nearbyExperiences, 
    isLoading: isLoadingNearby, 
    error: nearbyError 
  } = useNearbyExperiences(coords?.lat ?? null, coords?.lng ?? null);

  const { 
    data: textExperiences, 
    isLoading: isLoadingText, 
    error: textError 
  } = useExperiences(
    (!coords && locationSearch) ? { location: locationSearch } : undefined
  );

  const isNearbyMode = !!coords;
  const isLoading = isNearbyMode ? isLoadingNearby : (locationSearch ? isLoadingText : false);
  const error = isNearbyMode ? nearbyError : textError;
  const experiences = isNearbyMode ? nearbyExperiences : textExperiences;

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
      <View className="px-5 py-4 gap-3">
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
          <IconSymbol name="magnifyingglass" size={20} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            placeholder="Search by city, district..."
            placeholderTextColor={colors.textMuted}
            value={locationSearch}
            onChangeText={handleTextSearchChange}
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

        <TouchableOpacity 
          onPress={requestLocation}
          className="flex-row items-center justify-center p-3 rounded-xl border border-primary/30"
          style={{ backgroundColor: `${colors.primary}10` }}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 8 }} />
          ) : (
            <IconSymbol name="location.fill" size={18} color={colors.primary} style={{ marginRight: 8 }} />
          )}
          <Text className="font-semibold" style={{ color: colors.primary }}>
            {coords ? "Using current location" : "Find nearby"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {(!coords && !locationSearch) ? (
          <View className="items-center py-20 px-8">
            <IconSymbol name="map" size={48} color={colors.textMuted} />
            <Text className="text-lg font-bold mt-4 text-center" style={{ color: colors.text }}>
              Where to?
            </Text>
            <Text className="text-sm mt-2 text-center" style={{ color: colors.textMuted }}>
              Use your current location or search for a city to discover experiences.
            </Text>
          </View>
        ) : isLoading ? (
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
              Try adjusting your search or location radius.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {isNearbyMode && (
              <Text className="font-semibold mb-2" style={{ color: colors.textMuted }}>
                Experiences near you
              </Text>
            )}
            {experiences.items.map((exp: any) => (
              <ExperienceCard
                key={exp.id}
                item={exp}
                onPress={() => router.push(`/(tourist)/experience/${exp.id}`)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
