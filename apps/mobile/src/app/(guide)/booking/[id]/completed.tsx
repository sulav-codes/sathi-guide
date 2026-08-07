import { router, useLocalSearchParams } from "expo-router";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useBooking } from "@/hooks/use-bookings";

function StatCard({
  label,
  value,
  icon,
  color,
  colors,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View
      className="flex-1 rounded-2xl p-4"
      style={{
        backgroundColor: `${color}12`,
        borderWidth: 1,
        borderColor: `${color}25`,
      }}
    >
      <View
        className="w-9 h-9 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <IconSymbol name={icon} size={18} color={color} />
      </View>
      <ThemedText style={{ fontSize: 22, fontWeight: "800", color }}>
        {value}
      </ThemedText>
      <ThemedText
        style={{ fontSize: 12, marginTop: 2, color: colors.textMuted }}
      >
        {label}
      </ThemedText>
    </View>
  );
}

export default function TripCompletedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Array.isArray(id) ? id[0] : id;

  const { data: booking } = useBooking(bookingId || "");

  // Compute duration from state log
  let durationStr = "—";
  if (booking?.stateLog) {
    const startLog = booking.stateLog.find(
      (entry) => entry.toStatus === "IN_PROGRESS",
    );
    const endLog = booking.stateLog.find(
      (entry) => entry.toStatus === "COMPLETED",
    );
    if (startLog && endLog) {
      const startMs = new Date(startLog.createdAt).getTime();
      const endMs = new Date(endLog.createdAt).getTime();
      const totalMins = Math.floor((endMs - startMs) / 60000);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    }
  }

  // Earnings from snapshot
  const earnings = booking?.pricingSnapshot
    ? Number(booking.pricingSnapshot.baseAmount) -
      Number(booking.pricingSnapshot.platformFeeAmount)
    : null;
  const currency = booking?.pricingSnapshot?.currency || "NPR";

  const endLog = booking?.stateLog?.find(
    (entry) => entry.toStatus === "COMPLETED",
  );
  const endLocation = endLog?.metadata;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      >
        {/* Success Badge */}
        <Animated.View
          entering={ZoomIn.delay(100)}
          className="items-center mb-8 mt-4"
        >
          <View
            className="w-24 h-24 rounded-full items-center justify-center mb-4"
            style={{
              backgroundColor: "#10B98120",
              borderWidth: 3,
              borderColor: "#10B981",
            }}
          >
            <IconSymbol name="checkmark" size={48} color="#10B981" />
          </View>
          <ThemedText
            type="title"
            style={{ fontSize: 26, textAlign: "center" }}
          >
            Trip Completed!
          </ThemedText>
          <ThemedText
            type="muted"
            style={{ textAlign: "center", marginTop: 6, fontSize: 15 }}
          >
            {booking?.experience?.title || "Experience"}
          </ThemedText>
        </Animated.View>

        {/* Stats */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          className="flex-row gap-3 mb-4"
        >
          <StatCard
            label="Duration"
            value={durationStr}
            icon="clock.fill"
            color="#3B82F6"
            colors={colors}
          />
          <StatCard
            label="Tourists"
            value={String(booking?.groupSize || 0)}
            icon="person.2.fill"
            color="#8B5CF6"
            colors={colors}
          />
        </Animated.View>

        {earnings !== null && (
          <Animated.View entering={FadeInDown.delay(250)}>
            <ThemedView
              style={{
                borderRadius: 20,
                padding: 20,
                elevation: 2,
                backgroundColor: colors.card,
                marginBottom: 16,
              }}
            >
              <ThemedText
                type="muted"
                style={{ fontSize: 13, marginBottom: 4 }}
              >
                Your Earnings
              </ThemedText>
              <ThemedText
                style={{ fontSize: 36, fontWeight: "900", color: "#10B981" }}
              >
                {currency} {earnings.toLocaleString()}
              </ThemedText>
              <ThemedText type="muted" style={{ fontSize: 12, marginTop: 4 }}>
                After platform fee deduction
              </ThemedText>
            </ThemedView>
          </Animated.View>
        )}

        {/* End location */}
        {endLocation?.latitude && (
          <Animated.View entering={FadeInDown.delay(300)}>
            <ThemedView
              style={{
                borderRadius: 16,
                padding: 16,
                elevation: 2,
                backgroundColor: colors.card,
                marginBottom: 16,
              }}
            >
              <ThemedText type="subtitle" style={{ marginBottom: 10 }}>
                End Location Recorded
              </ThemedText>
              <View className="flex-row items-center gap-3">
                <View
                  className="w-9 h-9 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#10B98115" }}
                >
                  <IconSymbol name="location.fill" size={16} color="#10B981" />
                </View>
                <ThemedText type="defaultSemiBold">
                  📍 {endLocation.latitude.toFixed(4)},{" "}
                  {endLocation.longitude?.toFixed(4)}
                </ThemedText>
              </View>
            </ThemedView>
          </Animated.View>
        )}

        {/* Review Prompt */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <View
            className="p-4 rounded-xl"
            style={{
              backgroundColor: `${colors.secondary}12`,
              borderWidth: 1,
              borderColor: `${colors.secondary}25`,
            }}
          >
            <ThemedText
              style={{
                color: colors.secondary,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              ⭐ Reviews
            </ThemedText>
            <ThemedText type="muted" style={{ fontSize: 13 }}>
              Your tourist will be able to leave a review for this trip. Check
              your profile to see reviews.
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
          gap: 10,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 14,
            paddingVertical: 16,
            alignItems: "center",
          }}
          onPress={() => router.replace("/(guide)/(tabs)/bookings")}
        >
          <ThemedText
            style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
          >
            View Bookings
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignItems: "center", paddingVertical: 10 }}
          onPress={() => router.replace("/(guide)/(tabs)/home")}
        >
          <ThemedText style={{ color: colors.textMuted, fontSize: 14 }}>
            Go to Dashboard
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}
