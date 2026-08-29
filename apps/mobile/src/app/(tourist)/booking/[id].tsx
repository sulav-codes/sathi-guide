import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBooking, useCancelBooking } from "@/hooks/use-bookings";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SectionHeader } from "@/components/SectionHeader";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return "#10B981";
    case "PENDING":
      return "#F59E0B";
    case "COMPLETED":
      return "#8B5CF6";
    case "IN_PROGRESS":
      return "#3B82F6";
    case "CANCELLED":
    case "REJECTED":
    case "NO_SHOW":
      return "#EF4444";
    default:
      return "#6B7280";
  }
};

const getStatusLabel = (status: string) => status.replace(/_/g, " ");

export default function BookingDetailScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const bookingId = Array.isArray(id) ? id[0] : id;

  const { data: booking, isLoading, error } = useBooking(bookingId || "");
  const cancelBooking = useCancelBooking(bookingId || "");

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

  if (error || !booking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <ThemedText className="text-lg font-bold mb-2">
            Booking not found
          </ThemedText>
          <ThemedText
            className="text-sm text-center mb-4"
            style={{ color: colors.textSecondary }}
          >
            We could not find this booking or there was an error loading it.
          </ThemedText>
          <TouchableOpacity
            className="px-6 py-3 rounded-full"
            style={{ backgroundColor: colors.primary }}
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            cancelBooking.mutate(
              { reason: "Tourist requested cancellation" },
              {
                onSuccess: () => {
                  Alert.alert("Success", "Booking has been cancelled");
                },
                onError: (err: any) => {
                  const errorMessage = Array.isArray(err?.message)
                    ? err.message.join("\n")
                    : err?.message || "Failed to cancel booking";
                  Alert.alert("Error", errorMessage);
                },
              },
            );
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        className="flex-row items-center justify-between px-4 py-3.5 border-b"
        style={{ borderBottomColor: colors.border, elevation: 2 }}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText className="text-[17px] font-bold">
          Booking Details
        </ThemedText>
        <View className="w-6" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
      >
        {/* IN_PROGRESS Live Trip Banner */}
        {booking.status === "IN_PROGRESS" && (
          <View
            className="rounded-2xl overflow-hidden mb-2"
            style={{ backgroundColor: "#3B82F6", elevation: 3 }}
          >
            <View
              style={{
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#fff",
                }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}
                >
                  YOUR TRIP IS NOW ACTIVE
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.85)",
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  Your guide has started the experience. Enjoy your trip! 🎉
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Status Card */}
        <ThemedView
          className="rounded-2xl p-4 items-center"
          style={{ elevation: 2 }}
        >
          <View
            className="px-4 py-1.5 rounded-full mb-2"
            style={{ backgroundColor: `${getStatusColor(booking.status)}20` }}
          >
            <Text
              className="text-[12px] font-bold uppercase"
              style={{ color: getStatusColor(booking.status) }}
            >
              {getStatusLabel(booking.status)}
            </Text>
          </View>
          <Text
            className="text-sm text-center"
            style={{ color: colors.textSecondary }}
          >
            Booking ID:{" "}
            <Text className="font-mono" style={{ color: colors.text }}>
              {booking.id.split("-")[0].toUpperCase()}
            </Text>
          </Text>
        </ThemedView>

        {/* Experience Info */}
        <View>
          <SectionHeader title="Experience" colors={colors} />
          <ThemedView className="rounded-2xl" style={{ elevation: 2 }}>
            <TouchableOpacity
              className="flex-row p-3 items-center"
              onPress={() =>
                router.navigate({
                  pathname: "/experience/[id]",
                  params: { id: booking.experience.id },
                })
              }
            >
              <Image
                source={{
                  uri:
                    booking.experience.coverImage?.url ||
                    "https://placehold.co/100x100/png",
                }}
                className="w-20 h-20 rounded-xl"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <ThemedText className="text-[15px] font-bold mb-1">
                  {booking.experience.title}
                </ThemedText>
                <View className="flex-row items-center gap-1 mt-1">
                  <IconSymbol
                    name="calendar"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-[13px]"
                    style={{ color: colors.textSecondary }}
                  >
                    {new Date(booking.tripDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View className="flex-row items-center gap-1 mt-1">
                  <IconSymbol
                    name="person.3.fill"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text
                    className="text-[13px]"
                    style={{ color: colors.textSecondary }}
                  >
                    {booking.groupSize}{" "}
                    {booking.groupSize === 1 ? "Person" : "People"}
                  </Text>
                </View>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </ThemedView>
        </View>

        {/* Guide Info */}
        <View>
          <SectionHeader title="Your Guide" colors={colors} />
          <ThemedView className="rounded-2xl" style={{ elevation: 2 }}>
            <TouchableOpacity
              className="flex-row p-3.5 items-center gap-3"
              onPress={() =>
                router.navigate({
                  pathname: "/experience/guide/[id]",
                  params: { id: booking.guide.id },
                })
              }
            >
              <Image
                source={{
                  uri:
                    booking.guide.avatarUrl ||
                    "https://placehold.co/100x100/png",
                }}
                className="w-12 h-12 rounded-full"
              />
              <View className="flex-1">
                <ThemedText className="text-[15px] font-bold">
                  {booking.guide.displayName || booking.guide.fullName}
                </ThemedText>
                <View className="flex-row items-center gap-1 mt-0.5">
                  <IconSymbol
                    name="star.fill"
                    size={12}
                    color={colors.orange}
                  />
                  <Text
                    className="text-[12px] font-bold"
                    style={{ color: colors.textSecondary }}
                  >
                    {booking.guide.averageRating}
                  </Text>
                </View>
              </View>
              <View
                className="p-2 rounded-full"
                style={{ backgroundColor: `${colors.primary}1A` }}
              >
                <IconSymbol
                  name="message.fill"
                  size={20}
                  color={colors.primary}
                />
              </View>
            </TouchableOpacity>
          </ThemedView>
        </View>

        {/* Pricing Info */}
        {booking.pricingSnapshot && (
          <View>
            <SectionHeader title="Payment Details" colors={colors} />
            <ThemedView
              className="rounded-2xl px-4 py-3"
              style={{ elevation: 2 }}
            >
              <View className="flex-row justify-between items-center py-2">
                <Text
                  className="text-[14px]"
                  style={{ color: colors.textSecondary }}
                >
                  Base Amount
                </Text>
                <Text className="text-[14px]" style={{ color: colors.text }}>
                  {booking.currency}{" "}
                  {parseFloat(
                    booking.pricingSnapshot.baseAmount,
                  ).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text
                  className="text-[14px]"
                  style={{ color: colors.textSecondary }}
                >
                  🎉 Platform Fee (Free)
                </Text>
                <Text className="text-[14px]" style={{ color: colors.text }}>
                  {booking.currency}{" "}
                  {parseFloat(
                    booking.pricingSnapshot.platformFeeAmount,
                  ).toLocaleString()}
                </Text>
              </View>
              <View
                className="h-px my-1"
                style={{ backgroundColor: colors.border }}
              />
              <View className="flex-row justify-between items-center py-2">
                <ThemedText className="text-[16px] font-extrabold">
                  Total Paid
                </ThemedText>
                <ThemedText className="text-[16px] font-extrabold">
                  {booking.currency}{" "}
                  {parseFloat(
                    booking.pricingSnapshot.totalAmount,
                  ).toLocaleString()}
                </ThemedText>
              </View>
            </ThemedView>
          </View>
        )}

        {/* Cancel Button */}
        {booking.canCancel && (
          <View className="mt-4">
            <TouchableOpacity
              className={`border border-red-500 py-3.5 rounded-2xl flex-row justify-center items-center gap-2 ${
                cancelBooking.isPending ? "opacity-50" : ""
              }`}
              onPress={handleCancel}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? (
                <ActivityIndicator color="#EF4444" size="small" />
              ) : (
                <>
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={18}
                    color="#EF4444"
                  />
                  <Text className="text-red-500 font-bold text-base">
                    Cancel Booking
                  </Text>
                </>
              )}
            </TouchableOpacity>
            <Text
              className="text-xs text-center mt-2"
              style={{ color: colors.textMuted }}
            >
              Please read our cancellation policy before proceeding.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
