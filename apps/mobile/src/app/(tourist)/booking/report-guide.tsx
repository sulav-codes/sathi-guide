import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCreateReport } from "@/hooks/use-reviews";

const REPORT_REASONS = [
  { id: "SAFETY_CONCERN", label: "Safety Concern" },
  { id: "HARASSMENT", label: "Harassment or inappropriate behavior" },
  { id: "FRAUD", label: "Fraud or scam" },
  { id: "NO_SHOW", label: "Guide did not show up" },
  { id: "OTHER", label: "Other" },
];

export default function ReportGuideScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const { guideId } = useLocalSearchParams<{ guideId: string }>();

  const [selectedReason, setSelectedReason] = useState("");
  const [detail, setDetail] = useState("");

  const createReport = useCreateReport();

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert("Missing Reason", "Please select a reason for reporting.");
      return;
    }

    createReport.mutate(
      {
        targetId: guideId,
        targetType: "GUIDE",
        reason: selectedReason,
        detail: detail.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(
            "Report Submitted",
            "Thank you. Our team will review this report shortly.",
            [{ text: "OK", onPress: () => router.back() }],
          );
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to submit report.");
        },
      },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        className="flex-row items-center justify-between px-4 py-3.5 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold text-red-500">Report Guide</Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1 px-4 py-6"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mb-6 items-center">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: "#FEE2E2" }}
          >
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={32}
              color="#EF4444"
            />
          </View>
          <Text
            className="text-base text-center"
            style={{ color: colors.textSecondary }}
          >
            We take safety and community standards seriously. Please provide
            details about your concern.
          </Text>
        </View>

        <Text
          className="text-base font-bold mb-3"
          style={{ color: colors.text }}
        >
          Reason for report
        </Text>
        <View className="gap-2 mb-6">
          {REPORT_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.id}
              className="flex-row items-center p-4 rounded-xl"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor:
                  selectedReason === reason.id ? colors.primary : colors.border,
              }}
              onPress={() => setSelectedReason(reason.id)}
            >
              <View
                className="w-5 h-5 rounded-full border items-center justify-center mr-3"
                style={{
                  borderColor:
                    selectedReason === reason.id
                      ? colors.primary
                      : colors.textMuted,
                }}
              >
                {selectedReason === reason.id && (
                  <View
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </View>
              <Text
                className="flex-1 text-sm font-medium"
                style={{ color: colors.text }}
              >
                {reason.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text
          className="text-base font-bold mb-2"
          style={{ color: colors.text }}
        >
          Additional Details
        </Text>
        <TextInput
          placeholder="Please provide any additional context..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          className="p-4 rounded-xl text-base mb-8"
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            minHeight: 100,
          }}
          value={detail}
          onChangeText={setDetail}
        />

        <TouchableOpacity
          className="py-4 rounded-full items-center justify-center flex-row mb-4"
          style={{
            backgroundColor: selectedReason ? "#EF4444" : colors.inactiveCard,
          }}
          disabled={!selectedReason || createReport.isPending}
          onPress={handleSubmit}
        >
          {createReport.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              Submit Report
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
