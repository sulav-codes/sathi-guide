import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CounterControl } from "@/components/CounterControl";
import { DateCard } from "@/components/DateCard";
import { SectionHeader } from "@/components/SectionHeader";
import { StarRating } from "@/components/StarRating";
import { Colors } from "@/constants/theme";
import { BOOKING_DATES, EXPERIENCES, GUIDE } from "@/data";
import { useColorScheme } from "@/hooks/use-color-scheme";

const ADULT_PRICE = 1500;
const CHILD_PRICE = 750;
const SERVICE_FEE = 150;

export default function BookingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const experienceId = Array.isArray(id) ? id[0] : id;

  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);

  const experience = EXPERIENCES.find((e) => e.id === experienceId);
  const summaryMeta = [experience?.duration, experience?.location]
    .filter(Boolean)
    .join(" • ");
  const total = adults * ADULT_PRICE + children * CHILD_PRICE + SERVICE_FEE;

  if (!experience) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-bold text-dark mb-2">
            Experience not found
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-4">
            We could not find this experience. Try going back and selecting
            another.
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3.5 bg-white border-b border-gray-100"
        style={{ elevation: 2 }}
      >
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()}>
          <Text className="text-xl text-gray-700">←</Text>
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
        {/* Summary Card */}
        <View
          className="flex-row bg-white rounded-2xl p-3 items-center"
          style={{ elevation: 2 }}
        >
          <Image
            source={{ uri: experience.image }}
            className="w-[70px] h-[70px] rounded-xl"
            resizeMode="cover"
          />
          <View className="flex-1 ml-3">
            <Text className="text-[15px] font-bold text-dark">
              {experience.title}
            </Text>
            {summaryMeta ? (
              <Text className="text-[12px] text-gray-400 mt-0.5">
                {summaryMeta}
              </Text>
            ) : null}
            <View className="mt-1">
              <StarRating
                rating={experience.rating}
                reviews={experience.reviews}
                size="sm"
              />
            </View>
          </View>
        </View>

        {/* Select Date */}
        <View>
          <SectionHeader title="Select Date" colors={colors} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {BOOKING_DATES.map((item, index) => (
              <DateCard
                key={index}
                item={item}
                isSelected={selectedDate === index}
                colors={colors}
                onPress={() => setSelectedDate(index)}
              />
            ))}
          </ScrollView>
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
                  Adults (12+)
                </Text>
                <Text className="text-[12px] text-gray-400 mt-0.5">
                  NPR {ADULT_PRICE.toLocaleString()}
                </Text>
              </View>
              <CounterControl
                value={adults}
                min={1}
                colors={colors}
                onIncrement={() => setAdults((p) => p + 1)}
                onDecrement={() => setAdults((p) => Math.max(1, p - 1))}
              />
            </View>

            <View className="h-px bg-gray-100" />

            <View className="flex-row justify-between items-center py-3">
              <View>
                <Text className="text-[14px] font-semibold text-dark">
                  Children (5–11)
                </Text>
                <Text className="text-[12px] text-gray-400 mt-0.5">
                  NPR {CHILD_PRICE}
                </Text>
              </View>
              <CounterControl
                value={children}
                min={0}
                colors={colors}
                onIncrement={() => setChildren((p) => p + 1)}
                onDecrement={() => setChildren((p) => Math.max(0, p - 1))}
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
              source={{ uri: GUIDE.avatar }}
              className="w-12 h-12 rounded-full"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-[14px] font-bold text-dark">
                {GUIDE.name}
              </Text>
              <Text className="text-[12px] text-gray-400 mt-0.5">
                Licensed Guide
              </Text>
            </View>
            <View className="flex-row items-center gap-1 mr-2">
              <Text className="text-sm">⭐</Text>
              <Text className="text-[14px] font-bold text-dark">
                {GUIDE.rating}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.navigate({
                  pathname: "/experience/guide/[id]",
                  params: { id: GUIDE.id },
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
                label: `Adults x ${adults}`,
                value: `NPR ${(adults * ADULT_PRICE).toLocaleString()}`,
              },
              {
                label: `Children x ${children}`,
                value: `NPR ${(children * CHILD_PRICE).toLocaleString()}`,
              },
              {
                label: "Service Fee ℹ️",
                value: `NPR ${SERVICE_FEE}`,
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
                NPR {total.toLocaleString()}
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
          className="bg-orange rounded-2xl py-4 flex-row items-center justify-center gap-2"
          activeOpacity={0.85}
        >
          <Text className="text-lg">🔒</Text>
          <Text className="text-white font-bold text-base">
            Continue to Payment
          </Text>
        </TouchableOpacity>
        <View className="flex-row items-center justify-center mt-2.5 gap-1.5">
          <Text className="text-sm">🛡️</Text>
          <Text className="text-[13px] text-gray-400">
            Secure booking. No hidden fees.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
