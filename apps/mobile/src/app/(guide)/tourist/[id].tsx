import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { apiClient } from "@/lib/api";

export default function TouristProfileScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.getUserPublicProfile(id as string);
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, padding: 20 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-center mt-10" style={{ color: colors.text }}>
          {error || "Profile not found"}
        </Text>
      </SafeAreaView>
    );
  }

  const joinDate = new Date(profile.memberSince).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-primary pt-8 pb-16 px-6 items-center relative">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="absolute top-4 left-4 p-2 z-10"
          >
            <IconSymbol name="chevron.left" size={24} color="#fff" />
          </TouchableOpacity>

          <View className="mb-4">
            <Image
              source={{
                uri: profile.avatarUrl || "https://placehold.co/150x150/png",
              }}
              className="w-24 h-24 rounded-full border-4 border-white/20"
            />
          </View>
          <Text className="text-xl font-bold text-white mb-1 text-center">
            {profile.fullName || "Tourist"}
          </Text>
          <Text className="text-white/80 text-sm">
            Member since {joinDate}
          </Text>

          <View className="mt-4 bg-white/20 px-4 py-2 rounded-full">
            <Text className="text-white font-semibold text-sm">
              {profile.totalBookings} Total Booking{profile.totalBookings !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View className="px-4 -mt-8">
          <View className="rounded-2xl p-5 mb-6" style={{ backgroundColor: colors.card, elevation: 2 }}>
            <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>
              About
            </Text>
            {profile.bio ? (
              <Text className="text-base leading-relaxed" style={{ color: colors.textSecondary }}>
                {profile.bio}
              </Text>
            ) : (
              <Text className="text-base italic" style={{ color: colors.textMuted }}>
                This user hasn't written a bio yet.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
