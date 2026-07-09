import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getMediaUrl } from "@/lib/media";

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
              source={{ uri: getMediaUrl(user?.avatarId || null) || "https://placehold.co/150x150/png" }}
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
            {user?.email.split('@')[0]}
          </Text>
          <Text className="text-white/80 text-sm">
            {user?.role === "TOURIST" ? "Tourist" : "Guide"}
          </Text>
        </View>

        {/* Content */}
        <View className="px-4 -mt-8">
          <View className="bg-white rounded-2xl p-2" style={{ elevation: 2 }}>
            
            {/* Account Settings */}
            <TouchableOpacity className="flex-row items-center p-3 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
                <IconSymbol name="person.fill" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-dark">Personal Info</Text>
                <Text className="text-xs text-gray-500">Update your name, email, and phone</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity className="flex-row items-center p-3 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-amber-50 items-center justify-center mr-3">
                <IconSymbol name="bell.fill" size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-dark">Notifications</Text>
                <Text className="text-xs text-gray-500">Manage your alerts and emails</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Verification */}
            <TouchableOpacity className="flex-row items-center p-3">
              <View className="w-10 h-10 rounded-full bg-green-50 items-center justify-center mr-3">
                <IconSymbol name="shield.fill" size={20} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-dark">Account Verification</Text>
                <Text className="text-xs text-gray-500">Verified users get more trust</Text>
              </View>
              {user?.isEmailVerified ? (
                <IconSymbol name="checkmark.circle.fill" size={20} color="#10B981" />
              ) : (
                <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>

          {/* Preferences */}
          <Text className="text-sm font-bold text-gray-400 uppercase mt-6 mb-2 px-2">Preferences</Text>
          <View className="bg-white rounded-2xl p-2" style={{ elevation: 2 }}>
            <TouchableOpacity className="flex-row items-center p-3 border-b border-gray-100">
              <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3">
                <IconSymbol name="globe" size={20} color={colors.textSecondary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-dark">Language</Text>
              </View>
              <Text className="text-sm text-gray-500 mr-2">English</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center p-3">
              <View className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center mr-3">
                <IconSymbol name="tag" size={20} color={colors.textSecondary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-dark">Currency</Text>
              </View>
              <Text className="text-sm text-gray-500 mr-2">NPR</Text>
              <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            className="mt-8 bg-red-50 py-4 rounded-xl flex-row justify-center items-center gap-2 mb-10"
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
