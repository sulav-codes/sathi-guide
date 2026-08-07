import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useBooking, useCompleteTrip } from "@/hooks/use-bookings";

function ElapsedTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const update = () => {
      const start = new Date(startedAt).getTime();
      const now = Date.now();
      const diffMs = now - start;
      const totalMinutes = Math.floor(diffMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      setElapsed(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [startedAt]);

  return (
    <ThemedText style={{ fontSize: 28, fontWeight: "800", color: "#3B82F6" }}>
      {elapsed}
    </ThemedText>
  );
}

export default function ActiveTripScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Array.isArray(id) ? id[0] : id;

  const { data: booking, isLoading } = useBooking(bookingId || "");
  const completeTrip = useCompleteTrip(bookingId || "");

  // Pulse animation for the "in progress" indicator
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.6, 1]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.95, 1.05]) }],
  }));

  // Prevent accidental back navigation
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      Alert.alert(
        "Active Trip",
        "Your trip is still in progress. Use the End Trip button to finish.",
        [{ text: "OK" }],
      );
      return true;
    });
    return () => sub.remove();
  }, []);

  // Try to get end location quietly
  const fetchEndLocation = async () => {
    try {
      const ExpoLocation = await import("expo-location");
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
        });
        return loc;
      }
    } catch {}
    return null;
  };

  const handleEndTrip = () => {
    Alert.alert(
      "End Trip?",
      `Are you sure you want to complete this experience?\n\nTourists: ${booking?.groupSize || 0}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Trip",
          style: "destructive",
          onPress: async () => {
            const loc = await fetchEndLocation();
            try {
              await completeTrip.mutateAsync(
                loc
                  ? {
                      latitude: loc.coords.latitude,
                      longitude: loc.coords.longitude,
                      accuracy: loc.coords.accuracy ?? undefined,
                    }
                  : undefined,
              );
              router.replace({
                pathname: "/(guide)/booking/[id]/completed",
                params: { id: bookingId },
              });
            } catch (err: any) {
              Alert.alert(
                "Error",
                err?.message || "Failed to end trip. Please try again.",
              );
            }
          },
        },
      ],
    );
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

  if (!booking || booking.status !== "IN_PROGRESS") {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <TouchableOpacity className="p-4" onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center p-6">
          <ThemedText type="title" style={{ textAlign: "center" }}>
            Trip not active
          </ThemedText>
          <ThemedText
            type="muted"
            style={{ textAlign: "center", marginTop: 8 }}
          >
            This trip may have already been completed or cancelled.
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Find start log entry
  const startLog = booking.stateLog?.find(
    (entry) => entry.toStatus === "IN_PROGRESS",
  );
  const startedAt = startLog?.createdAt || new Date().toISOString();
  const startLocation = startLog?.metadata;

  const startTimeStr = new Date(startedAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Active Trip",
              "Your trip is still active. Use End Trip to finish.",
              [{ text: "OK" }],
            )
          }
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={{ fontSize: 17, marginLeft: 12 }}>
          Active Trip
        </ThemedText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
      >
        {/* Status Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <ThemedView
            style={{
              borderRadius: 20,
              padding: 20,
              elevation: 3,
              backgroundColor: colors.card,
              overflow: "hidden",
            }}
          >
            {/* Pulsing status indicator */}
            <Animated.View
              style={[
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                },
                pulseStyle,
              ]}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#3B82F6",
                }}
              />
              <ThemedText
                style={{
                  color: "#3B82F6",
                  fontWeight: "700",
                  fontSize: 13,
                  letterSpacing: 0.5,
                }}
              >
                TRIP IN PROGRESS
              </ThemedText>
            </Animated.View>

            <ThemedText type="title" style={{ fontSize: 20, marginBottom: 16 }}>
              {booking.experience?.title}
            </ThemedText>

            <View className="flex-row gap-8">
              <View>
                <ThemedText
                  type="muted"
                  style={{ fontSize: 11, marginBottom: 4 }}
                >
                  Started
                </ThemedText>
                <ThemedText style={{ fontSize: 18, fontWeight: "700" }}>
                  {startTimeStr}
                </ThemedText>
              </View>
              <View>
                <ThemedText
                  type="muted"
                  style={{ fontSize: 11, marginBottom: 4 }}
                >
                  Elapsed
                </ThemedText>
                <ElapsedTimer startedAt={startedAt} />
              </View>
            </View>
          </ThemedView>
        </Animated.View>

        {/* Tourists */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <ThemedView
            style={{
              borderRadius: 16,
              padding: 16,
              elevation: 2,
              backgroundColor: colors.card,
            }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
              Tourists
            </ThemedText>
            <View className="flex-row items-center gap-3">
              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${colors.primary}15` }}
              >
                <IconSymbol
                  name="person.fill"
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View>
                <ThemedText type="defaultSemiBold">
                  {booking.tourist?.fullName || "Tourist"}
                </ThemedText>
                {booking.groupSize > 1 && (
                  <ThemedText type="muted" style={{ fontSize: 12 }}>
                    + {booking.groupSize - 1} other
                    {booking.groupSize > 2 ? "s" : ""}
                  </ThemedText>
                )}
              </View>
            </View>
          </ThemedView>
        </Animated.View>

        {/* Meeting Point */}
        {booking.experience?.location && (
          <Animated.View entering={FadeInDown.delay(200)}>
            <ThemedView
              style={{
                borderRadius: 16,
                padding: 16,
                elevation: 2,
                backgroundColor: colors.card,
              }}
            >
              <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
                Meeting Point
              </ThemedText>
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#EF444415" }}
                >
                  <IconSymbol name="location.fill" size={18} color="#EF4444" />
                </View>
                <ThemedText type="defaultSemiBold">
                  {booking.experience.location.city},{" "}
                  {booking.experience.location.country}
                </ThemedText>
              </View>
            </ThemedView>
          </Animated.View>
        )}

        {/* Start Location */}
        {startLocation?.latitude && (
          <Animated.View entering={FadeInDown.delay(250)}>
            <ThemedView
              style={{
                borderRadius: 16,
                padding: 16,
                elevation: 2,
                backgroundColor: colors.card,
              }}
            >
              <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
                Start Location
              </ThemedText>
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#10B98115" }}
                >
                  <IconSymbol name="location.fill" size={18} color="#10B981" />
                </View>
                <View>
                  <ThemedText type="defaultSemiBold">
                    📍 {startLocation.latitude?.toFixed(4)},{" "}
                    {startLocation.longitude?.toFixed(4)}
                  </ThemedText>
                  <ThemedText
                    type="muted"
                    style={{ fontSize: 11, marginTop: 2 }}
                  >
                    Captured at trip start
                  </ThemedText>
                </View>
              </View>
            </ThemedView>
          </Animated.View>
        )}

        {/* Time bar visual */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <ThemedView
            style={{
              borderRadius: 16,
              padding: 16,
              elevation: 2,
              backgroundColor: colors.card,
            }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
              Trip Progress
            </ThemedText>
            <View className="flex-row items-center gap-3">
              <ThemedText
                style={{ fontSize: 12, color: "#3B82F6", fontWeight: "600" }}
              >
                {startTimeStr}
              </ThemedText>
              <View
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: `${colors.border}` }}
              >
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: "40%",
                    backgroundColor: "#3B82F6",
                    borderRadius: 8,
                  }}
                />
              </View>
              <ThemedText style={{ fontSize: 12, color: colors.textMuted }}>
                {booking.endTime || "—"}
              </ThemedText>
            </View>
          </ThemedView>
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
            backgroundColor: completeTrip.isPending ? "#EF444460" : "#EF4444",
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
          onPress={handleEndTrip}
          disabled={completeTrip.isPending}
        >
          {completeTrip.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol name="stop.fill" size={18} color="#fff" />
              <ThemedText
                style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}
              >
                End Trip
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}
