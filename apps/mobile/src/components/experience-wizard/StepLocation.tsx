import { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { WizardStepProps } from "./types";
import { WizardFooter } from "./WizardFooter";
import { ThemedText } from "../themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { IconSymbol } from "../ui/icon-symbol";
import { MapWrapper, LocationRegion } from "../ui/MapWrapper";

const DEFAULT_REGION: LocationRegion = {
  latitude: 27.7172, // Kathmandu
  longitude: 85.324,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export function StepLocation({
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
  const mapRef = useRef<any>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [region, setRegion] = useState<LocationRegion>(
    formData.latitude && formData.longitude
      ? {
          latitude: formData.latitude,
          longitude: formData.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }
      : DEFAULT_REGION,
  );

  useEffect(() => {
    // On mount, if no coords, try to get current location
    if (!formData.latitude && !formData.longitude && !isEditMode) {
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          try {
            const loc = await Location.getCurrentPositionAsync({});
            const newRegion = {
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            };
            setRegion(newRegion);
            mapRef.current?.animateToRegion?.(newRegion);
          } catch {
            // ignore
          }
        }
      })();
    }
  }, [formData.latitude, formData.longitude, isEditMode]);

  const handleMapPress = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    if (isEditMode) return;
    updateData({ latitude: coords.latitude, longitude: coords.longitude });

    // Reverse geocode
    setIsGeocoding(true);
    try {
      const [address] = await Location.reverseGeocodeAsync(coords);
      if (address) {
        // Build a human-readable meeting point string from the address parts
        const meetingPoint = [
          address.name,
          address.street,
          address.city || address.subregion,
        ]
          .filter(Boolean)
          .join(", ");
        updateData({
          meetingPoint: meetingPoint || formData.meetingPoint,
          province: address.region || formData.province,
          district: address.subregion || formData.district,
          municipality: address.city || formData.municipality,
        });
      }
    } catch {
      console.log("Reverse geocode failed");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || isEditMode) return;
    setIsGeocoding(true);
    try {
      const results = await Location.geocodeAsync(searchQuery);
      if (results.length > 0) {
        const loc = results[0];
        const newRegion = {
          latitude: loc.latitude,
          longitude: loc.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion?.(newRegion);

        updateData({ latitude: loc.latitude, longitude: loc.longitude });

        const [address] = await Location.reverseGeocodeAsync(loc);
        if (address) {
          const meetingPoint = [
            address.name,
            address.street,
            address.city || address.subregion,
          ]
            .filter(Boolean)
            .join(", ");
          updateData({
            meetingPoint: meetingPoint || formData.meetingPoint,
            province: address.region || formData.province,
            district: address.subregion || formData.district,
            municipality: address.city || formData.municipality,
          });
        }
      } else {
        Alert.alert("Not Found", "Could not find that location.");
      }
    } catch {
      Alert.alert("Error", "Geocoding failed.");
    } finally {
      setIsGeocoding(false);
    }
  };

  const isNextDisabled =
    !formData.latitude ||
    !formData.longitude ||
    !formData.meetingPoint.trim() ||
    !formData.district.trim();

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        <View className="px-5 pt-6 pb-4">
          <ThemedText className="text-3xl font-extrabold mb-6 tracking-tight">
            Location
          </ThemedText>
          {isEditMode && (
            <View className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-2xl mb-6 border border-blue-100 dark:border-blue-900/50">
              <ThemedText className="text-blue-800 dark:text-blue-200 font-medium">
                Location updates are currently not supported in edit mode.
              </ThemedText>
            </View>
          )}

          {!isEditMode && (
            <View className="flex-row gap-3 mb-6">
              <TextInput
                className="flex-1 p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-base"
                style={{ color: colors.text }}
                placeholder="Search location..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity
                onPress={handleSearch}
                disabled={isGeocoding}
                className="p-4 rounded-2xl items-center justify-center bg-gray-100 dark:bg-neutral-800 border border-transparent dark:border-neutral-700"
              >
                {isGeocoding ? (
                  <ActivityIndicator size="small" color={colors.tint} />
                ) : (
                  <IconSymbol
                    name="magnifyingglass"
                    size={24}
                    color={colors.text}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}

          <View className="h-64 rounded-3xl overflow-hidden mb-8 border border-gray-200 dark:border-neutral-800">
            <MapWrapper
              ref={mapRef}
              region={region}
              latitude={formData.latitude}
              longitude={formData.longitude}
              markerTitle={formData.meetingPoint || "Meeting Point"}
              onPress={handleMapPress}
            />
          </View>

          <View className="space-y-6">
            <View>
              <ThemedText className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                MEETING POINT
              </ThemedText>
              <TextInput
                className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-base"
                style={{ color: colors.text }}
                placeholder="e.g. Thamel Square, Kathmandu"
                placeholderTextColor="#9CA3AF"
                value={formData.meetingPoint}
                onChangeText={(val) => updateData({ meetingPoint: val })}
                editable={!isEditMode}
              />
            </View>

            <View className="flex-row gap-4 mt-6">
              <View className="flex-1">
                <ThemedText className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  DISTRICT
                </ThemedText>
                <TextInput
                  className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-base"
                  style={{ color: colors.text }}
                  placeholder="e.g. Kathmandu"
                  placeholderTextColor="#9CA3AF"
                  value={formData.district}
                  onChangeText={(val) => updateData({ district: val })}
                  editable={!isEditMode}
                />
              </View>
              <View className="flex-1">
                <ThemedText className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  PROVINCE
                </ThemedText>
                <TextInput
                  className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-base"
                  style={{ color: colors.text }}
                  placeholder="e.g. Bagmati"
                  placeholderTextColor="#9CA3AF"
                  value={formData.province}
                  onChangeText={(val) => updateData({ province: val })}
                  editable={!isEditMode}
                />
              </View>
            </View>

            <View className="mt-6 mb-4">
              <ThemedText className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                MUNICIPALITY (OPTIONAL)
              </ThemedText>
              <TextInput
                className="p-4 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-900 text-base"
                style={{ color: colors.text }}
                placeholder="e.g. Kathmandu Metropolitan"
                placeholderTextColor="#9CA3AF"
                value={formData.municipality}
                onChangeText={(val) => updateData({ municipality: val })}
                editable={!isEditMode}
              />
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
        nextDisabled={isNextDisabled && !isEditMode}
      />
    </View>
  );
}
