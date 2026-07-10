import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-4 flex-row items-center gap-3 border-b" style={{ borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Notifications
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        
        <View className="items-center py-20 px-8">
          <View className="w-24 h-24 rounded-full items-center justify-center mb-6" style={{ backgroundColor: `${colors.text}05` }}>
            <IconSymbol name="bell.slash.fill" size={48} color={colors.textMuted} />
          </View>
          <Text className="text-lg font-bold mt-4 text-center" style={{ color: colors.text }}>
            No Notifications Yet
          </Text>
          <Text className="text-sm mt-2 text-center" style={{ color: colors.textSecondary }}>
            When you receive updates about your bookings or account, they will appear here.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}