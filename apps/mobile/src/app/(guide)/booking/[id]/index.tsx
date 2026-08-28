import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  useBooking,
  useMarkNoShow,
  useCancelByGuide,
  useAcceptBooking,
  useRejectBooking,
} from "@/hooks/use-bookings";
import { Image } from "expo-image";

function StatusBadge({
  status,
  colors,
}: {
  status: string;
  colors: typeof Colors.light;
}) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    CONFIRMED: { bg: "#10B98120", text: "#10B981", label: "✓ Confirmed" },
    IN_PROGRESS: { bg: "#3B82F620", text: "#3B82F6", label: "● In Progress" },
    COMPLETED: { bg: "#8B5CF620", text: "#8B5CF6", label: "✓ Completed" },
    PENDING: { bg: "#F59E0B20", text: "#F59E0B", label: "⏳ Pending" },
    CANCELLED: { bg: "#EF444420", text: "#EF4444", label: "✗ Cancelled" },
    NO_SHOW: { bg: "#EF444420", text: "#EF4444", label: "✗ No Show" },
    REJECTED: { bg: "#EF444420", text: "#EF4444", label: "✗ Rejected" },
  };
  const cfg = configs[status] || {
    bg: "#6B728020",
    text: "#6B7280",
    label: status,
  };
  return (
    <View
      className="px-3 py-1 rounded-full"
      style={{ backgroundColor: cfg.bg }}
    >
      <ThemedText style={{ color: cfg.text, fontSize: 13, fontWeight: "600" }}>
        {cfg.label}
      </ThemedText>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  colors,
}: {
  icon: any;
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View
      className="flex-row items-start gap-3 py-3"
      style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mt-0.5"
        style={{ backgroundColor: `${colors.primary}15` }}
      >
        <IconSymbol name={icon} size={16} color={colors.primary} />
      </View>
      <View className="flex-1">
        <ThemedText type="muted" style={{ fontSize: 12, marginBottom: 2 }}>
          {label}
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
          {value}
        </ThemedText>
      </View>
    </View>
  );
}

