import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
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

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const logoTextStyle = { fontSize: 28, fontFamily: "Poppins-Bold" };

  const [form, setForm] = useState<AuthFormState>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: keyof AuthFormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    router.replace("/(tourist)/(tabs)/home");
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
            className="overflow-hidden"
            style={{
              height: 220,
            }}
          >
            <Image
              source={require("@/assets/images/hero-banner.png")}
              style={{ width: "100%", height: "100%", position: "absolute" }}
              resizeMode="cover"
            />
            <View
              className="items-center"
              style={{
                flex: 1,
                backgroundColor: colors.heroOverlay,
                padding: 20,
                justifyContent: "center",
              }}
            >
              <Image
                source={require("@/assets/images/icon.png")}
                style={{ width: 42, height: 42 }}
                resizeMode="contain"
              />
              <ThemedText style={[logoTextStyle, { marginTop: 4 }]}>
                <ThemedText style={[logoTextStyle, { color: colors.primary }]}>
                  Sathi
                </ThemedText>
                <ThemedText
                  style={{
                    ...logoTextStyle,
                    color: colors.secondary,
                  }}
                >
                  Guide
                </ThemedText>
              </ThemedText>
              <Text
                className="text-[13px] mt-1"
                style={{ color: "rgba(255,255,255,0.75)" }}
              >
                Find local guides. Live authentic Nepal.
              </Text>
            </View>
          </View>

          {/* Form */}
          <View
            className="px-6 pt-8"
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              marginTop: -24,
              overflow: "hidden",
            }}
          >
            <ThemedText
              style={{
                fontSize: 22,
                fontFamily: "Poppins-Bold",
              }}
            >
              Welcome Back!
            </ThemedText>
            <ThemedText type="muted" className="text-sm mb-7">
              Sign in to continue your journey
            </ThemedText>

            {/* Inputs */}
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
              label="Password"
              icon="lock.fill"
              placeholder="Enter your password"
              isPassword
              value={form.password}
              onChangeText={(t) => updateField("password", t)}
              error={errors.password}
              colors={colors}
            />

            {/* Forgot Password */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="self-end -mt-2 mb-6"
            >
              <ThemedText
                className="text-[13px] font-semibold"
                style={{ color: colors.primary }}
              >
                Forgot password?
              </ThemedText>
            </TouchableOpacity>

            {/* Login Button */}
            <AuthButton
              label="Sign In"
              isLoading={isLoading}
              colors={colors}
              onPress={handleLogin}
            />

            {/* Divider */}
            <AuthDivider colors={colors} />

            {/* Social Buttons */}
            <View className="flex-row gap-3 mb-8">
              <SocialButton
                icon="globe"
                label="Google"
                colors={colors}
                onPress={() => {}}
              />
              <SocialButton
                icon="applelogo"
                label="Apple"
                colors={colors}
                onPress={() => {}}
              />
            </View>

            {/* Sign Up Link */}
            <View className="flex-row justify-center items-center pb-10 gap-1">
              <ThemedText type="muted" className="text-sm">
                Don&apos;t have an account?
              </ThemedText>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/(auth)/signup")}
              >
                <ThemedText
                  className="text-sm font-bold"
                  style={{ color: colors.primary }}
                >
                  Sign Up
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
