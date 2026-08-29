import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useMyBookings } from "@/hooks/use-bookings";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const getStatusColor = (status: string) => {
  switch (status) {
    case "CONFIRMED": return "#10B981";
    case "PENDING": return "#F59E0B";
    case "IN_PROGRESS": return "#3B82F6";
    case "COMPLETED": return "#8B5CF6";
    case "CANCELLED":
    case "REJECTED": return "#EF4444";
    case "NO_SHOW": return "#EF4444";
    default: return "#6B7280";
  }
};

const getStatusLabel = (status: string) => {
  if (status === "IN_PROGRESS") return "🟢 In Progress";
  return status.replace(/_/g, " ");
};

export default function BookingsScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const [statusFilter, setStatusFilter] = useState<string>("");

  const { data: bookingsData, isLoading, refetch, isRefetching, error } = useMyBookings(
    statusFilter ? { status: statusFilter } : {}
  );

  const TABS = [
    { label: "All", value: "" },
    { label: "Pending", value: "PENDING" },
    { label: "Active", value: "IN_PROGRESS" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Completed", value: "COMPLETED" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        className="flex-row items-center px-4 py-3.5"
        style={{ elevation: 2 }}
      >
        <Text className="text-[20px] font-bold" style={{ color: colors.text }}>
          My Bookings
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex justify-between mx-4 py-2 rounded-2xl">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, gap: 6 }}>
          {TABS.map((tab) => {
            const isSelected = statusFilter === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setStatusFilter(tab.value)}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: isSelected ? colors.activeCard : colors.inactiveCard,
                }}
              >
                <Text
                  className="font-semibold"
                  style={{
                    color: isSelected ? colors.primary : colors.textMuted,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading && !isRefetching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500 mb-4">Failed to load bookings.</Text>
          <TouchableOpacity className="bg-primary px-6 py-2 rounded-full" onPress={() => refetch()}>
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          {(!bookingsData?.items || bookingsData.items.length === 0) ? (
            <View className="items-center justify-center py-20 px-8">
              <IconSymbol name="calendar" size={64} color={colors.textMuted} />
              <ThemedText className="text-lg font-bold mt-4 text-center">No bookings found</ThemedText>
              <Text className="text-sm text-gray-500 text-center mt-2">
                {statusFilter ? `You don't have any ${statusFilter.toLowerCase()} bookings.` : "You haven't booked any experiences yet."}
              </Text>
            </View>
          ) : (
            bookingsData.items.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                className="rounded-2xl overflow-hidden flex-row"
                style={{ elevation: 2, borderColor: colors.border, borderWidth: 1, backgroundColor: colors.card }}
                activeOpacity={0.85}
                onPress={() => router.navigate({
                  pathname: "/(tourist)/booking/[id]" as any,
                  params: { id: booking.id },
                })}
              >
                <Image
                  source={{ uri: booking.experience.coverImage?.url || "https://placehold.co/120x120/png" }}
                  className="w-28 h-full"
                  resizeMode="cover"
                />
                <ThemedView className="flex-1 p-3">
                  <View className="flex-row justify-between items-start mb-1">
                    <ThemedText className="text-[14px] font-bold flex-1 mr-2" numberOfLines={2}>
                      {booking.experience.title}
                    </ThemedText>
                    <View 
                      className="px-2 py-1 rounded-md" 
                      style={{ backgroundColor: `${getStatusColor(booking.status)}20` }}
                    >
                      <Text 
                        className="text-[10px] font-bold uppercase"
                        style={{ color: getStatusColor(booking.status) }}
                      >
                        {getStatusLabel(booking.status)}
                      </Text>
                    </View>
                  </View>
                  
                  <View className="flex-row items-center gap-1 mt-1">
                    <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
                    <Text className="text-[12px] text-gray-500">
                      {new Date(booking.tripDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center gap-2 mt-3">
                    <Image 
                      source={{ uri: booking.guide.avatarUrl || "https://placehold.co/100x100/png" }}
                      className="w-6 h-6 rounded-full"
                    />
                    <Text className="text-[12px] font-medium text-gray-600">
                      {booking.guide.displayName || booking.guide.fullName}
                    </Text>
                  </View>
                </ThemedView>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
