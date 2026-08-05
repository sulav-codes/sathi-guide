import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary pt-8 pb-16 px-6 items-center">
          <View className="relative mb-4">
            <Image
              source={{
                uri:
                  user?.avatarId ||
                  "https://placehold.co/150x150/png",
              }}
              className="w-24 h-24 rounded-full border-4 border-white/20"
            />
            <TouchableOpacity
              className="absolute bottom-0 right-0 bg-white w-8 h-8 rounded-full items-center justify-center"
              style={{ elevation: 4 }}
            >
              <IconSymbol name="plus" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-bold text-white mb-1">
            {user?.email.split("@")[0]}
          </Text>
          <Text className="text-white/80 text-sm">
            {user?.role === "TOURIST" ? "Tourist" : "Guide"}
          </Text>
          <View className="flex-row gap-2 mt-3">
            {/* Identity Verified Badge - We assume verified if isEmailVerified for now, backend could provide more specific KYC field */}
            {user?.isEmailVerified && (
              <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full">
                <IconSymbol name="checkmark.shield.fill" size={12} color="#10B981" />
                <Text className="text-white text-xs font-semibold ml-1">Identity Verified</Text>
              </View>
            )}
            {/* Licensed Guide Badge - Add when applicable */}
            {user?.role === "GUIDE" && (
              <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full">
                <IconSymbol name="star.fill" size={12} color="#F59E0B" />
                <Text className="text-white text-xs font-semibold ml-1">Licensed Guide</Text>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View className="px-4 -mt-8">
          <View
            className="rounded-2xl p-2"
            style={{ backgroundColor: colors.card, elevation: 2 }}
          >
            {/* Account Settings */}
            <TouchableOpacity
              className="flex-row items-center p-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={() => router.push("/(shared)/settings")}
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
                  Update your name, email, and phone
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity
              className="flex-row items-center p-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={() => router.push("/(shared)/notifications")}
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
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            {/* KYC Verification */}
            <TouchableOpacity
              className="flex-row items-center p-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={() => router.push("/(shared)/verification/kyc")}
            >
              <View className="w-10 h-10 rounded-full bg-green-500/10 items-center justify-center mr-3">
                <IconSymbol name="person.crop.circle.badge.checkmark" size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text }}
                >
                  Identity Verification (KYC)
                </Text>
                <Text
                  className="text-xs"
                  style={{ color: colors.textSecondary }}
                >
                  Compulsory for all users
                </Text>
              </View>
              {user?.isEmailVerified ? (
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={20}
                  color="#10B981"
                />
              ) : (
                <IconSymbol
                  name="chevron.right"
                  size={20}
                  color={colors.textMuted}
                />
              )}
            </TouchableOpacity>

            {/* Guide License Verification */}
            {user?.role === "GUIDE" && (
              <TouchableOpacity
                className="flex-row items-center p-3"
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
                    Upload tour guide license (Optional)
                  </Text>
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={20}
                  color={colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Preferences */}
          <Text
            className="text-sm font-bold uppercase mt-6 mb-2 px-2"
            style={{ color: colors.textMuted }}
          >
            Preferences
          </Text>
          <View
            className="rounded-2xl p-2"
            style={{ backgroundColor: colors.card, elevation: 2 }}
          >
            <TouchableOpacity
              className="flex-row items-center p-3 border-b"
              style={{ borderBottomColor: colors.border }}
              onPress={() => router.push("/(shared)/settings")}
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
              <Text
                className="text-sm mr-2"
                style={{ color: colors.textSecondary }}
              >
                English
              </Text>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-3"
              onPress={() => router.push("/(shared)/settings")}
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
              <Text
                className="text-sm mr-2"
                style={{ color: colors.textSecondary }}
              >
                NPR
              </Text>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
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