import { useState, useCallback } from "react";
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
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/context/AuthContext";
import { useUserProfile, useUpdateProfile } from "@/hooks/use-user-profile";

interface EditProfileFormProps {
  initialFullName: string;
  initialBio: string;
  initialPhone: string;
  isGuide: boolean;
  colors: (typeof Colors)["light"];
  onSave: (payload: { phone: string; fullName: string; bio: string }) => void;
  isSaving: boolean;
}

function EditProfileForm({
  initialFullName,
  initialBio,
  initialPhone,
  isGuide,
  colors,
  onSave,
  isSaving,
}: EditProfileFormProps) {

  const [fullName, setFullName] = useState(initialFullName);
  const [bio, setBio] = useState(initialBio);
  const [phone, setPhone] = useState(initialPhone);

  const bioLimit = isGuide ? 2000 : 500;

  const handleSave = useCallback(() => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Full Name is required");
      return;
    }
    onSave({ phone, fullName, bio });
  }, [fullName, bio, phone, onSave]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        className="px-5 pt-4 pb-4 flex-row items-center justify-between border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()} className="p-1">
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: colors.text }}>
            Edit Profile
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          className="bg-primary px-4 py-2 rounded-full"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-semibold">Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Full Name */}
        <View className="mb-6">
          <Text
            className="text-sm font-semibold mb-2"
            style={{ color: colors.text }}
          >
            Full Name
          </Text>
          <View
            className="flex-row items-center px-4 py-3 rounded-xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <IconSymbol name="person.fill" size={20} color={colors.textMuted} />
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textMuted}
              className="flex-1 ml-3 text-base"
              style={{ color: colors.text }}
            />
          </View>
          <Text
            className="text-xs mt-2"
            style={{ color: colors.textSecondary }}
          >
            ⚠️ Must match the name on your ID document
          </Text>
        </View>

        {/* Bio */}
        <View className="mb-6">
          <Text
            className="text-sm font-semibold mb-2"
            style={{ color: colors.text }}
          >
            Bio
          </Text>
          <View
            className="px-4 py-3 rounded-xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              minHeight: 120,
            }}
          >
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textMuted}
              multiline
              maxLength={bioLimit}
              className="flex-1 text-base"
              style={{ color: colors.text, textAlignVertical: "top" }}
            />
          </View>
          <Text
            className="text-xs mt-2 text-right"
            style={{ color: colors.textSecondary }}
          >
            {bio.length}/{bioLimit}
          </Text>
        </View>

        {/* Phone */}
        <View className="mb-6">
          <Text
            className="text-sm font-semibold mb-2"
            style={{ color: colors.text }}
          >
            Phone Number
          </Text>
          <View
            className="flex-row items-center px-4 py-3 rounded-xl border"
            style={{
              backgroundColor: colors.card,
              borderColor: colors.border,
            }}
          >
            <IconSymbol name="phone.fill" size={20} color={colors.textMuted} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+977 98..."
              placeholderTextColor={colors.textMuted}
              keyboardType="phone-pad"
              className="flex-1 ml-3 text-base"
              style={{ color: colors.text }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Main screen: handles loading + data fetching only

export default function EditProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { user, updateUser } = useAuth();
  const { data: profileData, isLoading: isProfileLoading } = useUserProfile();
  const updateProfileMutation = useUpdateProfile();

  const isGuide = user?.role === "GUIDE";

  const handleSave = useCallback(
    ({
      phone,
      fullName,
      bio,
    }: {
      phone: string;
      fullName: string;
      bio: string;
    }) => {
      const payload: Record<string, unknown> = { phone };

      if (isGuide) {
        payload.guideProfile = { fullName, bio };
      } else {
        payload.touristProfile = { fullName, bio };
      }

      updateProfileMutation.mutate(payload, {
        onSuccess: () => {
          if (user && phone !== user.phone) {
            updateUser({ ...user, phone });
          }
          router.back();
        },
        onError: (err: any) => {
          Alert.alert("Error", err.message || "Failed to update profile");
        },
      });
    },
    [isGuide, user, updateUser, updateProfileMutation],
  );

  if (isProfileLoading || !profileData) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.tint} />
      </SafeAreaView>
    );
  }

  const roleProfile = isGuide
    ? profileData.guideProfile
    : profileData.touristProfile;

  const initialFullName = roleProfile?.fullName ?? "";
  const initialBio = roleProfile?.bio ?? "";
  const initialPhone = profileData.phone ?? "";

  return (
    <EditProfileForm
      key={`${initialFullName}-${initialPhone}`}
      initialFullName={initialFullName}
      initialBio={initialBio}
      initialPhone={initialPhone}
      isGuide={isGuide}
      colors={colors}
      onSave={handleSave}
      isSaving={updateProfileMutation.isPending}
    />
  );
}
