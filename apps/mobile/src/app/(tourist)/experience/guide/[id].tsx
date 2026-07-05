import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LanguageChip } from "@/components/LanguageChip";
import { SectionHeader } from "@/components/SectionHeader";
import { StarRating } from "@/components/StarRating";
import { Colors } from "@/constants/theme";
import { GUIDE, TOP_EXPERIENCES } from "@/data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Experience } from "@/types";
import { SafeAreaView } from "react-native-safe-area-context";

const StatItem = ({
  icon,
  value,
  label,
}: {
  icon: string;
  value: string;
  label: string;
}) => (
  <View className="flex-1 items-center">
    <Text className="text-lg">{icon}</Text>
    <Text className="text-[16px] font-extrabold text-dark mt-1">{value}</Text>
    <Text className="text-[11px] text-gray-400 mt-0.5 text-center">
      {label}
    </Text>
  </View>
);

const TopExpCard = ({ item }: { item: Experience }) => (
  <TouchableOpacity
    className="w-32 bg-white rounded-xl overflow-hidden mr-3"
    activeOpacity={0.85}
    style={{ elevation: 3 }}
  >
    <Image
      source={{ uri: item.image }}
      className="w-full h-[90px]"
      resizeMode="cover"
    />
    <View className="p-2">
      <Text className="text-[12px] font-semibold text-dark" numberOfLines={2}>
        {item.title}
      </Text>
      <View className="mt-1">
        <StarRating rating={item.rating} reviews={item.reviews} size="sm" />
      </View>
    </View>
  </TouchableOpacity>
);

export default function GuideProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const guideId = Array.isArray(id) ? id[0] : id;
  const guide = guideId && guideId !== GUIDE.id ? null : GUIDE;
  const primaryExperienceId = TOP_EXPERIENCES[0]?.id;

  if (!guide) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-bold text-dark mb-2">
            Guide not found
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-4">
            We could not find this guide. Try going back and selecting another.
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Hero */}
        <View className="h-60 relative">
          <Image
            source={{ uri: "https://picsum.photos/seed/mountains/800/440" }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-4 left-4 right-4 flex-row justify-between">
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-white/90 items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text className="text-sm font-bold text-gray-700">←</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-white/90 items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-sm font-bold text-gray-700">•••</Text>
            </TouchableOpacity>
          </View>

          <View className="absolute top-14 right-5 bg-secondary px-3 py-1.5 rounded-full">
            <Text className="text-white text-xs font-bold">Available</Text>
          </View>

          <View
            className="absolute -bottom-11 self-center border-4 border-white rounded-full"
            style={{ elevation: 8 }}
          >
            <Image
              source={{ uri: guide.avatar }}
              className="w-[90px] h-[90px] rounded-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Info */}
        <View className="px-4 pt-14 pb-4">
          <View className="flex-row items-center justify-center gap-1.5 mb-1">
            <Text className="text-[22px] font-extrabold text-dark">
              {guide.name}
            </Text>
            <Text className="text-lg">✅</Text>
          </View>
          <Text className="text-[14px] text-gray-400 text-center mb-4">
            {guide.role}
          </Text>

          {/* Stats */}
          <View className="flex-row items-center bg-gray-50 rounded-2xl py-3.5 mb-5">
            <StatItem
              icon="⭐"
              value={`${guide.rating}`}
              label={`(${guide.reviews} reviews)`}
            />
            <View className="w-px h-10 bg-gray-200" />
            <StatItem
              icon="👥"
              value={`${guide.travelers}`}
              label="Happy Travelers"
            />
            <View className="w-px h-10 bg-gray-200" />
            <StatItem
              icon="🛡️"
              value={`${guide.yearsExp}`}
              label="Years Experience"
            />
          </View>

          {/* About */}
          <Text className="text-[16px] font-bold text-dark mb-2">
            About Nima
          </Text>
          <Text className="text-[14px] text-gray-500 leading-relaxed mb-5">
            {guide.about}
          </Text>

          {/* Languages */}
          <Text className="text-[16px] font-bold text-dark mb-3">
            Languages
          </Text>
          <View className="flex-row gap-2.5 mb-5 flex-wrap">
            {guide.languages.map((lang) => (
              <LanguageChip key={lang} colors={colors} label={lang} />
            ))}
          </View>

          {/* Top Experiences */}
          <SectionHeader
            title="Top Experiences"
            colors={colors}
            onViewAll={() => {}}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TOP_EXPERIENCES.map((exp) => (
              <TopExpCard key={exp.id} item={exp} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="bg-white border-t border-gray-100 px-4 pt-3 pb-3"
        style={{ elevation: 10 }}
      >
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center bg-secondary py-3.5 rounded-2xl gap-1.5"
            activeOpacity={0.85}
          >
            <Text className="text-base">💬</Text>
            <Text className="text-white font-bold text-[15px]">Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-[1.4] flex-row items-center justify-center bg-orange py-3.5 rounded-2xl gap-1.5"
            activeOpacity={0.85}
            onPress={() => {
              if (!primaryExperienceId) {
                return;
              }
              router.navigate({
                pathname: "/experience/booking/[id]",
                params: { id: primaryExperienceId },
              });
            }}
          >
            <Text className="text-base">📅</Text>
            <Text className="text-white font-bold text-[15px]">
              Book with Nima
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center mt-2.5 gap-1.5">
          <Text className="text-sm">🛡️</Text>
          <Text className="text-[13px] text-gray-400">
            Verified Guide • Safe & Trusted
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
