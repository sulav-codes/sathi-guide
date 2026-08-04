import { router, useLocalSearchParams } from "expo-router";
import { Image, ScrollView, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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
        <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, backgroundColor: "transparent" }}>
          <ThemedText type="title" style={{ marginBottom: 8, textAlign: "center" }}>
            Experience not found
          </ThemedText>
          <ThemedText type="muted" style={{ textAlign: "center", marginBottom: 16 }}>
            We could not find this experience or there was an error loading it.
          </ThemedText>
          <TouchableOpacity
            className="bg-orange px-6 py-3 rounded-full"
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <ThemedText style={{ color: "white", fontWeight: "600" }}>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const imageUrl = experience.coverImage?.url || "https://placehold.co/800x600/png";
  
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
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", opacity: 0.9 }}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <IconSymbol name="chevron.left" size={20} color={colors.text} />
            </TouchableOpacity>
            <View className="flex-row gap-2.5">
              <TouchableOpacity
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", opacity: 0.9 }}
                activeOpacity={0.8}
              >
                <IconSymbol name="heart" size={20} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: "center", justifyContent: "center", opacity: 0.9 }}
                activeOpacity={0.8}
              >
                <IconSymbol name="share" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 pt-4 pb-6">
          <ThemedText type="title" style={{ marginBottom: 8 }}>
            {experience.title}
          </ThemedText>

          <StarRating rating={parseFloat(experience.averageRating || "0")} reviews={experience.totalReviews || 0} />

          <View className="flex-row items-center gap-2 mt-2 mb-4">
            <IconSymbol name="map.fill" size={16} color={colors.textSecondary} />
            <ThemedText type="muted">
              {experience.location.city}, {experience.location.country}
            </ThemedText>
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
                icon="" 
                label={tag.label}
                colors={colors}
              />
            ))}
          </ScrollView>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

          {/* Guide Profile Link */}
          <TouchableOpacity 
            style={{ flexDirection: "row", alignItems: "center", padding: 12, backgroundColor: colors.card, borderRadius: 12 }}
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
              <ThemedText type="muted" style={{ fontWeight: "500" }}>Guided by</ThemedText>
              <ThemedText type="subtitle">{experience.guide.displayName || experience.guide.fullName}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />

          <SectionHeader title="About this experience" colors={colors} />
          <ThemedText type="default" style={{ lineHeight: 22, color: colors.textSecondary }}>
            {experience.description}
          </ThemedText>

          {experience.inclusions && experience.inclusions.length > 0 && (
            <>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />
              <SectionHeader title="What's included" colors={colors} />
              <View className="flex-col gap-2">
                {experience.inclusions.map((item, i) => (
                  <View
                    key={i}
                    className="flex-row items-start gap-2"
                  >
                    <IconSymbol name="checkmark.circle.fill" size={18} color={colors.green} />
                    <ThemedText style={{ flex: 1 }}>{item}</ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}

          {experience.exclusions && experience.exclusions.length > 0 && (
            <>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />
              <SectionHeader title="What's not included" colors={colors} />
              <View className="flex-col gap-2">
                {experience.exclusions.map((item, i) => (
                  <View
                    key={i}
                    className="flex-row items-start gap-2"
                  >
                    <IconSymbol name="xmark" size={18} color={colors.textSecondary} />
                    <ThemedText style={{ flex: 1 }}>{item}</ThemedText>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <ThemedView
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.border, elevation: 6 }}
      >
        <View>
          <ThemedText type="muted">From</ThemedText>
          <ThemedText type="title" style={{ fontSize: 20 }}>
            {experience.currency} {experience.basePrice}{" "}
            <ThemedText type="muted" style={{ fontWeight: "400" }}>
              /person
            </ThemedText>
          </ThemedText>
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
          <ThemedText style={{ color: "white", fontWeight: "700", fontSize: 16 }}>Book Now</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}
