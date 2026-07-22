import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useBookingRequests, useUpcomingBookings, useBookingHistory, useAcceptBooking, useRejectBooking } from "@/hooks/use-bookings";
import { getMediaUrl } from "@/lib/media";

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED": return "#10B981";
    case "PENDING": return "#F59E0B";
    case "COMPLETED": return "#3B82F6";
    case "CANCELLED_BY_TOURIST":
    case "CANCELLED_BY_GUIDE":
    case "REJECTED": return "#EF4444";
    default: return "#6B7280";
  }
};

function BookingRequestItem({ booking, onAccept, onReject }: {
  booking: any;
  onAccept: () => void;
  onReject: () => void;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View
      className="rounded-2xl p-4 mb-3"
      style={{ backgroundColor: colors.card, elevation: 2, borderWidth: 1, borderColor: "#F59E0B50" }}
    >
      <View className="flex-row items-start mb-3">
        <Image
          source={{ uri: getMediaUrl(booking.experience.coverImageId) || "https://placehold.co/80x80/png" }}
          className="w-16 h-16 rounded-xl"
        />
        <View className="flex-1 ml-3">
          <Text className="text-sm font-bold" numberOfLines={2}>{booking.experience.title}</Text>
          <View className="flex-row items-center gap-1 mt-1">
            <IconSymbol name="calendar" size={12} color="#F59E0B" />
            <Text className="text-xs" style={{ color: "#F59E0B" }}>
              {new Date(booking.tripDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </Text>
          </View>
          <View className="flex-row items-center gap-1 mt-0.5">
            <IconSymbol name="person.3.fill" size={12} color="#F59E0B" />
            <Text className="text-xs" style={{ color: "#F59E0B" }}>{booking.groupSize} {booking.groupSize === 1 ? "person" : "people"}</Text>
          </View>
        </View>
      </View>
      <View className="flex-row gap-2 mt-1">
        <TouchableOpacity
          className="flex-1 bg-green-500/20 border border-green-500/50 py-2.5 rounded-xl items-center"
          onPress={onAccept}
        >
          <Text className="text-green-600 font-bold text-sm">Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-red-500/20 border border-red-500/50 py-2.5 rounded-xl items-center"
          onPress={onReject}
        >
          <Text className="text-red-500 font-bold text-sm">Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BookingListItem({ booking }: { booking: any }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View
      className="rounded-2xl p-3 flex-row items-center mb-2"
      style={{ backgroundColor: colors.card, elevation: 2, borderWidth: 1, borderColor: colors.border }}
    >
      <Image
        source={{ uri: getMediaUrl(booking.experience.coverImageId) || "https://placehold.co/80x80/png" }}
        className="w-14 h-14 rounded-xl"
      />
      <View className="flex-1 ml-3">
        <Text className="text-sm font-bold" numberOfLines={1}>{booking.experience.title}</Text>
        <View className="flex-row items-center gap-1 mt-1">
          <IconSymbol name="calendar" size={12} color="#6B7280" />
          <Text className="text-xs" style={{ color: "#6B7280" }}>
            {new Date(booking.tripDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Text>
        </View>
      </View>
      <View
        className="px-2 py-1 rounded-lg"
        style={{ backgroundColor: `${getStatusColor(booking.status)}20` }}
      >
        <Text className="text-xs font-bold" style={{ color: getStatusColor(booking.status) }}>
          {booking.status.split("_")[0]}
        </Text>
      </View>
    </View>
  );
}

function BookingActionsWrapper({ booking }: { booking: any }) {
  const acceptBooking = useAcceptBooking(booking.id);
  const rejectBooking = useRejectBooking(booking.id);

  const handleAccept = () => {
    Alert.alert("Accept Booking", "Are you sure you want to accept this booking?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: () => acceptBooking.mutate({}, {
          onError: (err: any) => Alert.alert("Error", err?.message || "Failed to accept booking"),
        }),
      },
    ]);
  };

  const handleReject = () => {
    Alert.alert("Decline Booking", "Are you sure you want to decline this booking?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Decline",
        style: "destructive",
        onPress: () => rejectBooking.mutate(
          { reasonCode: "GUIDE_DECLINED", reason: "Guide declined the booking." },
          { onError: (err: any) => Alert.alert("Error", err?.message || "Failed to reject booking") }
        ),
      },
    ]);
  };

  return (
    <BookingRequestItem
      booking={booking}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
}

