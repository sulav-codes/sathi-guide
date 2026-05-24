import React from "react";
import { View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

interface Props {
  label?: string;
  colors: typeof Colors.light;
}

export const AuthDivider: React.FC<Props> = ({
  label = "or continue with",
  colors,
}) => (
  <View className="flex-row items-center my-6 gap-3">
    <View className="flex-1 h-px" style={{ backgroundColor: colors.muted }} />
    <ThemedText type="muted" className="text-[13px]">
      {label}
    </ThemedText>
    <View className="flex-1 h-px" style={{ backgroundColor: colors.muted }} />
  </View>
);
