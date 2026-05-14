import { CategoryItem } from "@/components/CategoryItem";
import { ExperienceCard } from "@/components/ExperienceCard";
import { SectionHeader } from "@/components/SectionHeader";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CATEGORIES, EXPERIENCES } from "@/data";
import { router } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.categoryBackground }}>
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
          <IconSymbol size={28} name="line.3.horizontal" color={colors.textMuted} />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={{ width: 42, height: 42 }}
            resizeMode="contain"
          />
          <ThemedText style={{ fontSize: 20, fontWeight: "800" }}>
            <ThemedText
              style={{ fontSize: 20, fontWeight: "800", color: colors.primary }}
            >
              Sathi
            </ThemedText>
            <ThemedText
              style={{
                fontSize: 20,
                fontWeight: "800",
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
            resizeMode="cover"
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
              onPress={() => {}}
            />
          ))}
        </ScrollView>

        {/* Popular Experiences */}
        <View style={{ paddingHorizontal: 16, marginTop: 20 }}>
          <SectionHeader
            title="Popular Experiences"
            colors={colors}
            onViewAll={() => {}}
          />
          {EXPERIENCES.map((item) => (
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
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
