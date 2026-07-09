import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useMyGuideProfile } from "@/hooks/use-guides";

export default function VerificationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { data: profile, isLoading } = useMyGuideProfile();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const status = profile?.currentVerificationStatus || "UNVERIFIED";

  const getStatusDisplay = () => {
    switch (status) {
      case "APPROVED":
        return { icon: "checkmark.seal.fill" as const, color: "#10B981", text: "Verified", description: "Your profile is verified. You can now receive booking requests." };
      case "PENDING":
        return { icon: "clock" as const, color: "#F59E0B", text: "Pending Review", description: "Your documents are currently under review by our team." };
      case "REJECTED":
        return { icon: "xmark.seal.fill" as const, color: "#EF4444", text: "Action Required", description: "Your verification was rejected. Please update your documents." };
      default:
        return { icon: "shield.lefthalf.filled" as const, color: "#6B7280", text: "Unverified", description: "Complete verification to build trust and receive bookings." };
    }
  };

  const display = getStatusDisplay();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="px-5 pt-4 pb-2 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-2xl font-extrabold" style={{ color: colors.text }}>
          Verification
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        
        <View className="items-center py-10 bg-white rounded-3xl mb-6" style={{ elevation: 2, borderWidth: 1, borderColor: colors.border }}>
          <View className="w-24 h-24 rounded-full items-center justify-center mb-4" style={{ backgroundColor: `${display.color}15` }}>
            <IconSymbol name={display.icon} size={48} color={display.color} />
          </View>
          <Text className="text-2xl font-bold mb-2" style={{ color: display.color }}>{display.text}</Text>
          <Text className="text-center px-6 text-sm" style={{ color: colors.textSecondary }}>{display.description}</Text>
        </View>

        <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>Required Documents</Text>

        <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between" style={{ borderWidth: 1, borderColor: colors.border }}>
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center mr-3">
              <IconSymbol name="person.text.rectangle" size={20} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-sm font-bold text-dark">Identity Document</Text>
              <Text className="text-xs text-gray-500">Passport, Citizenship or License</Text>
            </View>
          </View>
          {status === "APPROVED" ? (
            <IconSymbol name="checkmark.circle.fill" size={24} color="#10B981" />
          ) : (
            <TouchableOpacity className="bg-gray-100 px-3 py-1.5 rounded-lg">
              <Text className="text-xs font-semibold text-gray-700">Upload</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center justify-between" style={{ borderWidth: 1, borderColor: colors.border }}>
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full bg-purple-50 items-center justify-center mr-3">
              <IconSymbol name="doc.text.fill" size={20} color="#8B5CF6" />
            </View>
            <View>
              <Text className="text-sm font-bold text-dark">Guide License</Text>
              <Text className="text-xs text-gray-500">Official tourist guide license</Text>
            </View>
          </View>
          {status === "APPROVED" ? (
            <IconSymbol name="checkmark.circle.fill" size={24} color="#10B981" />
          ) : (
            <TouchableOpacity className="bg-gray-100 px-3 py-1.5 rounded-lg">
              <Text className="text-xs font-semibold text-gray-700">Upload</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