export default function GuideBookingDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = Array.isArray(id) ? id[0] : id;

  const { data: booking, isLoading, refetch } = useBooking(bookingId || "");
  const markNoShow = useMarkNoShow(bookingId || "");
  const cancelByGuide = useCancelByGuide(bookingId || "");

  const acceptBooking = useAcceptBooking(bookingId);
  const rejectBooking = useRejectBooking(bookingId);

  const [canStart, setCanStart] = useState(false);
  const [minutesUntilStart, setMinutesUntilStart] = useState<number | null>(
    null,
  );

  // Calculate 30-minute window continuously
  useEffect(() => {
    if (!booking || booking.status !== "CONFIRMED") return;

    const check = () => {
      if (booking.startTime && booking.tripDate) {
        const [h, m] = booking.startTime.split(":").map(Number);
        const tripDay = new Date(booking.tripDate);
        tripDay.setHours(h, m, 0, 0);
        const now = new Date();
        const diffMs = tripDay.getTime() - now.getTime() - 30 * 60000;
        setMinutesUntilStart(Math.max(0, Math.ceil(diffMs / 60000)));
        setCanStart(now >= new Date(tripDay.getTime() - 30 * 60000));
      } else {
        // No startTime set — allow start anytime
        setCanStart(true);
        setMinutesUntilStart(null);
      }
    };

    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [booking]);

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

  if (!booking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <TouchableOpacity className="p-4" onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center p-6">
          <ThemedText type="title">Booking not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  const tripDateStr = booking.tripDate
    ? new Date(booking.tripDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const timeRange = booking.startTime
    ? `${booking.startTime}${booking.endTime ? ` – ${booking.endTime}` : ""}`
    : "Time not set";

  const handleStartTrip = () => {
    if (!canStart) return;
    router.push({
      pathname: "/(guide)/booking/[id]/start",
      params: { id: bookingId },
    });
  };

  const handleAccept = () => {
    Alert.alert(
      "Accept Booking",
      "Are you sure you want to accept this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () =>
            acceptBooking.mutate(
              {},
              {
                onError: (err: any) => {
                  const errorMessage = Array.isArray(err?.message)
                    ? err.message.join("\n")
                    : err?.message || "Failed to accept booking";
                  Alert.alert("Error", errorMessage);
                },
              },
            ),
        },
      ],
    );
  };

  const handleReject = () => {
    Alert.alert(
      "Decline Booking",
      "Are you sure you want to decline this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: () =>
            rejectBooking.mutate(
              {
                reasonCode: "GUIDE_DECLINED",
                reason: "Guide declined the booking.",
              },
              {
                onError: (err: any) => {
                  const errorMessage = Array.isArray(err?.message)
                    ? err.message.join("\n")
                    : err?.message || "Failed to reject booking";
                  Alert.alert("Error", errorMessage);
                },
              },
            ),
        },
      ],
    );
  };

  const handleNoShow = () => {
    Alert.alert(
      "Mark No Show",
      "Are you sure the tourist group did not show up for this trip?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark No Show",
          style: "destructive",
          onPress: async () => {
            try {
              await markNoShow.mutateAsync();
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to mark no show");
            }
          },
        },
      ],
    );
  };

  const handleCancelTrip = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelByGuide.mutateAsync({
                reasonCode: "GUIDE_CANCELLED",
                note: "Cancelled by guide",
              });
              router.back();
            } catch (err: any) {
              Alert.alert("Error", err?.message || "Failed to cancel booking");
            }
          },
        },
      ],
    );
  };

  const isActive = booking.status === "IN_PROGRESS";
  const isCompleted = [
    "COMPLETED",
    "CANCELLED",
    "REJECTED",
    "NO_SHOW",
  ].includes(booking.status);

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
          Booking Details
        </ThemedText>
        <View className="w-6" />
      </ThemedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 32 }}
      >
        {/* Experience Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <ThemedView
            style={{
              borderRadius: 20,
              overflow: "hidden",
              elevation: 2,
              backgroundColor: colors.card,
            }}
          >
            {booking.experience?.coverImage?.url ? (
              <Image
                source={{ uri: booking.experience.coverImage.url }}
                style={{ width: "100%", height: 140 }}
                contentFit="cover"
              />
            ) : null}
            <View className="p-4">
              <ThemedText
                type="title"
                style={{ fontSize: 20, marginBottom: 8 }}
              >
                {booking.experience?.title}
              </ThemedText>
              <StatusBadge status={booking.status} colors={colors} />
            </View>
          </ThemedView>
        </Animated.View>

        {/* Trip Info */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <ThemedView
            style={{
              borderRadius: 16,
              padding: 16,
              elevation: 2,
              backgroundColor: colors.card,
            }}
          >
            <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
              Trip Details
            </ThemedText>
            <InfoRow
              icon="calendar"
              label="Date"
              value={tripDateStr}
              colors={colors}
            />
            <InfoRow
              icon="clock"
              label="Time"
              value={timeRange}
              colors={colors}
            />
            <InfoRow
              icon="person.2.fill"
              label="Group Size"
              value={`${booking.groupSize} tourist${booking.groupSize > 1 ? "s" : ""}`}
              colors={colors}
            />
            {booking.experience?.location?.city && (
              <InfoRow
                icon="location.fill"
                label="Meeting Point"
                value={`${booking.experience.location.city}, ${booking.experience.location.country}`}
                colors={colors}
              />
            )}
          </ThemedView>
        </Animated.View>

        {/* Tourist Info */}
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
              Tourist
            </ThemedText>
            <View className="flex-row items-center gap-3">
              <Image
                source={{
                  uri:
                    booking.tourist?.avatarUrl ||
                    "https://placehold.co/100x100/png",
                }}
                style={{ width: 48, height: 48, borderRadius: 24 }}
                contentFit="cover"
              />
              <View className="flex-1">
                <ThemedText type="defaultSemiBold">
                  {booking.tourist?.fullName || "Unknown"}
                </ThemedText>
                {booking.groupSize > 1 && (
                  <ThemedText type="muted" style={{ fontSize: 12 }}>
                    + {booking.groupSize - 1} other participant
                    {booking.groupSize > 2 ? "s" : ""}
                  </ThemedText>
                )}
              </View>
            </View>
            {booking.touristNote && (
              <View
                className="mt-3 p-3 rounded-xl"
                style={{ backgroundColor: `${colors.primary}10` }}
              >
                <ThemedText
                  type="muted"
                  style={{ fontSize: 12, marginBottom: 4 }}
                >
                  Special Request
                </ThemedText>
                <ThemedText style={{ fontSize: 13, fontStyle: "italic" }}>
                  &quot;{booking.touristNote}&quot;
                </ThemedText>
              </View>
            )}
          </ThemedView>
        </Animated.View>

        {/* Pricing */}
        {booking.pricingSnapshot && booking.status !== "REJECTED" && (
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
                Earnings
              </ThemedText>
              <View className="flex-row justify-between py-2">
                <ThemedText type="muted">Base Amount</ThemedText>
                <ThemedText>
                  {booking.pricingSnapshot.currency}{" "}
                  {Number(booking.pricingSnapshot.baseAmount).toLocaleString()}
                </ThemedText>
              </View>
              <View className="flex-row justify-between py-2">
                <ThemedText type="muted">Platform Fee</ThemedText>
                <ThemedText type="muted">Platform Fee (Free during launch)</ThemedText>
                <ThemedText>
                  - {booking.pricingSnapshot.currency}{" "}
                  {Number(
                    booking.pricingSnapshot.platformFeeAmount,
                  ).toLocaleString()}
                </ThemedText>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginVertical: 8,
                }}
              />
              <View className="flex-row justify-between py-1">
                <ThemedText type="subtitle">Your Earnings</ThemedText>
                <ThemedText type="subtitle" style={{ color: colors.secondary }}>
                  {booking.pricingSnapshot.currency}{" "}
                  {(
                    Number(booking.pricingSnapshot.baseAmount) -
                    Number(booking.pricingSnapshot.platformFeeAmount)
                  ).toLocaleString()}
                </ThemedText>
              </View>
            </ThemedView>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      {!isCompleted && (
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
          {isActive ? (
            <TouchableOpacity
              style={{
                backgroundColor: "#3B82F6",
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: "center",
              }}
              onPress={() =>
                router.push({
                  pathname: "/(guide)/booking/[id]/active",
                  params: { id: bookingId },
                })
              }
            >
              <ThemedText
                style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
              >
                ● View Active Trip
              </ThemedText>
            </TouchableOpacity>
          ) : (
            <>
              {booking.status === "PENDING" ? (
                <View className="flex-row gap-2 mt-1">
                  <TouchableOpacity
                    className="flex-1 bg-green-500/20 border border-green-500/50 py-2.5 rounded-xl items-center"
                    onPress={handleAccept}
                  >
                    <Text className="text-green-600 font-bold text-sm">
                      Accept
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-500/20 border border-red-500/50 py-2.5 rounded-xl items-center"
                    onPress={handleReject}
                  >
                    <Text className="text-red-500 font-bold text-sm">
                      Decline
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <ThemedText
                    type="muted"
                    style={{
                      fontSize: 13,
                      textAlign: "center",
                      marginBottom: 8,
                    }}
                  >
                    You can start the trip 30 minutes before the scheduled start
                    time.
                  </ThemedText>
                  <TouchableOpacity
                    style={{
                      backgroundColor: canStart
                        ? colors.primary
                        : `${colors.primary}60`,
                      borderRadius: 14,
                      paddingVertical: 16,
                      alignItems: "center",
                    }}
                    onPress={handleStartTrip}
                    disabled={!canStart}
                  >
                    <ThemedText
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 16,
                      }}
                    >
                      {canStart
                        ? "🚀  Start Trip"
                        : `Start Trip (available in ${minutesUntilStart}m)`}
                    </ThemedText>
                  </TouchableOpacity>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      className="flex-1 items-center py-3 rounded-xl"
                      style={{
                        borderWidth: 1,
                        borderColor: "#F59E0B",
                        backgroundColor: "#F59E0B15",
                      }}
                      onPress={handleNoShow}
                    >
                      <ThemedText
                        style={{
                          color: "#F59E0B",
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        No Show
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 items-center py-3 rounded-xl"
                      style={{
                        borderWidth: 1,
                        borderColor: "#EF4444",
                        backgroundColor: "#EF444415",
                      }}
                      onPress={handleCancelTrip}
                    >
                      <ThemedText
                        style={{
                          color: "#EF4444",
                          fontWeight: "600",
                          fontSize: 13,
                        }}
                      >
                        Cancel
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}
        </ThemedView>
      )}
    </SafeAreaView>
  );
}