export default function GuideBookingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [tab, setTab] = useState<"requests" | "upcoming" | "history">("requests");

  const { data: requests, isLoading: loadingReq, refetch: refetchReq, isRefetching: refetchingReq } = useBookingRequests();
  const { data: upcoming, isLoading: loadingUpcoming, refetch: refetchUpcoming, isRefetching: refetchingUpcoming } = useUpcomingBookings();
  const { data: history, isLoading: loadingHistory, refetch: refetchHistory, isRefetching: refetchingHistory } = useBookingHistory();

  const isLoading = tab === "requests" ? loadingReq : tab === "upcoming" ? loadingUpcoming : loadingHistory;
  const isRefetching = tab === "requests" ? refetchingReq : tab === "upcoming" ? refetchingUpcoming : refetchingHistory;
  const doRefetch = tab === "requests" ? refetchReq : tab === "upcoming" ? refetchUpcoming : refetchHistory;

  const currentItems =
    tab === "requests" ? requests?.items :
    tab === "upcoming" ? upcoming?.items :
    history?.items;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>Bookings</Text>
        {requests?.items && requests.items.length > 0 && (
          <View className="bg-red-500 w-6 h-6 rounded-full items-center justify-center">
            <Text className="text-white text-xs font-bold">{requests.items.length}</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="px-5 mb-4">
        <View className="flex-row rounded-xl p-1" style={{ backgroundColor: colors.border }}>
          <TouchableOpacity
            className="flex-1 py-2 items-center rounded-3xl"
            style={{ backgroundColor: tab === "requests" ? colors.card : "transparent" }}
            onPress={() => setTab("requests")}
          >
            <Text className="text-[13px] font-bold" style={{ color: tab === "requests" ? colors.primary : colors.textMuted }}>
              New {requests?.items && requests.items.length > 0 ? `(${requests.items.length})` : ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2 items-center rounded-3xl"
            style={{ backgroundColor: tab === "upcoming" ? colors.card : "transparent" }}
            onPress={() => setTab("upcoming")}
          >
            <Text className="text-[13px] font-bold" style={{ color: tab === "upcoming" ? colors.primary : colors.textMuted }}>
              Confirmed {upcoming?.items && upcoming.items.length > 0 ? `(${upcoming.items.length})` : ""}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2 items-center rounded-3xl"
            style={{ backgroundColor: tab === "history" ? colors.card : "transparent" }}
            onPress={() => setTab("history")}
          >
            <Text className="text-[13px] font-bold" style={{ color: tab === "history" ? colors.primary : colors.textMuted }}>
              Completed
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={doRefetch} tintColor={colors.primary} />
          }
        >
          {(!currentItems || currentItems.length === 0) ? (
            <View className="items-center py-20">
              <IconSymbol name="calendar" size={56} color={colors.textMuted} />
              <Text className="text-base font-bold mt-4" style={{ color: colors.text }}>
                {tab === "requests" ? "No pending requests" : tab === "upcoming" ? "No upcoming trips" : "No history yet"}
              </Text>
              <Text className="text-sm mt-2 text-center" style={{ color: colors.textMuted }}>
                {tab === "requests" ? "New booking requests will appear here." : "Your booking history will appear here."}
              </Text>
            </View>
          ) : tab === "requests" ? (
            currentItems.map((booking) => (
              <BookingActionsWrapper key={booking.id} booking={booking} />
            ))
          ) : (
            currentItems.map((booking) => (
              <BookingListItem key={booking.id} booking={booking} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
