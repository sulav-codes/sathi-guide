import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/theme";
import { useThemeContext } from "@/context/ThemeContext";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import { pickAndUploadImage } from "@/lib/upload";
import { useUserProfile, useUpdateAvatar } from "@/hooks/use-user-profile";

export default function GuideProfileScreen() {
  const { colorScheme, theme, setTheme } = useThemeContext();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { user, logout } = useAuth();
  const { data: profileData } = useUserProfile();
  const updateAvatarMutation = useUpdateAvatar();

  const handleLogout = async () => {
    await logout();
  };

  const pickImage = async () => {
    try {
      const result = await pickAndUploadImage({
        purpose: "AVATAR",
        onProgress: (phase) => {
          if (__DEV__) console.log("[avatar upload] phase:", phase);
        },
      });

      // User cancelled the picker
      if (!result) return;

      updateAvatarMutation.mutate(result.mediaId, {
        onSuccess: () => Alert.alert("Success", "Avatar updated successfully"),
        onError: () => Alert.alert("Error", "Failed to update avatar"),
      });
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.message ?? "An error occurred while uploading the image",
      );
      console.error("[avatar upload]", err);
    }
  };

  const displayName =
    profileData?.guideProfile?.fullName || user?.email.split("@")[0] || "User";
  const bio = profileData?.guideProfile?.bio;
  const rating = profileData?.guideProfile?.rating || 0;
  const reviewCount = profileData?.guideProfile?.reviewCount || 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary pt-8 pb-16 px-6 items-center">
          <View className="relative mb-4">
            <Image
              source={{
                uri:
                  profileData?.avatarId ||
                  user?.avatarId ||
                  "https://placehold.co/150x150/png",
              }}
              className="w-24 h-24 rounded-full border-4 border-white/20"
            />
            <TouchableOpacity
              onPress={pickImage}
              disabled={updateAvatarMutation.isPending}
              className="absolute bottom-0 right-0 bg-white w-8 h-8 rounded-full items-center justify-center"
              style={{ elevation: 4 }}
            >
              {updateAvatarMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <IconSymbol
                  name="camera.fill"
                  size={14}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-white mb-1">
            {displayName}
          </Text>
          <Text className="text-white/80 text-sm">Guide</Text>
          {bio && (
            <Text className="text-white/90 text-sm text-center mt-2 px-4">
              {bio}
            </Text>
          )}

          <View className="flex-row gap-4 mt-4">
            <View className="items-center">
              <Text className="text-white font-bold text-base">
                {rating.toFixed(1)}
              </Text>
              <Text className="text-white/80 text-xs">Rating</Text>
            </View>
            <View className="w-px h-8 bg-white/20" />
            <View className="items-center">
              <Text className="text-white font-bold text-base">
                {reviewCount}
              </Text>
              <Text className="text-white/80 text-xs">Reviews</Text>
            </View>
          </View>

          <View className="flex-row gap-2 mt-4">
            {user?.isEmailVerified && (
              <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full">
                <IconSymbol
                  name="checkmark.shield.fill"
                  size={12}
                  color="#10B981"
                />
                <Text className="text-white text-xs font-semibold ml-1">
                  Identity Verified
                </Text>
              </View>
            )}
            <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full">
              <IconSymbol name="star.fill" size={12} color="#F59E0B" />
              <Text className="text-white text-xs font-semibold ml-1">
                Guide
              </Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 -mt-8">
          <View
            className="rounded-2xl p-2 mb-6"
            style={{ backgroundColor: colors.card, elevation: 2 }}
          >
            {/* Account Settings */}
            <TouchableOpacity
              className="flex-row items-center p-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={() => router.push("/(shared)/edit-profile")}
            >
              <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-3">
                <IconSymbol name="person.fill" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Personal Info
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Update your name, bio, and phone
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* My Experiences */}
            <TouchableOpacity
              className="flex-row items-center p-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={() => router.push("/(guide)/experiences/mine")}
            >
              <View className="w-10 h-10 rounded-full bg-purple-500/10 items-center justify-center mr-3">
                <IconSymbol name="list.bullet" size={20} color="#A855F7" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  My Experiences
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Manage your tours and availability
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Guide License */}
            <TouchableOpacity
              className="flex-row items-center p-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={() => router.push("/(shared)/verification/license")}
            >
              <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-3">
                <IconSymbol name="doc.text.fill" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Guide License
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Manage your tour guide license
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Notifications */}
            <View
              className="flex-row items-center p-3 opacity-40"
              pointerEvents="none"
            >
              <View className="w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center mr-3">
                <IconSymbol name="bell.fill" size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Notifications
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Manage your alerts and emails
                </Text>
              </View>
              <View className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                <Text
                  className="text-[10px]"
                  style={{ color: colors.textSecondary }}
                >
                  SOON
                </Text>
              </View>
            </View>
          </View>

          {/* Preferences */}
          <Text
            className="text-sm font-bold uppercase mb-2 px-2"
            style={{ color: colors.textMuted }}
          >
            Preferences
          </Text>
          <View
            className="rounded-2xl p-2"
            style={{ backgroundColor: colors.card, elevation: 2 }}
          >
            <View
              className="flex-row items-center p-3 border-b opacity-40"
              pointerEvents="none"
              style={{ borderBottomColor: colors.border }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.text}10` }}
              >
                <IconSymbol
                  name="globe"
                  size={20}
                  color={colors.textSecondary}
                />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Language
                </Text>
              </View>
              <View className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                <Text
                  className="text-[10px]"
                  style={{ color: colors.textSecondary }}
                >
                  SOON
                </Text>
              </View>
            </View>

            <View
              className="flex-row items-center p-3 border-b opacity-40"
              pointerEvents="none"
              style={{ borderBottomColor: colors.border }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{ backgroundColor: `${colors.text}10` }}
              >
                <IconSymbol name="tag" size={20} color={colors.textSecondary} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Currency
                </Text>
              </View>
              <View className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded mr-2">
                <Text
                  className="text-[10px]"
                  style={{ color: colors.textSecondary }}
                >
                  SOON
                </Text>
              </View>
            </View>

            <View className="p-3">
              <View className="flex-row items-center mb-4">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${colors.text}10` }}
                >
                  <IconSymbol
                    name="moon.fill"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.text }}
                  >
                    Appearance
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    Choose your preferred theme
                  </Text>
                </View>
              </View>

              <View
                className="flex-row rounded-lg p-1"
                style={{ backgroundColor: `${colors.text}10` }}
              >
                {(["light", "system", "dark"] as const).map((t) => {
                  const isActive = theme === t;
                  return (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setTheme(t)}
                      className="flex-1 items-center justify-center py-2 rounded-md"
                      style={{
                        backgroundColor: isActive ? colors.card : "transparent",
                        shadowColor: isActive ? "#000" : "transparent",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: isActive ? 0.1 : 0,
                        shadowRadius: 1,
                        elevation: isActive ? 2 : 0,
                      }}
                    >
                      <Text
                        className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}
                        style={{
                          color: isActive ? colors.text : colors.textMuted,
                        }}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            className="mt-8 py-4 rounded-xl flex-row justify-center items-center gap-2 mb-10 border border-red-500/30"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow.left" size={20} color="#EF4444" />
            <Text className="text-red-500 font-bold text-base">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
