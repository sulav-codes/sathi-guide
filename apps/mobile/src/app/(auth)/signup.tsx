import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
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
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthFormState, ValidationErrors } from "@/types";
import { appleIconLogo, googleIconLogo, tourGuideIcon, touristIcon } from "@/assets/icons";
import PasswordStrength from "@/components/auth/PasswordStrength";
import AuthHeader from "@/components/auth/AuthHeader";
import { Image } from "expo-image";

type AccountType = "tourist" | "guide";

const ACCOUNT_TYPES: {
  type: AccountType;
  icon: typeof tourGuideIcon | typeof touristIcon;
  label: string;
  description?: string;
}[] = [
  {
    type: "tourist",
    icon: touristIcon,
    label: "Traveler",
    description: "Explore and book amazing experiences",
  },
  {
    type: "guide",
    icon: tourGuideIcon,
    label: "Local Guide",
    description: "Share your knowledge and earn",
  },
];

export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const titleTextStyle = { fontSize: 28, fontFamily: "Poppins-Bold" };

  const [accountType, setAccountType] = useState<AccountType>("tourist");
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
    router.replace("/login");
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
          {/* Auth Header */}
          <AuthHeader />

          {/* Form */}
          <View className="px-6 pt-4">
            <View className="text-center mb-4">
              <ThemedText
                className="text-center"
                style={titleTextStyle}
              >
                Create account
              </ThemedText>
              <ThemedText type="muted" className="text-sm text-center">
                Join SathiGuide and explore Nepal
              </ThemedText>
            </View>

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
                    className="flex-1 flex-column items-center justify-center gap-2 py-3.5 rounded-2xl"
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
                    <Image
                      source={item.icon}
                      style={{ width: 32, height: 32 }}
                      contentFit="contain"
                      transition={1000}
                    />
                    <ThemedText
                      className="text-sm font-bold"
                      style={{
                        color: isActive ? colors.primary : colors.textSecondary,
                      }}
                    >
                      {item.label}
                    </ThemedText>
                    {item.description && (
                      <ThemedText
                        type="muted"
                        className="text-[11px] text-center px-1"
                      >
                        {item.description}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Form Fields */}
            <AuthInput
              label="Full Name"
              icon="person.fill"
              placeholder="Nima Sherpa"
              value={form.fullName}
              onChangeText={(t) => updateField("fullName", t)}
              error={errors.fullName}
              colors={colors}
            />

            <AuthInput
              label="Email Address"
              icon="envelope"
              placeholder="you@example.com"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => updateField("email", t)}
              error={errors.email}
              colors={colors}
            />

            <AuthInput
              label="Phone Number (optional)"
              icon="phone.fill"
              placeholder="+977 98XXXXXXXX"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(t) => updateField("phone", t)}
              colors={colors}
            />

            <AuthInput
              label="Password"
              icon="lock.fill"
              placeholder="Min. 8 characters"
              isPassword
              value={form.password}
              onChangeText={(t) => updateField("password", t)}
              error={errors.password}
              colors={colors}
            />

            <AuthInput
              label="Confirm Password"
              icon="lock.fill"
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
                  borderColor: colors.muted,
                  backgroundColor: agreedToTerms
                    ? colors.primary
                    : "transparent",
                }}
              >
                {agreedToTerms && (
                  <IconSymbol name="checkmark" size={14} color="#fff" />
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
                icon={googleIconLogo}
                label="Google"
                colors={colors}
                onPress={() => {}}
              />
              <SocialButton
                icon={appleIconLogo}
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
