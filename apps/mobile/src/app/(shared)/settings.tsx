import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState } from "react";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-4 flex-row items-center gap-3 border-b" style={{ borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()} className="p-1">
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: colors.text }}>
          Settings
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        
        {/* Account Section */}
        <Text className="text-sm font-bold uppercase mb-2 ml-1" style={{ color: colors.textMuted }}>Account</Text>
        <View className="rounded-2xl p-2 mb-6" style={{ backgroundColor: colors.card, elevation: 2 }}>
          <TouchableOpacity className="flex-row items-center p-3 border-b" style={{ borderBottomColor: colors.border }}>
            <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-3">
              <IconSymbol name="person.fill" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Personal Info</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Name, Email, Phone</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center p-3">
            <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center mr-3">
              <IconSymbol name="lock.fill" size={20} color="#EF4444" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Password & Security</Text>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>Change password</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Preferences Section */}
        <Text className="text-sm font-bold uppercase mb-2 ml-1" style={{ color: colors.textMuted }}>Preferences</Text>
        <View className="rounded-2xl p-2 mb-6" style={{ backgroundColor: colors.card, elevation: 2 }}>
          <TouchableOpacity className="flex-row items-center p-3 border-b" style={{ borderBottomColor: colors.border }}>
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${colors.text}10` }}>
              <IconSymbol name="globe" size={20} color={colors.textSecondary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Language</Text>
            </View>
            <Text className="text-sm mr-2" style={{ color: colors.textSecondary }}>English</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center p-3 border-b" style={{ borderBottomColor: colors.border }}>
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${colors.text}10` }}>
              <IconSymbol name="tag" size={20} color={colors.textSecondary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Currency</Text>
            </View>
            <Text className="text-sm mr-2" style={{ color: colors.textSecondary }}>NPR</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <View className="flex-row items-center p-3">
            <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: `${colors.text}10` }}>
              <IconSymbol name="moon.fill" size={20} color={colors.textSecondary} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Dark Mode</Text>
            </View>
            <Text className="text-sm mr-2" style={{ color: colors.textSecondary }}>System</Text>
            <IconSymbol name="chevron.right" size={20} color={colors.textMuted} />
          </View>
        </View>

        {/* Notifications Section */}
        <Text className="text-sm font-bold uppercase mb-2 ml-1" style={{ color: colors.textMuted }}>Notifications</Text>
        <View className="rounded-2xl p-2 mb-6" style={{ backgroundColor: colors.card, elevation: 2 }}>
          <View className="flex-row items-center p-3 border-b" style={{ borderBottomColor: colors.border }}>
            <View className="w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center mr-3">
              <IconSymbol name="bell.fill" size={20} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Push Notifications</Text>
            </View>
            <Switch 
              value={pushEnabled} 
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={"#FFF"}
            />
          </View>
          
          <View className="flex-row items-center p-3">
            <View className="w-10 h-10 rounded-full bg-amber-500/10 items-center justify-center mr-3">
              <IconSymbol name="envelope.fill" size={20} color="#F59E0B" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold" style={{ color: colors.text }}>Email Notifications</Text>
            </View>
            <Switch 
              value={emailEnabled} 
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={"#FFF"}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}