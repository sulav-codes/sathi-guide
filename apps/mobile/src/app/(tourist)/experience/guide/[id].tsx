import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { LanguageChip } from "@/components/LanguageChip";
import { SectionHeader } from "@/components/SectionHeader";
import { StarRating } from "@/components/StarRating";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ExperienceListItem } from "@/types/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGuide } from "@/hooks/use-guides";
import { useExperiences } from "@/hooks/use-experiences";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { IconSymbolName } from "@/types";

const StatItem = ({
  icon,
  value,
  label,
  colors,
}: {
  icon: IconSymbolName;
  value: string;
  label: string;
  colors: typeof Colors.light;
}) => (
  <View className="flex-1 items-center">
    <IconSymbol name={icon} size={24} color={colors.textSecondary} />
    <Text className="text-[16px] font-extrabold text-dark mt-1">{value}</Text>
    <Text className="text-[11px] text-gray-400 mt-0.5 text-center">
      {label}
    </Text>
  </View>
);

const TopExpCard = ({ item }: { item: ExperienceListItem }) => (
  <TouchableOpacity
    className="w-32 bg-white rounded-xl overflow-hidden mr-3"
    activeOpacity={0.85}
    style={{ elevation: 3 }}
    onPress={() => router.navigate({
      pathname: "/experience/[id]",
      params: { id: item.id },
    })}
  >
    <Image
      source={{ uri: item.coverImage?.url || "https://placehold.co/400x300/png" }}
      className="w-full h-[90px]"
      resizeMode="cover"
    />
    <View className="p-2">
      <Text className="text-[12px] font-semibold text-dark" numberOfLines={2}>
        {item.title}
      </Text>
      <View className="mt-1">
        <StarRating rating={parseFloat(item.averageRating || "0")} reviews={item.totalReviews || 0} size="sm" />
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
  
  const { data: guide, isLoading, error } = useGuide(guideId || "");
  const { data: experiencesData } = useExperiences(guideId ? { guideId } : undefined);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !guide) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-lg font-bold text-dark mb-2">
            Guide not found
          </Text>
          <Text className="text-sm text-gray-500 text-center mb-4">
            We could not find this guide or there was an error loading it.
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

  const primaryExperienceId = experiencesData?.items?.[0]?.id;
  const avatarUrl = getMediaUrl(guide.user.avatarId) || "https://placehold.co/100x100/png";

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
              <IconSymbol name="chevron.left" size={20} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-white/90 items-center justify-center"
              activeOpacity={0.8}
            >
              <IconSymbol name="share" size={20} color="#374151" />
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
              source={{ uri: avatarUrl }}
              className="w-[90px] h-[90px] rounded-full"
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Info */}
        <View className="px-4 pt-14 pb-4">
          <View className="flex-row items-center justify-center gap-1.5 mb-1">
            <Text className="text-[22px] font-extrabold text-dark">
              {guide.displayName || guide.fullName}
            </Text>
            {guide.currentVerificationStatus === "APPROVED" && (
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.green} />
            )}
          </View>
          <Text className="text-[14px] text-gray-400 text-center mb-4">
            Guide
          </Text>

          {/* Stats */}
          <View className="flex-row items-center bg-gray-50 rounded-2xl py-3.5 mb-5">
            <StatItem
              icon="star.fill"
              value={guide.averageRating}
              label={`(${guide.totalReviews} reviews)`}
              colors={colors}
            />
            <View className="w-px h-10 bg-gray-200" />
            <StatItem
              icon="person.3.fill"
              value={`${guide.totalTripsCompleted}`}
              label="Trips Completed"
              colors={colors}
            />
            <View className="w-px h-10 bg-gray-200" />
            <StatItem
              icon="shield.fill"
              value={`${guide.experienceYears}`}
              label="Years Experience"
              colors={colors}
            />
          </View>

          {/* About */}
          <Text className="text-[16px] font-bold text-dark mb-2">
            About {guide.displayName || guide.fullName.split(" ")[0]}
          </Text>
          <Text className="text-[14px] text-gray-500 leading-relaxed mb-5">
            {guide.bio || "This guide hasn't written a bio yet."}
          </Text>

          {/* Languages */}
          {guide.languagesSpoken && guide.languagesSpoken.length > 0 && (
            <>
              <Text className="text-[16px] font-bold text-dark mb-3">
                Languages
              </Text>
              <View className="flex-row gap-2.5 mb-5 flex-wrap">
                {guide.languagesSpoken.map((lang) => (
                  <LanguageChip key={lang} colors={colors} label={lang} />
                ))}
              </View>
            </>
          )}

          {/* Top Experiences */}
          {experiencesData?.items && experiencesData.items.length > 0 && (
            <>
              <SectionHeader
                title="Experiences by Guide"
                colors={colors}
                onViewAll={() => {}}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {experiencesData.items.map((exp) => (
                  <TopExpCard key={exp.id} item={exp} />
                ))}
              </ScrollView>
            </>
          )}
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
            <IconSymbol name="message.fill" size={18} color="#fff" />
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
            <IconSymbol name="calendar" size={18} color="#fff" />
            <Text className="text-white font-bold text-[15px]">
              Book with {guide.displayName || guide.fullName.split(" ")[0]}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center mt-2.5 gap-1.5">
          <IconSymbol name="shield.fill" size={14} color={colors.textSecondary} />
          <Text className="text-[13px] text-gray-400">
            Verified Guide • Safe & Trusted
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
