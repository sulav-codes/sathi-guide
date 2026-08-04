import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { AuthFormState, ValidationErrors, Gender } from "@/types";
import {
  appleIconLogo,
  googleIconLogo,
  tourGuideIcon,
  touristIcon,
} from "@/assets/icons";
import PasswordStrength from "@/components/auth/PasswordStrength";
import AuthHeader from "@/components/auth/AuthHeader";
import { Image } from "expo-image";
import { useAuth } from "@/context/AuthContext";

type AccountType = "tourist" | "guide";
const LANGUAGE_OPTIONS = ["Nepali", "English", "Hindi"] as const;
type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];

const ACCOUNT_TYPES: {
  type: AccountType;
  icon: typeof tourGuideIcon | typeof touristIcon;
  label: string;
  description?: string;
}[] = [
  {
    type: "tourist",
    icon: touristIcon,
    label: "Tourist",
    description: "Explore and book amazing experiences",
  },
  {
    type: "guide",
    icon: tourGuideIcon,
    label: "Local Guide",
    description: "Share your knowledge and earn",
  },
];

const EXPERIENCE_OPTIONS = [
  { label: "0-1 years", value: "0-1" },
  { label: "2-3 years", value: "2-3" },
  { label: "4-6 years", value: "4-6" },
  { label: "7-10 years", value: "7-10" },
  { label: "10+ years", value: "10+" },
];

const GENDER_OPTIONS = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
  { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
] as const;

