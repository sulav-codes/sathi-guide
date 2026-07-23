import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useMyExperiences, useDeleteExperience } from "@/hooks/use-experiences";
import { getMediaUrl } from "@/lib/media";
import { StarRating } from "@/components/StarRating";

export default function MyExperiencesScreen() {
  const { tab } = useLocalSearchParams<{ tab?: "ACTIVE" | "DRAFTS" | "INACTIVE" }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { data, isLoading, refetch, isRefetching } = useMyExperiences();
  const deleteExperience = useDeleteExperience();
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "DRAFTS" | "INACTIVE">(tab || "ACTIVE");

  const filteredData = data?.items?.filter((item) => {
    if (activeTab === "ACTIVE") return item.status === "PUBLISHED";
    if (activeTab === "DRAFTS") return ["DRAFT", "PENDING_REVIEW", "REJECTED"].includes(item.status);
    if (activeTab === "INACTIVE") return item.status === "ARCHIVED";
    return true;
  });

  const activeCount = data?.items?.filter((i) => i.status === "PUBLISHED").length || 0;
  const draftCount = data?.items?.filter((i) => ["DRAFT", "PENDING_REVIEW", "REJECTED"].includes(i.status)).length || 0;
  const inactiveCount = data?.items?.filter((i) => i.status === "ARCHIVED").length || 0;

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete Experience",
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteExperience.mutate(id, {
              onError: (err: any) => Alert.alert("Error", err?.message || "Failed to delete experience"),
            }),
        },
      ]
    );
  };

  const getStatusStyle = (status: string) => {
    if (status === "PUBLISHED") return { bg: "#10B98120", text: "#10B981" };
    if (status === "DRAFT") return { bg: "#F59E0B20", text: "#F59E0B" };
    if (status === "ARCHIVED") return { bg: "#6B728020", text: "#6B7280" };
    return { bg: "#6B728020", text: "#6B7280" };
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>
            My Experiences
          </Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-1 bg-primary px-3 py-2 rounded-xl"
          onPress={() => router.navigate("/(guide)/experiences/create" as any)}
        >
          <IconSymbol name="plus" size={16} color="#fff" />
          <Text className="text-white font-semibold text-sm">Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Controls */}
      <View className="px-5 mb-4">
        <View className="flex-row rounded-xl p-1" style={{ backgroundColor: colors.border }}>
          <TouchableOpacity
            className="flex-1 py-2 items-center rounded-lg"
            style={{ backgroundColor: activeTab === "ACTIVE" ? colors.card : "transparent" }}
            onPress={() => setActiveTab("ACTIVE")}
          >
            <Text className="text-[13px] font-bold" style={{ color: activeTab === "ACTIVE" ? colors.primary : colors.textMuted }}>
              Active ({activeCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2 items-center rounded-lg"
            style={{ backgroundColor: activeTab === "DRAFTS" ? colors.card : "transparent" }}
            onPress={() => setActiveTab("DRAFTS")}
          >
            <Text className="text-[13px] font-bold" style={{ color: activeTab === "DRAFTS" ? colors.primary : colors.textMuted }}>
              Drafts ({draftCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 py-2 items-center rounded-lg"
            style={{ backgroundColor: activeTab === "INACTIVE" ? colors.card : "transparent" }}
            onPress={() => setActiveTab("INACTIVE")}
          >
            <Text className="text-[13px] font-bold" style={{ color: activeTab === "INACTIVE" ? colors.primary : colors.textMuted }}>
              Inactive ({inactiveCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />
          }
        >
          {(!filteredData || filteredData.length === 0) ? (
            <View className="items-center py-24 px-8">
              <IconSymbol name="building.columns.fill" size={64} color={colors.textMuted} />
              <Text className="text-lg font-bold mt-4 text-center" style={{ color: colors.text }}>
                No Experiences Found
              </Text>
              <Text className="text-sm mt-2 text-center" style={{ color: colors.textMuted }}>
                You don&apos;t have any experiences in this category.
              </Text>
              {activeTab === "ACTIVE" && (
                <TouchableOpacity
                  className="mt-6 bg-primary px-8 py-3 rounded-2xl"
                  onPress={() => router.navigate("/(guide)/experiences/create" as any)}
                >
                  <Text className="text-white font-bold">Create Experience</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredData.map((experience) => {
              const statusStyle = getStatusStyle(experience.status);
              return (
                <TouchableOpacity
                  key={experience.id}
                  className="rounded-2xl mb-3 overflow-hidden"
                  style={{ backgroundColor: colors.card, elevation: 2, borderWidth: 1, borderColor: colors.border }}
                  activeOpacity={0.85}
                  onPress={() => router.navigate({
                    pathname: "/(guide)/experiences/edit" as any,
                    params: { id: experience.id },
                  })}
                >
                  <View className="flex-row">
                    <Image
                      source={{ uri: getMediaUrl(experience.coverImageId) || "https://placehold.co/120x120/png" }}
                      className="w-28 h-full"
                      resizeMode="cover"
                      style={{ minHeight: 100 }}
                    />
                    <View className="flex-1 p-3">
                      <View className="flex-row justify-between items-start">
                        <Text className="text-[13px] font-bold flex-1 mr-2" style={{ color: colors.text }} numberOfLines={2}>
                          {experience.title}
                        </Text>
                        <View className="px-2 py-0.5 rounded" style={{ backgroundColor: statusStyle.bg }}>
                          <Text className="text-[10px] font-bold" style={{ color: statusStyle.text }}>
                            {experience.status}
                          </Text>
                        </View>
                      </View>

                      <View className="mt-1.5">
                        <StarRating
                          rating={parseFloat(experience.averageRating || "0")}
                          reviews={experience.totalReviews || 0}
                          size="sm"
                        />
                      </View>

                      <View className="flex-row items-center gap-1 mt-1">
                        <IconSymbol name="tag" size={12} color={colors.textSecondary} />
                        <Text className="text-xs font-bold" style={{ color: colors.green }}>
                          {experience.currency} {experience.basePrice}
                        </Text>
                        <Text className="text-xs" style={{ color: colors.textMuted }}>/person</Text>
                      </View>

                      <View className="flex-row items-center gap-2 mt-2">
                        <TouchableOpacity
                          className="flex-row items-center gap-1 border border-primary px-2.5 py-1 rounded-lg"
                          onPress={() => router.navigate({
                            pathname: "/(guide)/experiences/edit" as any,
                            params: { id: experience.id },
                          })}
                        >
                          <IconSymbol name="globe" size={12} color={colors.primary} />
                          <Text className="text-xs font-semibold" style={{ color: colors.primary }}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="flex-row items-center gap-1 border border-red-300 px-2.5 py-1 rounded-lg"
                          onPress={() => handleDelete(experience.id, experience.title)}
                        >
                          <IconSymbol name="trash" size={12} color="#EF4444" />
                          <Text className="text-xs font-semibold text-red-500">Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}