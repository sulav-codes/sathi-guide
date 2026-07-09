import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SectionHeader } from "@/components/SectionHeader";
import { StarRating } from "@/components/StarRating";
import { TagBadge } from "@/components/TagBadge";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExperience } from "@/hooks/use-experiences";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getMediaUrl } from "@/lib/media";

export default function ExperienceDetailScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];
  
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const experienceId = Array.isArray(id) ? id[0] : id;
  
  const { data: experience, isLoading, error } = useExperience(experienceId || "");

  if (isLoading) {
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
            We could not find this experience or there was an error loading it.
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

  const imageUrl = getMediaUrl(experience.coverImageId) || "https://placehold.co/800x600/png";
  
  const TAGS = [
    { icon: "clock", label: `${experience.durationHours} hrs` },
    ...(experience.difficulty ? [{ icon: "figure.walk", label: experience.difficulty }] : []),
    { icon: "person.3.fill", label: `${experience.minParticipants}–${experience.maxParticipants} people` },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="h-72 relative">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center">
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-white/90 items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={20} color="#374151" />
            </TouchableOpacity>
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                className="w-9 h-9 rounded-full bg-white/90 items-center justify-center"
                activeOpacity={0.8}
              >
                <IconSymbol name="heart" size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                className="w-9 h-9 rounded-full bg-white/90 items-center justify-center"
                activeOpacity={0.8}
              >
                <IconSymbol name="share" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-[22px] font-extrabold text-dark mb-2">
            {experience.title}
          </Text>

          <StarRating rating={parseFloat(experience.averageRating || "0")} reviews={experience.totalReviews || 0} />

          <View className="flex-row items-center gap-2 mt-2 mb-4">
            <IconSymbol name="map.fill" size={16} color={colors.textSecondary} />
            <Text className="text-sm text-gray-500">
              {experience.location.city}, {experience.location.country}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10 }}
            className="mb-4"
          >
            {TAGS.map((tag, i) => (
              <TagBadge
                key={i}
                // @ts-ignore - tag badge expects emoji but we'll use IconSymbol soon or string for now
                icon="" 
                label={tag.label}
                colors={colors}
              />
            ))}
          </ScrollView>

          <View className="h-px bg-gray-100 my-4" />

          {/* Guide Profile Link */}
          <TouchableOpacity 
            className="flex-row items-center p-3 bg-gray-50 rounded-xl"
            activeOpacity={0.7}
            onPress={() => router.navigate({
              pathname: "/experience/guide/[id]",
              params: { id: experience.guide.id },
            })}
          >
            <Image 
              source={{ uri: getMediaUrl(experience.guide.avatarUrl) || "https://placehold.co/100x100/png" }}
              className="w-12 h-12 rounded-full mr-3"
            />
            <View className="flex-1">
              <Text className="text-sm text-gray-500 font-medium">Guided by</Text>
              <Text className="text-base font-bold text-dark">{experience.guide.displayName || experience.guide.fullName}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View className="h-px bg-gray-100 my-4" />

          <SectionHeader title="About this experience" colors={colors} />
          <Text className="text-sm text-gray-500 leading-relaxed">
            {experience.description}
          </Text>

          {experience.inclusions && experience.inclusions.length > 0 && (
            <>
              <View className="h-px bg-gray-100 my-4" />
              <SectionHeader title="What's included" colors={colors} />
              <View className="flex-col gap-2">
                {experience.inclusions.map((item, i) => (
                  <View
                    key={i}
                    className="flex-row items-start gap-2"
                  >
                    <IconSymbol name="checkmark.circle.fill" size={18} color={colors.green} />
                    <Text className="text-[14px] text-gray-600 flex-1">{item}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {experience.exclusions && experience.exclusions.length > 0 && (
            <>
              <View className="h-px bg-gray-100 my-4" />
              <SectionHeader title="What's not included" colors={colors} />
              <View className="flex-col gap-2">
                {experience.exclusions.map((item, i) => (
                  <View
                    key={i}
                    className="flex-row items-start gap-2"
                  >
                    <IconSymbol name="xmark" size={18} color={colors.textSecondary} />
                    <Text className="text-[14px] text-gray-600 flex-1">{item}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        className="flex-row items-center justify-between px-4 py-3.5 border-t border-gray-100 bg-white"
        style={{ elevation: 6 }}
      >
        <View>
          <Text className="text-xs text-gray-400">From</Text>
          <Text className="text-[20px] font-extrabold text-dark">
            {experience.currency} {experience.basePrice}{" "}
            <Text className="text-[13px] font-normal text-gray-400">
              /person
            </Text>
          </Text>
        </View>
        <TouchableOpacity
          className="bg-orange px-8 py-3.5 rounded-2xl"
          activeOpacity={0.85}
          onPress={() =>
            router.navigate({
              pathname: "/experience/booking/[id]",
              params: { id: experience.id },
            })
          }
        >
          <Text className="text-white font-bold text-base">Book Now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
