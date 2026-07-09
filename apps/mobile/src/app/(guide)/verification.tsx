import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="relative w-full h-64 overflow-hidden rounded-b-3xl">
        <Image
          source={require("@/assets/images/sathi_guide_header.png")}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/40" />
        <SafeAreaView className="flex-1">
          <View className="px-5 pt-2 flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <IconSymbol name="chevron.left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-2xl font-extrabold text-white">
              Verification
            </Text>
          </View>
          <View className="items-center justify-center flex-1 pb-6">
             <View className="w-20 h-20 rounded-full items-center justify-center mb-3" style={{ backgroundColor: `${display.color}25`, borderWidth: 2, borderColor: display.color }}>
                <IconSymbol name={display.icon} size={40} color={display.color} />
             </View>
             <Text className="text-xl font-bold mb-1" style={{ color: display.color }}>{display.text}</Text>
             <Text className="text-center px-8 text-sm text-white/90">{display.description}</Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

        <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>Required Documents</Text>

        <View className="rounded-2xl p-4 mb-3 flex-row items-center justify-between" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#3B82F615' }}>
              <IconSymbol name="person.text.rectangle" size={20} color="#3B82F6" />
            </View>
            <View>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>Identity Document</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Passport, Citizenship or License</Text>
            </View>
          </View>
          {status === "APPROVED" ? (
            <IconSymbol name="checkmark.circle.fill" size={24} color="#10B981" />
          ) : (
            <TouchableOpacity className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.border }}>
              <Text className="text-xs font-semibold" style={{ color: colors.text }}>Upload</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="rounded-2xl p-4 mb-3 flex-row items-center justify-between" style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }}>
          <View className="flex-row items-center flex-1">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: '#8B5CF615' }}>
              <IconSymbol name="doc.text.fill" size={20} color="#8B5CF6" />
            </View>
            <View>
              <Text className="text-sm font-bold" style={{ color: colors.text }}>Guide License</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Official tourist guide license</Text>
            </View>
          </View>
          {status === "APPROVED" ? (
            <IconSymbol name="checkmark.circle.fill" size={24} color="#10B981" />
          ) : (
            <TouchableOpacity className="px-3 py-1.5 rounded-lg" style={{ backgroundColor: colors.border }}>
              <Text className="text-xs font-semibold" style={{ color: colors.text }}>Upload</Text>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