const EXPERIENCE_YEARS_MAP: Record<string, number> = {
  "0-1": 0,
  "2-3": 2,
  "4-6": 4,
  "7-10": 7,
  "10+": 10,
};

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
    experienceYears: "",
    languages: [],
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const [customLanguageInput, setCustomLanguageInput] = useState("");

  const updateField = <K extends keyof AuthFormState>(
    field: K,
    value: AuthFormState[K],
  ) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    if (type === "tourist") {
      setForm((p) => ({
        ...p,
        experienceYears: "",
        languages: [],
        hasGuideLicense: false,
        licenseNumber: "",
      }));
      setErrors((p) => ({
        ...p,
        experienceYears: undefined,
        languages: undefined,
        hasGuideLicense: undefined,
        licenseNumber: undefined,
      }));
      setIsExperienceOpen(false);
      setCustomLanguageInput("");
    }
  };

  const normalizeLanguage = (value: string) => value.trim();
  const isLanguageMatch = (a: string, b: string) =>
    a.trim().toLowerCase() === b.trim().toLowerCase();

  const addLanguage = (value: string) => {
    const candidate = normalizeLanguage(value);
    if (!candidate) return;

    setForm((p) => {
      const existing = p.languages ?? [];
      if (existing.some((item) => isLanguageMatch(item, candidate))) {
        return p;
      }
      return { ...p, languages: [...existing, candidate] };
    });

    if (errors.languages) {
      setErrors((p) => ({ ...p, languages: undefined }));
    }
  };

  const removeLanguage = (value: string) => {
    setForm((p) => {
      const existing = p.languages ?? [];
      return {
        ...p,
        languages: existing.filter((item) => !isLanguageMatch(item, value)),
      };
    });
  };

  const toggleLanguage = (value: LanguageOption) => {
    const isSelected = (form.languages ?? []).some((item) =>
      isLanguageMatch(item, value),
    );
    if (isSelected) {
      removeLanguage(value);
    } else {
      addLanguage(value);
    }
  };

  const handleAddCustomLanguage = () => {
    addLanguage(customLanguageInput);
    setCustomLanguageInput("");
  };

  const clearLanguages = () => {
    setForm((p) => ({ ...p, languages: [] }));
    setCustomLanguageInput("");
    if (errors.languages) {
      setErrors((p) => ({ ...p, languages: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!form.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (
      !/^(?=.{2,100}$)[\p{L}\p{M}]+([\s'.‐-’][\p{L}\p{M}]+)+$/u.test(
        form.fullName.trim()
      )
    ) {
      newErrors.fullName =
        "Please enter both your first and last name. Use only letters and basic punctuation (spaces, hyphens, or apostrophes).";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
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

    if (!form.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (accountType === "guide") {
      if (!form.experienceYears) {
        newErrors.experienceYears = "Select your experience";
      }
      const selectedLanguages = form.languages ?? [];
      if (selectedLanguages.length === 0) {
        newErrors.languages = "Select at least one language";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { register } = useAuth();

  const handleSignup = async () => {
    if (!validate()) return;
    if (!agreedToTerms) {
      setErrors((prev) => ({
        ...prev,
        terms: "Please agree to the terms and conditions",
      }));
      return;
    }

    setIsLoading(true);
    try {
      const registerData: Record<string, unknown> = {
        fullName: form.fullName?.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: accountType === "guide" ? "GUIDE" : "TOURIST",
        phone: form.phone?.trim() || undefined,
        gender: form.gender,
      };

      if (accountType === "guide") {
        registerData.experienceYears =
          EXPERIENCE_YEARS_MAP[form.experienceYears ?? ""] ?? 0;
        registerData.languagesSpoken = form.languages ?? [];
      } else {
        registerData.nationality = form.nationality;
        registerData.preferredLanguage = form.preferredLanguage;
        registerData.emergencyContactName = form.emergencyContactName;
        registerData.emergencyContactPhone = form.emergencyContactPhone;
      }

      await register(registerData as any);
      router.replace("/(auth)/login");

    } catch (error: unknown) {
      const rawMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      const errorMessage = Array.isArray(rawMessage)
        ? rawMessage.join("\n")
        : rawMessage;

      const lowerMsg = errorMessage.toLowerCase();
      const newErrors: ValidationErrors = {};

      if (lowerMsg.includes("email")) {
        newErrors.email = errorMessage;
      } else if (lowerMsg.includes("password")) {
        newErrors.password = errorMessage;
      } else if (lowerMsg.includes("phone")) {
        newErrors.phone = errorMessage;
      } else {
        newErrors.general = errorMessage;
      }

      // Replace errors entirely to avoid stale field errors
      setErrors(newErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const experienceLabel =
    EXPERIENCE_OPTIONS.find((option) => option.value === form.experienceYears)
      ?.label ?? "Select experience";
  const selectedLanguages = form.languages ?? [];
  const isLanguageSelected = (language: string) =>
    selectedLanguages.some((item) => isLanguageMatch(item, language));
  const canAddCustomLanguage = customLanguageInput.trim().length > 0;

  return (
    <SafeAreaView
      className="flex-1"
      edges={["top"]}
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
        translucent={false}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
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
              <ThemedText className="text-center" style={titleTextStyle}>
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
                    onPress={() => handleAccountTypeChange(item.type)}
                    activeOpacity={0.8}
                    className="flex-1 flex-col items-center justify-center gap-1 py-3.5 rounded-2xl"
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
                      style={{ width: 48, height: 48 }}
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
                        className="text-[11px] text-center px-2"
                      >
                        {item.description}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {accountType === "guide" && (
              <ThemedText className="text-[15px] font-bold mb-3">
                Personal information
              </ThemedText>
            )}

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
              autoCapitalize="none"
              autoCorrect={false}
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

            {/* Gender Selection */}
            <View className="mb-4">
              <ThemedText className="text-[13px] font-semibold mb-2.5">
                Gender *
              </ThemedText>
              <View className="flex-row flex-wrap gap-2">
                {GENDER_OPTIONS.map((option) => {
                  const isSelected = form.gender === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.8}
                      onPress={() =>
                        updateField("gender", option.value as Gender)
                      }
                      className="px-4 py-2.5 rounded-xl"
                      style={{
                        borderWidth: 1.5,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        backgroundColor: isSelected
                          ? colors.primary
                          : colors.inputBackground,
                      }}
                    >
                      <ThemedText
                        className="text-[13px] font-semibold"
                        style={{ color: isSelected ? "#fff" : colors.text }}
                      >
                        {option.label}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.gender && (
                <View className="flex-row items-center mt-1.5 gap-1">
                  <IconSymbol
                    name="exclamationmark.triangle.fill"
                    size={14}
                    color="#EF4444"
                  />
                  <ThemedText className="text-xs text-red-500 flex-1">
                    {errors.gender}
                  </ThemedText>
                </View>
              )}
            </View>

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

            {/* Guide-specific fields */}
            {accountType === "guide" && (
              <View className="mb-2">
                <ThemedText className="text-[15px] font-bold mb-3">
                  Guide information
                </ThemedText>

                <View
                  className="rounded-2xl p-4 mb-4"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1.5,
                    borderColor: colors.border,
                  }}
                >
                  <ThemedText className="text-[13px] font-semibold mb-3">
                    Experience and languages
                  </ThemedText>

                  {/* Experience Dropdown */}
                  <View className="mb-4">
                    <ThemedText className="text-[13px] font-semibold mb-2">
                      Experience (Years)
                    </ThemedText>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setIsExperienceOpen((v) => !v)}
                      className="flex-row items-center justify-between rounded-2xl px-3.5"
                      style={{
                        backgroundColor: colors.inputBackground,
                        borderWidth: 1.5,
                        borderColor: errors.experienceYears
                          ? "#EF4444"
                          : colors.border,
                        shadowColor: colors.shadow,
                        shadowOpacity: 0.04,
                        shadowRadius: 4,
                        elevation: 1,
                      }}
                    >
                      <View className="flex-row items-center gap-2">
                        <IconSymbol
                          name="suitcase.fill"
                          size={18}
                          color={colors.textMuted}
                        />
                        <ThemedText
                          className="text-[15px] py-3.5"
                          style={{
                            color: form.experienceYears
                              ? colors.text
                              : colors.textMuted,
                          }}
                        >
                          {experienceLabel}
                        </ThemedText>
                      </View>
                      <IconSymbol
                        name="chevron.right"
                        size={18}
                        color={colors.textMuted}
                        style={{
                          transform: [
                            { rotate: isExperienceOpen ? "90deg" : "0deg" },
                          ],
                        }}
                      />
                    </TouchableOpacity>

                    {isExperienceOpen && (
                      <View
                        className="rounded-2xl mt-2 overflow-hidden"
                        style={{
                          borderWidth: 1.5,
                          borderColor: colors.border,
                          backgroundColor: colors.card,
                        }}
                      >
                        {EXPERIENCE_OPTIONS.map((option, index) => (
                          <TouchableOpacity
                            key={option.value}
                            onPress={() => {
                              updateField("experienceYears", option.value);
                              setIsExperienceOpen(false);
                            }}
                            activeOpacity={0.8}
                            className="px-4 py-3"
                            style={{
                              borderTopWidth: index === 0 ? 0 : 1,
                              borderTopColor: colors.border,
                            }}
                          >
                            <ThemedText
                              className="text-[14px]"
                              style={{
                                color:
                                  form.experienceYears === option.value
                                    ? colors.primary
                                    : colors.text,
                                fontWeight:
                                  form.experienceYears === option.value
                                    ? "600"
                                    : "400",
                              }}
                            >
                              {option.label}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {errors.experienceYears && (
                      <View className="flex-row items-center mt-1.5 gap-1">
                        <IconSymbol
                          name="exclamationmark.triangle.fill"
                          size={14}
                          color="#EF4444"
                        />
                        <ThemedText className="text-xs text-red-500 flex-1">
                          {errors.experienceYears}
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  {/* Languages */}
                  <View className="mb-4">
                    <ThemedText className="text-[13px] font-semibold mb-2">
                      Languages
                    </ThemedText>
                    <View className="flex-row flex-wrap gap-2">
                      {LANGUAGE_OPTIONS.map((option) => {
                        const isSelected = isLanguageSelected(option);
                        return (
                          <TouchableOpacity
                            key={option}
                            activeOpacity={0.8}
                            onPress={() => toggleLanguage(option)}
                            className="px-3 py-2 rounded-full"
                            style={{
                              borderWidth: 1.5,
                              borderColor: isSelected
                                ? colors.primary
                                : colors.border,
                              backgroundColor: isSelected
                                ? colors.primary
                                : colors.inputBackground,
                            }}
                          >
                            <ThemedText
                              className="text-[12px] font-semibold"
                              style={{
                                color: isSelected ? "#fff" : colors.text,
                              }}
                            >
                              {option}
                            </ThemedText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {errors.languages && (
                      <View className="flex-row items-center mt-1.5 gap-1">
                        <IconSymbol
                          name="exclamationmark.triangle.fill"
                          size={14}
                          color="#EF4444"
                        />
                        <ThemedText className="text-xs text-red-500 flex-1">
                          {errors.languages}
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  {/* Custom Language Input */}
                  <View className="mt-4">
                    <ThemedText className="text-[13px] font-semibold mb-2">
                      Add another language
                    </ThemedText>
                    <View className="flex-row items-center gap-2">
                      <View className="flex-1">
                        <View
                          className="flex-row items-center rounded-2xl px-3.5"
                          style={{
                            backgroundColor: colors.inputBackground,
                            borderWidth: 1.5,
                            borderColor: colors.border,
                            shadowColor: colors.shadow,
                            shadowOpacity: 0.04,
                            shadowRadius: 4,
                            elevation: 1,
                          }}
                        >
                          <View style={{ marginRight: 10 }}>
                            <IconSymbol
                              name="globe"
                              size={18}
                              color={colors.textMuted}
                            />
                          </View>
                          <TextInput
                            className="flex-1 text-[15px] py-3.5"
                            style={{ color: colors.text }}
                            placeholderTextColor={colors.textMuted}
                            placeholder="Type a language"
                            value={customLanguageInput}
                            onChangeText={setCustomLanguageInput}
                            onSubmitEditing={handleAddCustomLanguage}
                            returnKeyType="done"
                            autoCapitalize="words"
                            autoCorrect={false}
                          />
                        </View>
                      </View>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleAddCustomLanguage}
                        className="px-4 py-3 rounded-2xl"
                        style={{
                          backgroundColor: colors.primary,
                          opacity: canAddCustomLanguage ? 1 : 0.55,
                        }}
                        disabled={!canAddCustomLanguage}
                      >
                        <ThemedText
                          className="text-[12px] font-semibold"
                          style={{ color: "#fff" }}
                        >
                          Add
                        </ThemedText>
                      </TouchableOpacity>
                    </View>

                    {selectedLanguages.length > 0 && (
                      <View className="mt-3">
                        <View className="flex-row items-center justify-between mb-2">
                          <ThemedText type="muted" className="text-[12px]">
                            Selected languages (tap to remove)
                          </ThemedText>
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={clearLanguages}
                          >
                            <ThemedText
                              className="text-[12px] font-semibold"
                              style={{ color: colors.primary }}
                            >
                              Clear all
                            </ThemedText>
                          </TouchableOpacity>
                        </View>
                        <View className="flex-row flex-wrap gap-2">
                          {selectedLanguages.map((language) => (
                            <TouchableOpacity
                              key={language}
                              activeOpacity={0.8}
                              onPress={() => removeLanguage(language)}
                              className="px-3 py-2 rounded-full"
                              style={{
                                borderWidth: 1.5,
                                borderColor: colors.border,
                                backgroundColor: colors.inputBackground,
                              }}
                            >
                              <ThemedText
                                className="text-[12px] font-semibold"
                                style={{ color: colors.text }}
                              >
                                {language}
                              </ThemedText>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* General Error Display */}
            {errors.general && (
              <View className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
                <ThemedText className="text-red-600 text-sm text-center">
                  {errors.general}
                </ThemedText>
              </View>
            )}

            {/* Terms & Conditions */}
            <TouchableOpacity
              onPress={() => {
                setAgreedToTerms((v) => !v);
                if (errors.terms) {
                  setErrors((p) => ({ ...p, terms: undefined }));
                }
              }}
              activeOpacity={0.8}
              className="flex-row items-start gap-2.5 mb-2 mt-1"
            >
              <View
                className="w-[22px] h-[22px] rounded-md items-center justify-center mt-0.5"
                style={{
                  borderWidth: 2,
                  borderColor: errors.terms ? "#EF4444" : colors.muted,
                  backgroundColor: agreedToTerms
                    ? colors.primary
                    : "transparent",
                }}
              >
                {agreedToTerms && (
                  <IconSymbol name="checkmark" size={14} color="#fff" />
                )}
              </View>
              <View className="flex-1 pt-1.5">
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
                {errors.terms && (
                  <ThemedText className="text-xs text-red-500 mt-1">
                    {errors.terms}
                  </ThemedText>
                )}
              </View>
            </TouchableOpacity>

            {/* Signup Button */}
            <View style={{ opacity: agreedToTerms ? 1 : 0.5 }}>
              <AuthButton
                label="Create Account"
                isLoading={isLoading}
                colors={colors}
                onPress={agreedToTerms ? handleSignup : undefined}
              />
            </View>

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
                onPress={() => router.replace("/(auth)/login")}
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
