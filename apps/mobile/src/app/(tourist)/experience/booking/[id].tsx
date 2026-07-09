import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CounterControl } from "@/components/CounterControl";
import { SectionHeader } from "@/components/SectionHeader";
import { StarRating } from "@/components/StarRating";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExperience } from "@/hooks/use-experiences";
import { useCreateBooking } from "@/hooks/use-bookings";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getMediaUrl } from "@/lib/media";
import DateTimePicker from "@expo/ui/community/datetime-picker";

export default function BookingScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];
  
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const experienceId = Array.isArray(id) ? id[0] : id;

  const { data: experience, isLoading: isLoadingExperience, error } = useExperience(experienceId || "");
  const createBooking = useCreateBooking();

  const [date, setDate] = useState<Date>(new Date(Date.now() + 86400000)); // Default to tomorrow
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [participants, setParticipants] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoadingExperience) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !experience) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-bold text-dark mb-2">
            Experience not found
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-4">
            We could not find this experience. Try going back and selecting another.
          </Text>
          <TouchableOpacity
            className="bg-orange px-6 py-3 rounded-full"
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pricingRule = experience.pricingRules?.find((r) => r.isActive) || experience.pricingRules?.[0];
  const basePrice = pricingRule ? parseFloat(pricingRule.amount) : parseFloat(experience.basePrice);
  const currency = experience.currency;
  
  // Enforce min bounds initially if needed
  if (participants < experience.minParticipants) {
    setParticipants(experience.minParticipants);
  }

  const platformFeePercent = 0.1; // Example 10%
  const subtotal = pricingRule?.unit === "PER_PERSON" ? basePrice * participants : basePrice;
  const serviceFee = subtotal * platformFeePercent;
  const total = subtotal + serviceFee;

  const handleBookNow = async () => {
    try {
      setErrorMessage(null);
      await createBooking.mutateAsync({
        experienceId: experience.id,
        tripDate: date.toISOString(),
        groupSize: participants,
        pricingRuleId: pricingRule?.id,
      });
      // Redirect to bookings tab on success
      router.replace("/(tourist)/(tabs)/bookings");
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to create booking. Please try again.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3.5 bg-white border-b border-gray-100"
        style={{ elevation: 2 }}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-dark">
          Book Your Experience
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
      >
        {errorMessage && (
          <View className="bg-red-50 border border-red-200 p-4 rounded-xl">
            <Text className="text-red-600 text-sm">{errorMessage}</Text>
          </View>
        )}

        {/* Summary Card */}
        <View
          className="flex-row bg-white rounded-2xl p-3 items-center"
          style={{ elevation: 2 }}
        >
          <Image
            source={{ uri: getMediaUrl(experience.coverImageId) || "https://placehold.co/100x100/png" }}
            className="w-[70px] h-[70px] rounded-xl"
            resizeMode="cover"
          />
          <View className="flex-1 ml-3">
            <Text className="text-[15px] font-bold text-dark">
              {experience.title}
            </Text>
            <Text className="text-[12px] text-gray-400 mt-0.5">
              {experience.durationHours} hrs • {experience.location.city}
            </Text>
            <View className="mt-1">
              <StarRating
                rating={parseFloat(experience.averageRating || "0")}
                reviews={experience.totalReviews || 0}
                size="sm"
              />
            </View>
          </View>
        </View>

        {/* Select Date */}
        <View>
          <SectionHeader title="Select Date" colors={colors} />
          <TouchableOpacity 
            className="bg-white rounded-2xl p-4 flex-row items-center justify-between"
            style={{ elevation: 2 }}
            onPress={() => setShowDatePicker(true)}
          >
            <View className="flex-row items-center gap-3">
              <IconSymbol name="calendar" size={24} color={colors.primary} />
              <Text className="text-[15px] font-medium text-dark">
                {date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onValueChange={(_event, selectedDate) => {
                setShowDatePicker(false);
                setDate(selectedDate);
              }}
              onDismiss={() => setShowDatePicker(false)}
            />
          )}
        </View>

        {/* Select Participants */}
        <View>
          <SectionHeader title="Select Participants" colors={colors} />
          <View
            className="bg-white rounded-2xl px-4 py-2"
            style={{ elevation: 2 }}
          >
            <View className="flex-row justify-between items-center py-3">
              <View>
                <Text className="text-[14px] font-semibold text-dark">
                  Number of People
                </Text>
                <Text className="text-[12px] text-gray-400 mt-0.5">
                  {currency} {basePrice.toLocaleString()} {pricingRule?.unit === "PER_PERSON" ? "per person" : "per group"}
                </Text>
              </View>
              <CounterControl
                value={participants}
                min={experience.minParticipants}
                max={experience.maxParticipants}
                colors={colors}
                onIncrement={() => setParticipants((p) => Math.min(experience.maxParticipants, p + 1))}
                onDecrement={() => setParticipants((p) => Math.max(experience.minParticipants, p - 1))}
              />
            </View>
          </View>
        </View>

        {/* Your Guide */}
        <View>
          <SectionHeader title="Your Guide" colors={colors} />
          <View
            className="flex-row bg-white rounded-2xl p-3.5 items-center gap-2.5"
            style={{ elevation: 2 }}
          >
            <Image
              source={{ uri: getMediaUrl(experience.guide.avatarUrl) || "https://placehold.co/100x100/png" }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-[14px] font-bold text-dark">
                {experience.guide.displayName || experience.guide.fullName}
              </Text>
              <Text className="text-[12px] text-gray-400 mt-0.5">
                Local Guide
              </Text>
            </View>
            <View className="flex-row items-center gap-1 mr-2">
              <IconSymbol name="star.fill" size={14} color={colors.orange} />
              <Text className="text-[14px] font-bold text-dark">
                {experience.guide.averageRating}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.navigate({
                  pathname: "/experience/guide/[id]",
                  params: { id: experience.guide.id },
                })
              }
            >
              <Text className="text-[13px] text-primary font-semibold">
                View Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price Summary */}
        <View>
          <SectionHeader title="Price Summary" colors={colors} />
          <View
            className="bg-white rounded-2xl px-4 py-3"
            style={{ elevation: 2 }}
          >
            {[
              {
                label: pricingRule?.unit === "PER_PERSON" ? `Participants x ${participants}` : 'Group Base Price',
                value: `${currency} ${subtotal.toLocaleString()}`,
              },
              {
                label: "Service Fee ℹ️",
                value: `${currency} ${serviceFee.toLocaleString()}`,
              },
            ].map((row, i) => (
               <View
                key={i}
                className="flex-row justify-between items-center py-2"
              >
                <Text className="text-[14px] text-gray-500">{row.label}</Text>
                <Text className="text-[14px] text-gray-500">{row.value}</Text>
              </View>
            ))}
            <View className="h-px bg-gray-100 my-1" />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-[16px] font-extrabold text-dark">
                Total
              </Text>
              <Text className="text-[18px] font-extrabold text-secondary">
                {currency} {total.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View
        className="bg-white px-4 pt-3 pb-7 border-t border-gray-100"
        style={{ elevation: 10 }}
      >
        <TouchableOpacity
          className={`bg-orange rounded-2xl py-4 flex-row items-center justify-center gap-2 ${createBooking.isPending ? 'opacity-70' : ''}`}
          activeOpacity={0.85}
          onPress={handleBookNow}
          disabled={createBooking.isPending}
        >
          {createBooking.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol name="lock.fill" size={18} color="#fff" />
              <Text className="text-white font-bold text-base">
                Confirm & Pay
              </Text>
            </>
          )}
        </TouchableOpacity>
        <View className="flex-row items-center justify-center mt-2.5 gap-1.5">
          <IconSymbol name="shield.fill" size={14} color={colors.textSecondary} />
          <Text className="text-[13px] text-gray-400">
            Secure booking. No hidden fees.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
