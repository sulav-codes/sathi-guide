import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import { useState } from "react";

export default function LicenseVerificationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [licenseUploaded, setLicenseUploaded] = useState(false);
  const [firstAidUploaded, setFirstAidUploaded] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Mountain Banner Header */}
      <View className="relative h-60 w-full bg-blue-500 overflow-hidden rounded-b-3xl">
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1000&auto=format&fit=crop" }} // Placeholder for mountain banner
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
              Upload Documents
            </Text>
            <Text className="text-center text-sm px-4" style={{ color: colors.textSecondary }}>
              Please upload required documents to verify your guide license.
            </Text>
          </View>

          <Text className="text-sm font-bold mb-3" style={{ color: colors.text }}>Required Documents</Text>

          <View className="border rounded-2xl p-4 mb-4" style={{ borderColor: colors.border }}>
            {/* Tour Guide License */}
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: `${colors.text}10` }}>
                <IconSymbol name="doc.text.fill" size={24} color={colors.textSecondary} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-base" style={{ color: colors.text }}>Tour Guide License</Text>
                <Text className="text-xs" style={{ color: colors.textSecondary }}>Valid tour guide license</Text>
              </View>
              {licenseUploaded ? (
                <Text className="font-bold text-sm text-green-500">Uploaded</Text>
              ) : (
                <TouchableOpacity onPress={() => setLicenseUploaded(true)} className="p-2">
                  <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>

            <View className="h-[1px] w-full mb-4" style={{ backgroundColor: colors.border }} />

            {/* First Aid Certificate */}
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: `${colors.text}10` }}>
                <IconSymbol name="cross.case.fill" size={24} color={colors.textSecondary} />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-base" style={{ color: colors.text }}>First Aid Certificate</Text>
                <Text className="text-xs" style={{ color: colors.textSecondary }}>Optional but recommended</Text>
              </View>
              {firstAidUploaded ? (
                <Text className="font-bold text-sm text-green-500">Uploaded</Text>
              ) : (
                <TouchableOpacity onPress={() => setFirstAidUploaded(true)} className="p-2">
                  <IconSymbol name="square.and.arrow.up" size={20} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            className="py-4 rounded-2xl items-center mt-2 mb-4"
            style={{ 
              backgroundColor: licenseUploaded ? colors.primary : colors.border,
            }}
            disabled={!licenseUploaded}
            onPress={() => router.push("/(shared)/verification/status")}
          >
            <Text className="text-white font-bold text-base">Submit for Verification</Text>
          </TouchableOpacity>

          <Text className="text-xs text-center px-4" style={{ color: colors.textMuted }}>
            Your documents are secure and will only be used for verification.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
