import { CategoryItem } from "@/components/CategoryItem";
import { ExperienceCard } from "@/components/ExperienceCard";
import { ExperienceCardSkeleton } from "@/components/ExperienceCardSkeleton";
import { SectionHeader } from "@/components/SectionHeader";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CATEGORIES } from "@/data";
import { useExperiences } from "@/hooks/use-experiences";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const logoTextStyle = { fontSize: 22, fontFamily: "Poppins-Bold" };

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const { data: experiences, isLoading, error } = useExperiences({
    ...(searchQuery ? { location: searchQuery } : {}),
    ...(categoryFilter ? { categoryId: categoryFilter } : {}),
  });

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.categoryBackground }}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      {/* Header */}
      <ThemedView
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          elevation: 2,
        }}
      >
        <TouchableOpacity activeOpacity={0.7}>
          <IconSymbol
            size={28}
            name="line.3.horizontal"
            color={colors.textMuted}
          />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: 40, height: 40 }}
            contentFit="contain"
          />
          <ThemedText style={[logoTextStyle, { marginTop: 4 }]}>
            <ThemedText style={[logoTextStyle, { color: colors.primary }]}>
              Sathi
            </ThemedText>
            <ThemedText
              style={{
                ...logoTextStyle,
                color: colors.secondary,
              }}
            >
              Guide
            </ThemedText>
          </ThemedText>
        </View>

        <TouchableOpacity activeOpacity={0.7}>
          <IconSymbol size={28} name="bell.fill" color={colors.textMuted} />
        </TouchableOpacity>
      </ThemedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Hero Banner */}
        <View
          style={{
            height: 180,
            overflow: "hidden",
          }}
        >
          <Image
            source={require("@/assets/images/hero-banner.png")}
            style={{ width: "100%", height: "100%", position: "absolute" }}
            contentFit="cover"
          />
          <View
            style={{
              flex: 1,
              backgroundColor: colors.heroOverlay,
              padding: 20,
              justifyContent: "center",
            }}
          >
            <ThemedText
              style={{
                fontSize: 26,
                fontWeight: "800",
                color: "#fff",
                marginTop: 40,
              }}
            >
              Namaste! 👋
            </ThemedText>
            <ThemedText style={{ fontSize: 15, color: "#fff", marginTop: 2 }}>
              Find local guides.
            </ThemedText>
            <ThemedText style={{ fontSize: 15, color: "#fff" }}>
              Live authentic Nepal.
            </ThemedText>

            {/* Search Bar */}
            <ThemedView
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 12,
                paddingHorizontal: 12,
                borderWidth: 1,
                marginVertical: 8,
                borderColor: colors.border,
                elevation: 2,
              }}
            >
              <IconSymbol
                name="magnifyingglass"
                size={20}
                color={colors.textMuted}
                style={{ marginRight: 4 }}
              />
              <TextInput
                placeholder="Search experiences, places..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.text,
                }}
              />
            </ThemedView>
          </View>
        </View>

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16, borderRadius: 12 }}
          contentContainerStyle={{ paddingHorizontal: 8, gap: 6 }}
        >
          {CATEGORIES.map((cat) => (
            <CategoryItem
              key={cat.id}
              item={cat}
              colors={colors}
              onPress={() => setCategoryFilter(cat.label === "All" ? "" : cat.id)}
            />
          ))}
        </ScrollView>

        {/* Popular Experiences */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <SectionHeader
            title="Experiences"
            colors={colors}
            onViewAll={() => {}}
          />
          {isLoading ? (
            <View>
              {[1, 2, 3, 4, 5].map((key) => (
                <ExperienceCardSkeleton key={key} colors={colors} />
              ))}
            </View>
          ) : error ? (
            <ThemedText style={{ color: colors.secondary, padding: 10 }}>
              Failed to load experiences.
            </ThemedText>
          ) : !experiences?.items?.length ? (
            <ThemedText style={{ color: colors.textMuted, padding: 10, textAlign: "center" }}>
              No experiences found.
            </ThemedText>
          ) : (
            experiences?.items.map((item) => (
              <ExperienceCard
                key={item.id}
                item={item}
                colors={colors}
                onPress={() =>
                  router.navigate({
                    pathname: "/experience/[id]",
                    params: { id: item.id },
                  })
                }
                onFavorite={() => {}}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
