import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { SocialButton } from "@/components/auth/SocialButton";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthFormState, ValidationErrors } from "@/types";

type AccountType = "traveler" | "guide";

const ACCOUNT_TYPES = [
  { type: "traveler", icon: "🧳", label: "Traveler" },
  { type: "guide", icon: "🗺️", label: "Local Guide" },
] as const;

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [accountType, setAccountType] = useState<AccountType>("traveler");
  const [form, setForm] = useState<AuthFormState>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const updateField = (field: keyof AuthFormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.fullName?.trim()) newErrors.fullName = "Full name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Header */}
          <View
            className="items-center justify-end pb-7 overflow-hidden"
            style={{
              height: 180,
              backgroundColor: colors.secondary,
              borderBottomLeftRadius: 40,
              borderBottomRightRadius: 40,
            }}
          >
            {/* Decorative Circles */}
            <View
              className="absolute rounded-full"
              style={{
                width: 160,
                height: 160,
                top: -50,
                left: -30,
                backgroundColor: "rgba(255,255,255,0.08)",
              }}
            />
            <View
              className="absolute rounded-full"
              style={{
                width: 110,
                height: 110,
                top: 10,
                right: -20,
                backgroundColor: "rgba(255,255,255,0.06)",
              }}
            />
            <View
              className="absolute rounded-full"
              style={{
                width: 100,
                height: 100,
                bottom: -30,
                left: 80,
                backgroundColor: "rgba(255,255,255,0.05)",
              }}
            />

            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="absolute top-4 left-4 w-9 h-9 rounded-full items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
            >
              <Text className="text-lg text-white">←</Text>
            </TouchableOpacity>

            {/* Logo */}
            <View className="items-center">
              <View
                className="w-14 h-14 rounded-[18px] items-center justify-center mb-2.5"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                <Text className="text-3xl">🏔️</Text>
              </View>
              <Text className="text-[22px] font-extrabold text-white">
                Sathi
                <Text style={{ color: "#FFF9C4" }}>Guide</Text>
              </Text>
            </View>
          </View>

          {/* Form */}
          <View className="px-6 pt-7">
            <ThemedText className="text-[26px] font-extrabold mb-1">
              Create account ✨
            </ThemedText>
            <ThemedText type="muted" className="text-sm mb-6">
              Join thousands of Nepal explorers
            </ThemedText>

            {/* Account Type Toggle */}
            <ThemedText className="text-[13px] font-semibold mb-2.5">
              I am a...
            </ThemedText>
            <View className="flex-row gap-3 mb-6">
              {ACCOUNT_TYPES.map((item) => {
                const isActive = accountType === item.type;
                return (
                  <TouchableOpacity
                    key={item.type}
                    onPress={() => setAccountType(item.type)}
                    activeOpacity={0.8}
                    className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl"
                    style={{
                      borderWidth: 2,
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: isActive
                        ? colorScheme === "dark"
                          ? "#1e3a5f"
                          : "#EBF3FF"
                        : colors.card,
                    }}
                  >
                    <Text className="text-lg">{item.icon}</Text>
                    <ThemedText
                      className="text-sm font-bold"
                      style={{
                        color: isActive ? colors.primary : colors.textSecondary,
                      }}
                    >
                      {item.label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Form Fields */}
            <AuthInput
              label="Full Name"
              icon="👤"
              placeholder="Nima Sherpa"
              value={form.fullName}
              onChangeText={(t) => updateField("fullName", t)}
              error={errors.fullName}
              colors={colors}
            />

            <AuthInput
              label="Email Address"
              icon="📧"
              placeholder="you@example.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => updateField("email", t)}
              error={errors.email}
              colors={colors}
            />

            <AuthInput
              label="Phone Number (optional)"
              icon="📱"
              placeholder="+977 98XXXXXXXX"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(t) => updateField("phone", t)}
              colors={colors}
            />

            <AuthInput
              label="Password"
              icon="🔒"
              placeholder="Min. 8 characters"
              isPassword
              value={form.password}
              onChangeText={(t) => updateField("password", t)}
              error={errors.password}
              colors={colors}
            />

            <AuthInput
              label="Confirm Password"
              icon="🔒"
              placeholder="Re-enter your password"
              isPassword
              value={form.confirmPassword}
              onChangeText={(t) => updateField("confirmPassword", t)}
              error={errors.confirmPassword}
              colors={colors}
            />

            {/* Password Strength */}
            {form.password.length > 0 && (
              <PasswordStrength password={form.password} colors={colors} />
            )}

            {/* Terms & Conditions */}
            <TouchableOpacity
              onPress={() => setAgreedToTerms((v) => !v)}
              activeOpacity={0.8}
              className="flex-row items-start gap-2.5 mb-6 mt-1"
            >
              <View
                className="w-[22px] h-[22px] rounded-md items-center justify-center mt-0.5"
                style={{
                  borderWidth: 2,
                  borderColor: agreedToTerms ? colors.primary : colors.border,
                  backgroundColor: agreedToTerms
                    ? colors.primary
                    : "transparent",
                }}
              >
                {agreedToTerms && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
              </View>
              <View className="flex-1">
                <ThemedText type="muted" className="text-[13px] leading-5">
                  I agree to the{" "}
                  <ThemedText
                    className="text-[13px] font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Terms of Service
                  </ThemedText>{" "}
                  and{" "}
                  <ThemedText
                    className="text-[13px] font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Privacy Policy
                  </ThemedText>
                </ThemedText>
              </View>
            </TouchableOpacity>

            {/* Signup Button */}
            <AuthButton
              label="Create Account"
              isLoading={isLoading}
              colors={colors}
              onPress={handleSignup}
              disabled={!agreedToTerms}
              style={{ opacity: agreedToTerms ? 1 : 0.5 }}
            />

            {/* Divider */}
            <AuthDivider colors={colors} />

            {/* Social Buttons */}
            <View className="flex-row gap-3 mb-8">
              <SocialButton
                icon="🌐"
                label="Google"
                colors={colors}
                onPress={() => {}}
              />
              <SocialButton
                icon="🍎"
                label="Apple"
                colors={colors}
                onPress={() => {}}
              />
            </View>

            {/* Login Link */}
            <View className="flex-row justify-center items-center pb-10 gap-1">
              <ThemedText type="muted" className="text-sm">
                Already have an account?
              </ThemedText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.back()}
              >
                <ThemedText
                  className="text-sm font-bold"
                  style={{ color: colors.primary }}
                >
                  Sign In
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Password Strength Indicator

interface StrengthProps {
  password: string;
  colors: typeof Colors.light;
}

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

const STRENGTH_CONFIG: Record<StrengthLevel, { label: string; color: string }> =
  {
    0: { label: "", color: "#E5E7EB" },
    1: { label: "Weak", color: "#EF4444" },
    2: { label: "Fair", color: "#F59E0B" },
    3: { label: "Good", color: "#3B82F6" },
    4: { label: "Strong", color: "#10B981" },
  };

const PASSWORD_CHECKS = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "Special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

function PasswordStrength({ password, colors }: StrengthProps) {
  const checks = PASSWORD_CHECKS.map((c) => ({
    ...c,
    passed: c.test(password),
  }));

  const passed = checks.filter((c) => c.passed).length as StrengthLevel;
  const strength = STRENGTH_CONFIG[passed];

  return (
    <View className="mb-4">
      {/* Strength Bars */}
      <View className="flex-row gap-1.5 mb-2">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{
              backgroundColor: i < passed ? strength.color : colors.border,
            }}
          />
        ))}
      </View>

      {/* Strength Label */}
      {passed > 0 && (
        <Text
          className="text-xs font-semibold mb-2"
          style={{ color: strength.color }}
        >
          {strength.label} password
        </Text>
      )}

      {/* Checks Grid */}
      <View className="flex-row flex-wrap gap-2">
        {checks.map((check) => (
          <View key={check.label} className="flex-row items-center gap-1">
            <Text className="text-[11px]">{check.passed ? "✅" : "⬜"}</Text>
            <ThemedText
              className="text-[11px]"
              style={{
                color: check.passed ? "#10B981" : colors.textMuted,
              }}
            >
              {check.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}
