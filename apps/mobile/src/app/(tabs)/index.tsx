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

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
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
          <ThemedText style={{ fontSize: 22 }}>☰</ThemedText>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <ThemedText style={{ fontSize: 22 }}>🏔️</ThemedText>
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
          <ThemedText style={{ fontSize: 22 }}>🔔</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        {/* Hero Banner */}
        <View
          style={{
            height: 160,
            marginHorizontal: 16,
            marginTop: 12,
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: "https://picsum.photos/seed/nepal/800/400" }}
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
              style={{ fontSize: 26, fontWeight: "800", color: "#fff" }}
            >
              Namaste! 👋
            </ThemedText>
            <ThemedText style={{ fontSize: 15, color: "#fff", marginTop: 4 }}>
              Find local guides.
            </ThemedText>
            <ThemedText style={{ fontSize: 15, color: "#fff" }}>
              Live authentic Nepal.
            </ThemedText>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ paddingHorizontal: 16, marginTop: 14 }}>
          <ThemedView
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: colors.border,
              elevation: 2,
            }}
          >
            <ThemedText style={{ fontSize: 16, marginRight: 8 }}>🔍</ThemedText>
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

        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 16 }}
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
