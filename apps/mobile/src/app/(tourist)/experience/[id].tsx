import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SectionHeader } from "@/components/SectionHeader";
import { StarRating } from "@/components/StarRating";
import { TagBadge } from "@/components/TagBadge";
import { Colors } from "@/constants/theme";
import { EXPERIENCES, INCLUSIONS } from "@/data";
import { useColorScheme } from "@/hooks/use-color-scheme";

const TAGS = [
  { icon: "🕐", label: "3–4 hrs" },
  { icon: "👟", label: "Walking Tour" },
  { icon: "🏛️", label: "Culture" },
  { icon: "👥", label: "Small Group\n2–8 people" },
];

export default function ExperienceDetailScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const experienceId = Array.isArray(id) ? id[0] : id;
  const experience = EXPERIENCES.find((e) => e.id === experienceId);

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
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="h-72 relative">
          <Image
            source={{ uri: experience.image }}
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute top-4 left-4 right-4 flex-row justify-between items-center">
            <TouchableOpacity
              className="w-9 h-9 rounded-full bg-white/90 items-center justify-center"
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text className="text-base font-bold text-gray-700">←</Text>
            </TouchableOpacity>
            <View className="flex-row gap-2.5">
              {["🤍", "⬆️"].map((icon, i) => (
                <TouchableOpacity
                  key={i}
                  className="w-9 h-9 rounded-full bg-white/90 items-center justify-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-base">{icon}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="absolute bottom-3 right-4 bg-black/55 px-2.5 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">1/8</Text>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 pt-4 pb-6">
          <Text className="text-[22px] font-extrabold text-dark mb-2">
            {experience.title}
          </Text>

          <StarRating rating={experience.rating} reviews={experience.reviews} />

          <View className="flex-row items-center gap-1 mt-2 mb-4">
            <Text className="text-sm">📍</Text>
            <Text className="text-sm text-gray-500">{experience.location}</Text>
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
                icon={tag.icon}
                label={tag.label}
                colors={colors}
              />
            ))}
          </ScrollView>

          <View className="h-px bg-gray-100 my-4" />

          <SectionHeader title="About this experience" colors={colors} />
          <Text className="text-sm text-gray-500 leading-relaxed">
            Explore the rich history and hidden stories of Kathmandu with a
            local guide. Visit ancient temples, local markets and UNESCO sites.
          </Text>
          <TouchableOpacity className="mt-1.5" activeOpacity={0.7}>
            <Text className="text-sm text-primary font-semibold">
              Read more
            </Text>
          </TouchableOpacity>

          <View className="h-px bg-gray-100 my-4" />

          <SectionHeader title="What's included" colors={colors} />
          <View className="flex-row flex-wrap gap-3">
            {INCLUSIONS.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center w-[45%] gap-1.5"
              >
                <Text className="text-sm">✅</Text>
                <Text className="text-[13px] text-gray-600">{item.label}</Text>
              </View>
            ))}
          </View>
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
            {experience.price}{" "}
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
