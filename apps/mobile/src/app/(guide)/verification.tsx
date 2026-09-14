import React, { useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, type Href } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useMyGuideProfile, guideKeys } from "@/hooks/use-guides";
import { useQueryClient } from "@tanstack/react-query";

// Types

type VerificationStatus =
  "APPROVED" | "UNDER_REVIEW" | "REJECTED" | "SUSPENDED" | "PENDING";

type StatusDisplay = {
  icon: React.ComponentProps<typeof IconSymbol>["name"];
  color: string;
  text: string;
  description: string;
  badge: string;
  badgeColor: string;
};

type AppColors = (typeof Colors)["light"];

// Constants

const KYC_ROUTE: Href = "/(shared)/verification/kyc";

const STATUS_CONFIG: Record<VerificationStatus, StatusDisplay> = {
  APPROVED: {
    icon: "checkmark.seal.fill",
    color: "#10B981",
    text: "Verified",
    description:
      "Your profile is verified. You can now receive booking requests.",
    badge: "Active",
    badgeColor: "#10B981",
  },
  UNDER_REVIEW: {
    icon: "clock",
    color: "#F59E0B",
    text: "Under Review",
    description:
      "Your documents are currently under review by our team. This usually takes 1–2 business days.",
    badge: "Under Review",
    badgeColor: "#F59E0B",
  },
  REJECTED: {
    icon: "xmark.seal.fill",
    color: "#EF4444",
    text: "Action Required",
    description:
      "Your verification was rejected. Please upload updated documents and resubmit.",
    badge: "Rejected",
    badgeColor: "#EF4444",
  },
  SUSPENDED: {
    icon: "exclamationmark.shield.fill",
    color: "#DC2626",
    text: "Account Suspended",
    description:
      "Your account has been suspended due to a policy violation. Please contact support for more information.",
    badge: "Suspended",
    badgeColor: "#DC2626",
  },
  PENDING: {
    icon: "shield.lefthalf.filled",
    color: "#6B7280",
    text: "Verification Pending",
    description:
      "Complete your profile verification to start receiving bookings. Upload your identity documents to get started.",
    badge: "Not Started",
    badgeColor: "#6B7280",
  },
};

// Step completion helpers

const STEP2_COMPLETED: VerificationStatus[] = [
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
];

const STEP3_COMPLETED: VerificationStatus[] = ["APPROVED"];
const STEP3_WARNING: VerificationStatus[] = ["REJECTED", "SUSPENDED"];

