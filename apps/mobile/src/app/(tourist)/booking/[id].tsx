import { router, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBooking, useCancelBooking } from "@/hooks/use-bookings";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getMediaUrl } from "@/lib/media";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SectionHeader } from "@/components/SectionHeader";

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

const getStatusLabel = (status: string) => {
  return status.replace(/_/g, " ");
};

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
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !booking) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-bold text-dark mb-2">Booking not found</Text>
          <Text className="text-sm text-gray-500 text-center mb-4">
            We could not find this booking or there was an error loading it.
          </Text>
          <TouchableOpacity className="bg-orange px-6 py-3 rounded-full" onPress={() => router.back()}>
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
                    ? err.message.join('\n') 
                    : (err?.message || "Failed to cancel booking");
                  Alert.alert("Error", errorMessage);
                }
              }
            );
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3.5 bg-white border-b border-gray-100" style={{ elevation: 2 }}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-dark">Booking Details</Text>
        <View className="w-6" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}>
        
        {/* Status Card */}
        <View className="bg-white rounded-2xl p-4 items-center" style={{ elevation: 2 }}>
          <View 
            className="px-4 py-1.5 rounded-full mb-2" 
            style={{ backgroundColor: `${getStatusColor(booking.status)}20` }}
          >
            <Text className="text-[12px] font-bold uppercase" style={{ color: getStatusColor(booking.status) }}>
              {getStatusLabel(booking.status)}
            </Text>
          </View>
          <Text className="text-sm text-gray-500 text-center">
            Booking ID: <Text className="font-mono text-gray-700">{booking.id.split('-')[0].toUpperCase()}</Text>
          </Text>
        </View>

        {/* Experience Info */}
        <View>
          <SectionHeader title="Experience" colors={colors} />
          <TouchableOpacity 
            className="flex-row bg-white rounded-2xl p-3 items-center" 
            style={{ elevation: 2 }}
            onPress={() => router.navigate({
              pathname: "/experience/[id]",
              params: { id: booking.experience.id },
            })}
          >
            <Image
              source={{ uri: getMediaUrl(booking.experience.coverImageId) || "https://placehold.co/100x100/png" }}
              className="w-20 h-20 rounded-xl"
              resizeMode="cover"
            />
            <View className="flex-1 ml-3">
              <Text className="text-[15px] font-bold text-dark mb-1">
                {booking.experience.title}
              </Text>
              <View className="flex-row items-center gap-1 mt-1">
                <IconSymbol name="calendar" size={14} color={colors.textSecondary} />
                <Text className="text-[13px] text-gray-600">
                  {new Date(booking.tripDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </Text>
              </View>
              <View className="flex-row items-center gap-1 mt-1">
                <IconSymbol name="person.3.fill" size={14} color={colors.textSecondary} />
                <Text className="text-[13px] text-gray-600">
                  {booking.groupSize} {booking.groupSize === 1 ? 'Person' : 'People'}
                </Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Guide Info */}
        <View>
          <SectionHeader title="Your Guide" colors={colors} />
          <TouchableOpacity 
            className="flex-row bg-white rounded-2xl p-3.5 items-center gap-3" 
            style={{ elevation: 2 }}
            onPress={() => router.navigate({
              pathname: "/experience/guide/[id]",
              params: { id: booking.guide.id },
            })}
          >
            <Image
              source={{ uri: getMediaUrl(booking.guide.avatarUrl) || "https://placehold.co/100x100/png" }}
              className="w-12 h-12 rounded-full"
            />
            <View className="flex-1">
              <Text className="text-[15px] font-bold text-dark">
                {booking.guide.displayName || booking.guide.fullName}
              </Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <IconSymbol name="star.fill" size={12} color={colors.orange} />
                <Text className="text-[12px] font-bold text-gray-600">{booking.guide.averageRating}</Text>
              </View>
            </View>
            <View className="bg-primary/10 p-2 rounded-full">
              <IconSymbol name="message.fill" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Pricing Info */}
        {booking.pricingSnapshot && (
          <View>
            <SectionHeader title="Payment Details" colors={colors} />
            <View className="bg-white rounded-2xl px-4 py-3" style={{ elevation: 2 }}>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-[14px] text-gray-500">Base Amount</Text>
                <Text className="text-[14px] text-gray-700">
                  {booking.currency} {parseFloat(booking.pricingSnapshot.baseAmount).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-[14px] text-gray-500">Platform Fee</Text>
                <Text className="text-[14px] text-gray-700">
                  {booking.currency} {parseFloat(booking.pricingSnapshot.platformFeeAmount).toLocaleString()}
                </Text>
              </View>
              <View className="h-px bg-gray-100 my-1" />
              <View className="flex-row justify-between items-center py-2">
                <Text className="text-[16px] font-extrabold text-dark">Total Paid</Text>
                <Text className="text-[16px] font-extrabold text-dark">
                  {booking.currency} {parseFloat(booking.pricingSnapshot.totalAmount).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Cancel Button */}
        {booking.canCancel && (
          <View className="mt-4">
            <TouchableOpacity 
              className={`border border-red-500 py-3.5 rounded-2xl flex-row justify-center items-center gap-2 ${cancelBooking.isPending ? 'opacity-50' : ''}`}
              onPress={handleCancel}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? (
                <ActivityIndicator color="#EF4444" size="small" />
              ) : (
                <>
                  <IconSymbol name="xmark.circle.fill" size={18} color="#EF4444" />
                  <Text className="text-red-500 font-bold text-base">Cancel Booking</Text>
                </>
              )}
            </TouchableOpacity>
            <Text className="text-xs text-gray-400 text-center mt-2">
              Please read our cancellation policy before proceeding.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
