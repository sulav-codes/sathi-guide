import { router, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Text,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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
  <View style={{ flex: 1, alignItems: "center" }}>
    <IconSymbol name={icon} size={24} color={colors.textSecondary} />
    <ThemedText style={{ fontSize: 16, fontWeight: "800", marginTop: 4 }}>{value}</ThemedText>
    <ThemedText type="muted" style={{ fontSize: 11, marginTop: 2, textAlign: "center" }}>
      {label}
    </ThemedText>
  </View>
);

const TopExpCard = ({ item, colors }: { item: ExperienceListItem; colors: typeof Colors.light }) => (
  <TouchableOpacity
    style={{ width: 128, backgroundColor: colors.card, borderRadius: 12, overflow: "hidden", marginRight: 12, elevation: 3 }}
    activeOpacity={0.85}
    onPress={() =>
      router.navigate({
        pathname: "/experience/[id]",
        params: { id: item.id },
      })
    }
  >
    <Image
      source={{
        uri: item.coverImage?.url || "https://placehold.co/400x300/png",
      }}
      style={{ width: "100%", height: 90 }}
      resizeMode="cover"
    />
    <View style={{ padding: 8 }}>
      <ThemedText style={{ fontSize: 12, fontWeight: "600" }} numberOfLines={2}>
        {item.title}
      </ThemedText>
      <View style={{ marginTop: 4 }}>
        <StarRating
          rating={parseFloat(item.averageRating || "0")}
          reviews={item.totalReviews || 0}
          size="sm"
        />
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
  const { data: experiencesData } = useExperiences(
    guideId ? { guideId } : undefined,
  );

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

  if (error || !guide) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24, backgroundColor: "transparent" }}>
          <ThemedText type="title" style={{ marginBottom: 8, textAlign: "center" }}>
            Guide not found
          </ThemedText>
          <ThemedText type="muted" style={{ textAlign: "center", marginBottom: 16 }}>
            We could not find this guide or there was an error loading it.
          </ThemedText>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <ThemedText style={{ color: "white", fontWeight: "600" }}>Go Back</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const primaryExperienceId = experiencesData?.items?.[0]?.id;
  // avatarUrl is exposed directly on GuideDetailResponseDto, not nested under guide.user
  const avatarUrl = guide.avatarUrl || "https://placehold.co/100x100/png";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
        <View style={{ paddingHorizontal: 16, paddingTop: 56, paddingBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 4 }}>
            <ThemedText style={{ fontSize: 22, fontWeight: "800" }}>
              {guide.displayName || guide.fullName}
            </ThemedText>
            {guide.currentVerificationStatus === "APPROVED" && (
              <IconSymbol
                name="checkmark.circle.fill"
                size={20}
                color={colors.green}
              />
            )}
          </View>
          <ThemedText type="muted" style={{ textAlign: "center", marginBottom: 16 }}>
            Guide
          </ThemedText>

          {/* Stats */}
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: 16, paddingVertical: 14, marginBottom: 20 }}>
            <StatItem
              icon="star.fill"
              value={guide.averageRating}
              label={`(${guide.totalReviews} reviews)`}
              colors={colors}
            />
            <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />
            <StatItem
              icon="person.3.fill"
              value={`${guide.totalTripsCompleted}`}
              label="Trips Completed"
              colors={colors}
            />
            <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />
            <StatItem
              icon="shield.fill"
              value={`${guide.experienceYears}`}
              label="Years Experience"
              colors={colors}
            />
          </View>

          {/* About */}
          <ThemedText style={{ fontSize: 16, fontWeight: "700", marginBottom: 8 }}>
            About {guide.displayName || guide.fullName.split(" ")[0]}
          </ThemedText>
          <ThemedText type="muted" style={{ lineHeight: 22, marginBottom: 20 }}>
            {guide.bio || "This guide hasn't written a bio yet."}
          </ThemedText>

          {/* Languages */}
          {guide.languagesSpoken && guide.languagesSpoken.length > 0 && (
            <>
              <ThemedText style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
                Languages
              </ThemedText>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
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
                  <TopExpCard key={exp.id} item={exp} colors={colors} />
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </ScrollView>

      {/* Footer */}
      <ThemedView
        style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, elevation: 10 }}
      >
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.secondary, paddingVertical: 14, borderRadius: 16, gap: 6 }}
            activeOpacity={0.85}
          >
            <IconSymbol name="message.fill" size={18} color="#fff" />
            <ThemedText style={{ color: "white", fontWeight: "700", fontSize: 15 }}>Message</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ flex: 1.4, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 16, gap: 6 }}
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
            <ThemedText style={{ color: "white", fontWeight: "700", fontSize: 15 }}>
              Book with {guide.displayName || guide.fullName.split(" ")[0]}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 10, gap: 6 }}>
          <IconSymbol
            name="shield.fill"
            size={14}
            color={colors.textSecondary}
          />
          <ThemedText type="muted" style={{ fontSize: 13 }}>
            Verified Guide • Safe & Trusted
          </ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}