function VerificationStep({
  step,
  title,
  subtitle,
  isCompleted,
  isWarning = false,
  isActive,
  colors,
  isLast = false,
}: {
  step: number;
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isWarning?: boolean;
  isActive: boolean;
  colors: AppColors;
  isLast?: boolean;
}) {
  const circleColor = isCompleted
    ? "#10B981"
    : isWarning
      ? "#EF4444"
      : isActive
        ? "#F59E0B"
        : colors.border;

  return (
    <View className="flex-row mb-0">
      <View className="items-center mr-4">
        <View
          className="w-8 h-8 rounded-full items-center justify-center z-10"
          style={{ backgroundColor: circleColor }}
        >
          {isCompleted ? (
            <IconSymbol name="checkmark" size={14} color="#fff" />
          ) : isWarning ? (
            <IconSymbol name="xmark" size={14} color="#fff" />
          ) : (
            <Text className="text-white font-bold text-xs">{step}</Text>
          )}
        </View>

        {!isLast && (
          <View
            className="w-0.5 flex-1"
            style={{
              minHeight: 32,
              backgroundColor: isCompleted ? "#10B98150" : colors.border,
            }}
          />
        )}
      </View>

      <View className="flex-1 pb-6">
        <Text
          className="font-bold text-sm"
          style={{
            color:
              isActive || isCompleted || isWarning
                ? colors.text
                : colors.textMuted,
          }}
        >
          {title}
        </Text>
        <Text
          className="text-xs mt-0.5"
          style={{ color: colors.textSecondary }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

// Screen

export default function VerificationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useMyGuideProfile();

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({
        queryKey: guideKeys.myProfile(),
        refetchType: "active",
      });
    }, [queryClient]),
  );

  if (isLoading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const rawStatus = profile?.currentVerificationStatus ?? "PENDING";
  const status: VerificationStatus =
    rawStatus in STATUS_CONFIG ? (rawStatus as VerificationStatus) : "PENDING";

  const display = STATUS_CONFIG[status];
  const canUpload = status === "PENDING" || status === "REJECTED";

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View className="relative w-full h-64 overflow-hidden rounded-b-3xl">
        <Image
          source={require("@/assets/images/sathi_guide_header.png")}
          style={{ width: "100%", height: "100%", position: "absolute" }}
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/40" />

        <SafeAreaView edges={["top"]} className="flex-1">
          <View className="px-5 pt-2 flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <IconSymbol name="chevron.left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text className="text-2xl font-extrabold text-white">
              Verification
            </Text>
          </View>

          <View className="items-center justify-center flex-1 pb-6">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-3"
              style={{
                backgroundColor: `${display.color}25`,
                borderWidth: 2,
                borderColor: display.color,
              }}
            >
              <IconSymbol name={display.icon} size={40} color={display.color} />
            </View>
            <View
              className="px-3 py-1 rounded-full mb-2"
              style={{ backgroundColor: `${display.badgeColor}30` }}
            >
              <Text
                className="text-xs font-bold uppercase"
                style={{ color: display.badgeColor }}
              >
                {display.badge}
              </Text>
            </View>
            <Text
              className="text-xl font-bold mb-1"
              style={{ color: display.color }}
            >
              {display.text}
            </Text>
            <Text className="text-center px-8 text-sm text-white/90">
              {display.description}
            </Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20 }}
      >
        <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>
          Verification Steps
        </Text>

        <VerificationStep
          step={1}
          title="Profile Created"
          subtitle="Your guide profile has been set up"
          isCompleted
          isActive={status === "PENDING"}
          colors={colors}
        />

        <VerificationStep
          step={2}
          title="Documents Submitted"
          subtitle="Identity document uploaded for review"
          isCompleted={STEP2_COMPLETED.includes(status)}
          isActive={status === "UNDER_REVIEW"}
          colors={colors}
        />

        <VerificationStep
          step={3}
          title="Admin Review"
          subtitle="Our team verifies your documents"
          isCompleted={STEP3_COMPLETED.includes(status)}
          isWarning={STEP3_WARNING.includes(status)}
          isActive={false}
          colors={colors}
          isLast
        />

        <Text
          className="text-lg font-bold mb-4 mt-6"
          style={{ color: colors.text }}
        >
          Required Documents
        </Text>

        <View
          className="rounded-2xl p-4 mb-3 flex-row items-center justify-between"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center flex-1">
            <View
              className="w-10 h-10 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: "#3B82F615" }}
            >
              <IconSymbol
                name="person.text.rectangle"
                size={20}
                color="#3B82F6"
              />
            </View>
            <View>
              <Text
                className="text-sm font-bold"
                style={{ color: colors.text }}
              >
                Identity Document
              </Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Passport, Citizenship, NID or License
              </Text>
            </View>
          </View>

          {status === "APPROVED" ? (
            <IconSymbol
              name="checkmark.circle.fill"
              size={24}
              color="#10B981"
            />
          ) : status === "UNDER_REVIEW" ? (
            <View
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: "#F59E0B20" }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: "#F59E0B" }}
              >
                In Review
              </Text>
            </View>
          ) : status === "SUSPENDED" ? (
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={24}
              color="#DC2626"
            />
          ) : canUpload ? (
            <TouchableOpacity
              className="px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: colors.border }}
              onPress={() => router.push(KYC_ROUTE)}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: colors.text }}
              >
                {status === "REJECTED" ? "Re-upload" : "Upload"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Suspended banner */}
        {status === "SUSPENDED" && (
          <View
            className="rounded-2xl p-4 mt-2"
            style={{
              backgroundColor: "#DC262610",
              borderWidth: 1,
              borderColor: "#DC262640",
            }}
          >
            <Text className="text-sm font-bold text-red-600 mb-1">
              Account Suspended
            </Text>
            <Text className="text-xs text-red-500">
              Your account has been suspended. Please contact our support team
              at support@sathiguide.com to resolve this issue.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
