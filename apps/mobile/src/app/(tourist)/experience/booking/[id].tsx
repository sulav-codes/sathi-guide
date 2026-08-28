import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  LinearTransition,
} from "react-native-reanimated";
import { CounterControl } from "@/components/CounterControl";
import { SectionHeader } from "@/components/SectionHeader";
import { StarRating } from "@/components/StarRating";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExperience } from "@/hooks/use-experiences";
import { useCreateBooking } from "@/hooks/use-bookings";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { DateTimePicker } from "@expo/ui/community/datetime-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function BookingScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const experienceId = Array.isArray(id) ? id[0] : id;

  const {
    data: experience,
    isLoading: isLoadingExperience,
    error,
  } = useExperience(experienceId || "");
  const createBooking = useCreateBooking();

  const [date, setDate] = useState<Date>(() => new Date(Date.now() + 86400000)); // Default to tomorrow
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [participants, setParticipants] = useState<number>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isLoadingExperience) {
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

  if (error || !experience) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView
          className="flex-1 items-center justify-center px-6"
          style={{ backgroundColor: "transparent" }}
        >
          <ThemedText
            type="title"
            style={{ marginBottom: 8, textAlign: "center" }}
          >
            Experience not found
          </ThemedText>
          <ThemedText
            type="muted"
            style={{ textAlign: "center", marginBottom: 16 }}
          >
            We could not find this experience. Try going back and selecting
            another.
          </ThemedText>
          <TouchableOpacity
            className="bg-orange px-6 py-3 rounded-full"
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <ThemedText style={{ color: "white", fontWeight: "600" }}>
              Go Back
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const pricingRule =
    experience.pricingRules?.find((r) => r.isActive) ||
    experience.pricingRules?.[0];
  const basePrice = pricingRule
    ? parseFloat(pricingRule.amount)
    : parseFloat(experience.basePrice);
  const currency = experience.currency;

  if (participants < experience.minParticipants) {
    setParticipants(experience.minParticipants);
  }

  const platformFeePercent = 0.1;
  const subtotal =
    pricingRule?.unit === "PER_PERSON" ? basePrice * participants : basePrice;
  const serviceFee = subtotal * platformFeePercent;
  const total = subtotal + serviceFee;

  const handleBookNow = async () => {
    try {
      setErrorMessage(null);
      await createBooking.mutateAsync({
        experienceId: experience.id,
        tripDate: date.toISOString(),
        groupSize: participants,
        pricingRuleId: pricingRule?.id || undefined,
      });
      router.replace("/(tourist)/(tabs)/bookings");
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Failed to create booking. Please try again.",
      );
    }
  };

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
          elevation: 2,
        }}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={{ fontSize: 17 }}>
          Book Your Experience
        </ThemedText>
        <View className="w-6" />
      </ThemedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 24 }}
      >
        {errorMessage && (
          <Animated.View
            entering={FadeInDown}
            className="border p-4 rounded-xl bg-red-500/10 border-red-500/20"
          >
            <ThemedText className="text-red-500 text-sm">
              {errorMessage}
            </ThemedText>
          </Animated.View>
        )}

        {/* Summary Card */}
        <Animated.View
          entering={FadeInDown.delay(100)}
          layout={LinearTransition.springify()}
        >
          <ThemedView
            style={{
              flexDirection: "row",
              padding: 12,
              borderRadius: 16,
              alignItems: "center",
              elevation: 2,
              backgroundColor: colors.card,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >
            <Image
              source={{
                uri:
                  experience.coverImage?.url ||
                  "https://placehold.co/100x100/png",
              }}
              className="w-[70px] h-[70px] rounded-xl"
              resizeMode="cover"
            />
            <View className="flex-1 ml-3">
              <ThemedText
                type="subtitle"
                style={{ fontSize: 15 }}
                numberOfLines={1}
              >
                {experience.title}
              </ThemedText>
              <ThemedText type="muted" style={{ fontSize: 12, marginTop: 2 }}>
                {experience.durationHours} hrs • {experience.location.city}
              </ThemedText>
              <View className="mt-1">
                <StarRating
                  rating={parseFloat(experience.averageRating || "0")}
                  reviews={experience.totalReviews || 0}
                  size="sm"
                />
              </View>
            </View>
          </ThemedView>
        </Animated.View>

        {/* Select Date & Time */}
        <Animated.View
          entering={FadeInDown.delay(200)}
          layout={LinearTransition.springify()}
        >
          <SectionHeader title="Select Date & Time" colors={colors} />

          <View className="flex-col gap-3">
            {/* Date Picker Button */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                padding: 16,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "space-between",
                elevation: 2,
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
              activeOpacity={0.8}
              onPress={() => {
                setShowDatePicker(true);
                setShowTimePicker(false);
              }}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol name="calendar" size={24} color={colors.primary} />
                <ThemedText type="defaultSemiBold">
                  {date.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </ThemedText>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Time Picker Button */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                padding: 16,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "space-between",
                elevation: 2,
                backgroundColor: colors.card,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
              }}
              activeOpacity={0.8}
              onPress={() => {
                setShowTimePicker(true);
                setShowDatePicker(false);
              }}
            >
              <View className="flex-row items-center gap-3">
                <IconSymbol
                  name="clock.fill"
                  size={24}
                  color={colors.primary}
                />
                <ThemedText type="defaultSemiBold">
                  {date.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </ThemedText>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <Animated.View
              entering={FadeIn}
              layout={LinearTransition.springify()}
              className="mt-4 rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                minimumDate={new Date()}
                themeVariant={theme}
                onValueChange={(_event, selectedDate) => {
                  if (Platform.OS === "android") setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  className="p-3 border-t items-center"
                  style={{ borderColor: colors.border }}
                  onPress={() => setShowDatePicker(false)}
                >
                  <ThemedText
                    style={{ color: colors.primary, fontWeight: "600" }}
                  >
                    Done
                  </ThemedText>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}

          {showTimePicker && (
            <Animated.View
              entering={FadeIn}
              layout={LinearTransition.springify()}
              className="mt-4 rounded-2xl overflow-hidden"
              style={{ backgroundColor: colors.card }}
            >
              <DateTimePicker
                value={date}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                themeVariant={theme}
                onValueChange={(_event, selectedDate) => {
                  if (Platform.OS === "android") setShowTimePicker(false);
                  if (selectedDate) setDate(selectedDate);
                }}
              />
              {Platform.OS === "ios" && (
                <TouchableOpacity
                  className="p-3 border-t items-center"
                  style={{ borderColor: colors.border }}
                  onPress={() => setShowTimePicker(false)}
                >
                  <ThemedText
                    style={{ color: colors.primary, fontWeight: "600" }}
                  >
                    Done
                  </ThemedText>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* Select Participants */}
        <Animated.View
          entering={FadeInDown.delay(300)}
          layout={LinearTransition.springify()}
        >
          <SectionHeader title="Select Participants" colors={colors} />
          <ThemedView
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 16,
              elevation: 2,
              backgroundColor: colors.card,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <ThemedText type="defaultSemiBold">Number of People</ThemedText>
                <ThemedText type="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {currency} {basePrice.toLocaleString()}{" "}
                  {pricingRule?.unit === "PER_PERSON"
                    ? "per person"
                    : "per group"}
                </ThemedText>
              </View>
              <CounterControl
                value={participants}
                min={experience.minParticipants}
                max={experience.maxParticipants}
                colors={colors}
                onIncrement={() =>
                  setParticipants((p) =>
                    Math.min(experience.maxParticipants, p + 1),
                  )
                }
                onDecrement={() =>
                  setParticipants((p) =>
                    Math.max(experience.minParticipants, p - 1),
                  )
                }
              />
            </View>
          </ThemedView>
        </Animated.View>

        {/* Your Guide */}
        <Animated.View
          entering={FadeInDown.delay(400)}
          layout={LinearTransition.springify()}
        >
          <SectionHeader title="Your Guide" colors={colors} />
          <ThemedView
            style={{
              flexDirection: "row",
              padding: 14,
              borderRadius: 16,
              alignItems: "center",
              elevation: 2,
              backgroundColor: colors.card,
              gap: 10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >
            <Image
              source={{
                uri:
                  experience.guide.avatarUrl ||
                  "https://placehold.co/100x100/png",
              }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
            <View className="flex-1">
              <ThemedText type="defaultSemiBold">
                {experience.guide.displayName || experience.guide.fullName}
              </ThemedText>
              <ThemedText type="muted" style={{ fontSize: 12, marginTop: 2 }}>
                Local Guide
              </ThemedText>
            </View>
            <View className="flex-row items-center gap-1 mr-2">
              <IconSymbol name="star.fill" size={14} color={colors.orange} />
              <ThemedText type="defaultSemiBold" style={{ fontSize: 14 }}>
                {experience.guide.averageRating}
              </ThemedText>
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
              <ThemedText
                style={{
                  color: colors.primary,
                  fontSize: 13,
                  fontWeight: "600",
                }}
              >
                Profile
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Animated.View>

        {/* Price Summary */}
        <Animated.View
          entering={FadeInDown.delay(500)}
          layout={LinearTransition.springify()}
        >
          <SectionHeader title="Price Summary" colors={colors} />
          <ThemedView
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 16,
              elevation: 2,
              backgroundColor: colors.card,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
            }}
          >
            {[
              {
                label:
                  pricingRule?.unit === "PER_PERSON"
                    ? `Participants x ${participants}`
                    : "Group Base Price",
                value: `${currency} ${subtotal.toLocaleString()}`,
              },
              {
                label: "Platform Fee ℹ️",
                value: `${currency} ${serviceFee.toLocaleString()}`,
              },
            ].map((row, i) => (
              <View
                key={i}
                className="flex-row justify-between items-center py-2"
              >
                <ThemedText type="muted" style={{ fontSize: 14 }}>
                  {row.label}
                </ThemedText>
                <ThemedText type="default" style={{ fontSize: 14 }}>
                  {row.value}
                </ThemedText>
              </View>
            ))}
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginVertical: 8,
              }}
            />
            <View className="flex-row justify-between items-center py-2">
              <ThemedText type="subtitle" style={{ fontSize: 16 }}>
                Total
              </ThemedText>
              <ThemedText
                type="subtitle"
                style={{ fontSize: 18, color: colors.secondary }}
              >
                {currency} {total.toLocaleString()}
              </ThemedText>
            </View>
          </ThemedView>
        </Animated.View>
      </ScrollView>

      {/* Footer CTA */}
      <ThemedView
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 10,
          backgroundColor: colors.card,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: colors.orange,
            borderRadius: 16,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: createBooking.isPending ? 0.7 : 1,
          }}
          activeOpacity={0.85}
          onPress={handleBookNow}
          disabled={createBooking.isPending}
        >
          {createBooking.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <IconSymbol name="lock.fill" size={18} color="#fff" />
              <ThemedText
                style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
              >
                Confirm & Pay
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
        <View className="flex-row items-center justify-center mt-3 gap-1.5">
          <IconSymbol
            name="shield.fill"
            size={14}
            color={colors.textSecondary}
          />
          <ThemedText type="muted" style={{ fontSize: 13 }}>
            Secure booking. No hidden fees.
          </ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
