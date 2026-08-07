import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useBooking, useStartTrip } from "@/hooks/use-bookings";

export default function StartTripScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Array.isArray(id) ? id[0] : id;

  const { data: booking, isLoading } = useBooking(bookingId || "");
  const startTrip = useStartTrip(bookingId || "");

  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "acquired" | "denied"
  >("idle");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number | null;
  } | null>(null);

  const requestLocation = async () => {
    setLocationStatus("requesting");
    try {
      // Dynamically import to avoid crashing if permissions aren't set up
      const ExpoLocation = await import("expo-location");
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationStatus("denied");
        return;
      }
      const loc = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy,
      });
      setLocationStatus("acquired");
    } catch {
      setLocationStatus("denied");
    }
  };

  // Attempt to get location on mount safely
  useEffect(() => {
    const timer = setTimeout(() => {
      requestLocation();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const handleConfirmStart = async () => {
    try {
      await startTrip.mutateAsync(
        location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy ?? undefined,
            }
          : undefined,
      );
      // Replace so back doesn't bring them here
      router.replace({
        pathname: "/(guide)/booking/[id]/active",
        params: { id: bookingId },
      });
    } catch (err: any) {
      Alert.alert(
        "Cannot Start Trip",
        err?.message || "Something went wrong. Please try again.",
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const locationLabel =
    locationStatus === "requesting"
      ? "Getting location..."
      : locationStatus === "acquired" && location
        ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
        : locationStatus === "denied"
          ? "Location unavailable"
          : "Requesting location...";

  const locationIcon =
    locationStatus === "acquired"
      ? "location.fill"
      : locationStatus === "denied"
        ? "location.slash"
        : "map.fill";
  const locationColor =
    locationStatus === "acquired"
      ? colors.secondary
      : locationStatus === "denied"
        ? colors.textMuted
        : colors.primary;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <ThemedView
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={{ fontSize: 17 }}>
          Ready to Start?
        </ThemedText>
        <View className="w-6" />
      </ThemedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, gap: 20, paddingBottom: 32 }}
      >
        {/* Experience title */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          className="items-center"
        >
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: `${colors.primary}20` }}
          >
            <IconSymbol name="figure.walk" size={32} color={colors.primary} />
          </View>
          <ThemedText
            type="title"
            style={{ fontSize: 22, textAlign: "center", marginBottom: 4 }}
          >
            {booking?.experience?.title || "Experience"}
          </ThemedText>
          <ThemedText type="muted" style={{ textAlign: "center" }}>
            Confirm your location and start the trip
          </ThemedText>
        </Animated.View>

        {/* Trip info summary */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <ThemedView
            style={{
              borderRadius: 16,
              overflow: "hidden",
              elevation: 2,
              backgroundColor: colors.card,
            }}
          >
            <View
              className="flex-row items-center p-4 gap-3"
              style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <IconSymbol
                  name="person.2.fill"
                  size={16}
                  color={colors.primary}
                />
              </View>
              <View>
                <ThemedText type="muted" style={{ fontSize: 11 }}>
                  Tourists
                </ThemedText>
                <ThemedText type="defaultSemiBold">
                  {booking?.tourist?.fullName || "—"}
                  {booking && booking.groupSize > 1
                    ? ` + ${booking.groupSize - 1}`
                    : ""}
                </ThemedText>
              </View>
            </View>

            <View
              className="flex-row items-center p-4 gap-3"
              style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
            >
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <IconSymbol name="clock" size={16} color={colors.primary} />
              </View>
              <View>
                <ThemedText type="muted" style={{ fontSize: 11 }}>
                  Scheduled Time
                </ThemedText>
                <ThemedText type="defaultSemiBold">
                  {booking?.startTime || "—"}
                  {booking?.endTime ? ` – ${booking.endTime}` : ""}
                </ThemedText>
              </View>
            </View>

            {booking?.experience?.location && (
              <View
                className="flex-row items-center p-4 gap-3"
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <IconSymbol
                    name="flag.fill"
                    size={16}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <ThemedText type="muted" style={{ fontSize: 11 }}>
                    Meeting Point
                  </ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {booking.experience.location.city},{" "}
                    {booking.experience.location.country}
                  </ThemedText>
                </View>
              </View>
            )}

            {/* Your GPS Location */}
            <TouchableOpacity
              className="flex-row items-center p-4 gap-3"
              onPress={
                locationStatus === "denied" ? requestLocation : undefined
              }
              activeOpacity={0.7}
            >
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${locationColor}15` }}
              >
                <IconSymbol
                  name={locationIcon as any}
                  size={16}
                  color={locationColor}
                />
              </View>
              <View className="flex-1">
                <ThemedText type="muted" style={{ fontSize: 11 }}>
                  Your Location
                </ThemedText>
                {locationStatus === "requesting" ? (
                  <View className="flex-row items-center gap-2 mt-1">
                    <ActivityIndicator size="small" color={colors.primary} />
                    <ThemedText style={{ fontSize: 13 }}>
                      Acquiring GPS...
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText
                    type="defaultSemiBold"
                    style={{ color: locationColor }}
                  >
                    {locationLabel}
                  </ThemedText>
                )}
              </View>
              {locationStatus === "denied" && (
                <ThemedText style={{ color: colors.primary, fontSize: 12 }}>
                  Retry
                </ThemedText>
              )}
            </TouchableOpacity>
          </ThemedView>
        </Animated.View>

        {/* Info note */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <View
            className="flex-row p-4 rounded-xl gap-3"
            style={{
              backgroundColor: `${colors.primary}10`,
              borderWidth: 1,
              borderColor: `${colors.primary}20`,
            }}
          >
            <IconSymbol
              name="info.circle.fill"
              size={18}
              color={colors.primary}
            />
            <ThemedText
              style={{
                color: colors.primary,
                fontSize: 13,
                flex: 1,
                lineHeight: 20,
              }}
            >
              Once you start, the booking status changes to{" "}
              <ThemedText style={{ fontWeight: "700", color: colors.primary }}>
                In Progress
              </ThemedText>
              {". "}Your starting location will be recorded. Make sure your
              tourists are with you before tapping Start.
            </ThemedText>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <ThemedView
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: startTrip.isPending
              ? `${colors.primary}60`
              : colors.primary,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
          onPress={handleConfirmStart}
          disabled={startTrip.isPending}
        >
          {startTrip.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol name="play.fill" size={18} color="#fff" />
              <ThemedText
                style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}
              >
                Start Trip
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
        <ThemedText
          type="muted"
          style={{ textAlign: "center", fontSize: 12, marginTop: 10 }}
        >
          This action will notify your tourists that the trip has started.
        </ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}
