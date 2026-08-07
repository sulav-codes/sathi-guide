import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useMyGuideProfile } from "@/hooks/use-guides";
import { useBookingRequests, useUpcomingBookings, useActiveBookings } from "@/hooks/use-bookings";
import { IconSymbolName } from "@/types";
import { Image } from "expo-image";
import Header from "@/components/Header";
import { ThemedText } from "@/components/themed-text";

const StatCard = ({
  icon,
  value,
  label,
  color,
  colors,
}: {
  icon: IconSymbolName;
  value: string;
  label: string;
  color: string;
  colors: typeof Colors.light;
}) => (
  <View
    className="flex-1 rounded-2xl p-4 mx-1"
    style={{
      backgroundColor: `${color}15`,
      borderWidth: 1,
      borderColor: `${color}30`,
    }}
  >
    <IconSymbol name={icon} size={22} color={color} />
    <Text
      className="text-2xl font-extrabold mt-2"
      style={{ color: colors.text }}
    >
      {value}
    </Text>
    <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
      {label}
    </Text>
  </View>
);

export default function GuideDashboard() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const {
    data: guideProfile,
    isLoading,
    refetch,
    isRefetching,
  } = useMyGuideProfile();
  const { data: requests } = useBookingRequests({
    status: "PENDING",
    limit: 3,
  });
  const { data: upcoming } = useUpcomingBookings({ limit: 3 });
  const { data: activeBookings } = useActiveBookings();
  const activeTrip = activeBookings?.items?.[0] ?? null;

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

  const pendingCount = requests?.items?.length || 0;
  const upcomingCount = upcoming?.items?.length || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {/* Active Trip Banner */}
        {activeTrip && (
          <TouchableOpacity
            style={{
              marginHorizontal: 16,
              marginTop: 12,
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#3B82F6",
              elevation: 4,
            }}
            onPress={() =>
              router.push({
                pathname: "/(guide)/booking/[id]/active",
                params: { id: activeTrip.id },
              } as any)
            }
          >
            <View style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: "#fff" }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>TRIP IN PROGRESS</Text>
                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 }} numberOfLines={1}>
                  {activeTrip.experience?.title}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </TouchableOpacity>
        )}

        {/* Hero Banner */}
        <View style={{ height: 180, overflow: "hidden" }}>
          <Image
            source={require("@/assets/images/sathi_guide_header.png")}
            style={{ width: "100%", height: "100%", position: "absolute" }}
            contentFit="cover"
          />
          <View
            style={{
              flex: 1,
              backgroundColor: colors.heroOverlay || "rgba(0,0,0,0.4)",
              padding: 20,
              justifyContent: "center",
            }}
          >
            <ThemedText
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#fff",
                marginTop: 20,
              }}
            >
              Namaste,{" "}
              {guideProfile?.displayName ||
                user?.email?.split("@")[0] ||
                "Guide"}
              ! 🙏
            </ThemedText>
            <ThemedText style={{ fontSize: 15, color: "#fff", marginTop: 2 }}>
              Here&apos;s your guide overview
            </ThemedText>

            {guideProfile?.currentVerificationStatus === "APPROVED" && (
              <View className="bg-green-500/20 px-2 py-1 rounded-full flex-row items-center gap-1 border border-green-400/50 self-start mt-3">
                <IconSymbol
                  name="checkmark.seal.fill"
                  size={14}
                  color="#34d399"
                />
                <Text className="text-green-50 text-xs font-bold">
                  Verified
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row px-4 mt-6 mb-5">
          <StatCard
            icon="star.fill"
            value={guideProfile?.averageRating || "—"}
            label="Rating"
            color="#F59E0B"
            colors={colors}
          />
          <StatCard
            icon="suitcase.fill"
            value={`${guideProfile?.totalTripsCompleted || 0}`}
            label="Trips"
            color="#3B82F6"
            colors={colors}
          />
          <StatCard
            icon="calendar"
            value={`${pendingCount}`}
            label="Pending"
            color="#EF4444"
            colors={colors}
          />
        </View>

        {/* Pending Booking Requests */}
        <View className="px-5 mb-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Booking Requests
            </Text>
            <TouchableOpacity
              onPress={() => router.navigate("/(guide)/bookings" as any)}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                View all
              </Text>
            </TouchableOpacity>
          </View>
          {pendingCount === 0 ? (
            <View
              className="rounded-2xl p-6 items-center"
              style={{ backgroundColor: colors.card }}
            >
              <IconSymbol name="calendar" size={40} color={colors.textMuted} />
              <Text
                className="text-sm mt-2"
                style={{ color: colors.textMuted }}
              >
                No pending requests
              </Text>
            </View>
          ) : (
            requests?.items.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                className="rounded-2xl p-3 flex-row items-center mb-2"
                style={{
                  backgroundColor: colors.card,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={() =>
                  router.navigate({
                    pathname: "/(guide)/bookings" as any,
                    params: { bookingId: booking.id },
                  })
                }
              >
                <Image
                  source={{
                    uri:
                      booking.experience.coverImage?.url ||
                      "https://placehold.co/80x80/png",
                  }}
                  className="w-14 h-14 rounded-xl"
                />
                <View className="flex-1 ml-3">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                    numberOfLines={1}
                  >
                    {booking.experience.title}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <IconSymbol
                      name="calendar"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="text-xs"
                      style={{ color: colors.textMuted }}
                    >
                      {new Date(booking.tripDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text
                      className="text-xs"
                      style={{ color: colors.textMuted }}
                    >
                      •
                    </Text>
                    <IconSymbol
                      name="person.3.fill"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="text-xs"
                      style={{ color: colors.textMuted }}
                    >
                      {booking.groupSize} people
                    </Text>
                  </View>
                </View>
                <View className="bg-amber-50 px-2 py-1 rounded-lg">
                  <Text className="text-amber-600 text-xs font-semibold">
                    PENDING
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Upcoming Trips */}
        <View className="px-5 mb-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-bold" style={{ color: colors.text }}>
              Upcoming Trips
            </Text>
            <TouchableOpacity
              onPress={() => router.navigate("/(guide)/bookings" as any)}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.primary }}
              >
                View all
              </Text>
            </TouchableOpacity>
          </View>
          {upcomingCount === 0 ? (
            <View
              className="rounded-2xl p-6 items-center"
              style={{ backgroundColor: colors.card }}
            >
              <IconSymbol
                name="suitcase.fill"
                size={40}
                color={colors.textMuted}
              />
              <Text
                className="text-sm mt-2"
                style={{ color: colors.textMuted }}
              >
                No upcoming trips
              </Text>
            </View>
          ) : (
            upcoming?.items.map((booking) => (
              <View
                key={booking.id}
                className="rounded-2xl p-3 flex-row items-center mb-2"
                style={{
                  backgroundColor: colors.card,
                  elevation: 2,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Image
                  source={{
                    uri:
                      booking.experience.coverImage?.url ||
                      "https://placehold.co/80x80/png",
                  }}
                  className="w-14 h-14 rounded-xl"
                />
                <View className="flex-1 ml-3">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: colors.text }}
                    numberOfLines={1}
                  >
                    {booking.experience.title}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <IconSymbol
                      name="calendar"
                      size={12}
                      color={colors.textSecondary}
                    />
                    <Text
                      className="text-xs"
                      style={{ color: colors.textMuted }}
                    >
                      {new Date(booking.tripDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>
                <View className="bg-green-50 px-2 py-1 rounded-lg">
                  <Text className="text-green-600 text-xs font-semibold">
                    CONFIRMED
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View className="px-5 mb-8">
          <Text
            className="text-lg font-bold mb-3"
            style={{ color: colors.text }}
          >
            Quick Actions
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-primary/10 p-4 rounded-2xl items-center"
              onPress={() =>
                router.navigate("/(guide)/experiences/create" as any)
              }
            >
              <IconSymbol name="plus" size={28} color={colors.primary} />
              <Text
                className="text-sm font-semibold mt-2"
                style={{ color: colors.primary }}
              >
                New Experience
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-secondary/10 p-4 rounded-2xl items-center"
              onPress={() =>
                router.navigate("/(guide)/experiences/mine" as any)
              }
            >
              <IconSymbol
                name="building.columns.fill"
                size={28}
                color={colors.secondary}
              />
              <Text
                className="text-sm font-semibold mt-2"
                style={{ color: colors.secondary }}
              >
                My Experiences
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-amber-500/10 p-4 rounded-2xl items-center"
              onPress={() => router.navigate("/(guide)/verification" as any)}
            >
              <IconSymbol name="shield.fill" size={28} color="#F59E0B" />
              <Text
                className="text-sm font-semibold mt-2"
                style={{ color: "#F59E0B" }}
              >
                Verification
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
