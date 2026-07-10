import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";

export default function VerificationStatusScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Mountain Banner Header */}
      <View className="relative h-60 w-full bg-blue-500 overflow-hidden rounded-b-3xl">
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop" }} 
          style={{ width: "100%", height: "100%", position: "absolute", opacity: 0.6 }}
          contentFit="cover"
        />
        <SafeAreaView className="flex-1">
          <View className="px-5 pt-2 flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center backdrop-blur-md"
            >
              <IconSymbol name="chevron.left" size={24} color="#FFF" />
            </TouchableOpacity>
            <View className="flex-1 items-center mr-10">
              <Text className="text-white font-bold text-xl">SathiGuide</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        className="flex-1 px-5 -mt-16" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View 
          className="rounded-3xl p-6 shadow-sm"
          style={{ backgroundColor: colors.card, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}
        >
          <View className="items-center mb-6">
            <Text className="text-xl font-extrabold text-center mb-2" style={{ color: colors.text }}>
              Verification in Progress
            </Text>
            <Text className="text-center text-sm px-4" style={{ color: colors.textSecondary }}>
              Thank you! Your documents are under review. We'll notify you once your account is verified.
            </Text>
          </View>

          {/* Clock Graphic */}
          <View className="items-center justify-center py-6 mb-4">
            <View className="w-32 h-32 rounded-full bg-blue-50 items-center justify-center border-4 border-blue-100">
              <IconSymbol name="clock.fill" size={64} color="#3B82F6" />
            </View>
          </View>

          {/* Timeline */}
          <View className="pl-2 mb-6">
            {/* Step 1 */}
            <View className="flex-row mb-6">
              <View className="items-center mr-4">
                <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center z-10">
                  <IconSymbol name="checkmark" size={12} color="#FFF" />
                </View>
                <View className="w-[2px] h-full bg-gray-200 absolute top-6" />
              </View>
              <View className="flex-1 pt-1">
                <Text className="font-bold text-base" style={{ color: colors.text }}>Documents Submitted</Text>
                <Text className="text-xs" style={{ color: colors.textSecondary }}>May 20, 2024 at 10:30 AM</Text>
              </View>
            </View>

            {/* Step 2 */}
            <View className="flex-row mb-6">
              <View className="items-center mr-4">
                <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center z-10">
                  <IconSymbol name="checkmark" size={12} color="#FFF" />
                </View>
                <View className="w-[2px] h-full bg-gray-200 absolute top-6" />
              </View>
              <View className="flex-1 pt-1">
                <Text className="font-bold text-base" style={{ color: colors.text }}>Under Review</Text>
                <Text className="text-xs" style={{ color: colors.textSecondary }}>Our team is verifying your documents</Text>
              </View>
            </View>

            {/* Step 3 */}
            <View className="flex-row">
              <View className="items-center mr-4">
                <View className="w-6 h-6 rounded-full border-2 items-center justify-center z-10 bg-white" style={{ borderColor: colors.border }}>
                </View>
              </View>
              <View className="flex-1 pt-1">
                <Text className="font-bold text-base" style={{ color: colors.textMuted }}>Verification Complete</Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>You will be notified via email</Text>
              </View>
            </View>
          </View>

          <Text className="text-xs text-center" style={{ color: colors.textMuted }}>
            This usually takes 1-2 business days.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
