import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

interface Props {
  label: string;
  icon: string;
  colors: typeof Colors.light;
  onPress?: () => void;
}

export const SocialButton: React.FC<Props> = ({
  label,
  icon,
  colors,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className="flex-1 flex-row items-center justify-center gap-2 py-3.5 rounded-2xl"
    style={{
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    }}
  >
    <Text className="text-xl">{icon}</Text>
    <ThemedText className="text-sm font-semibold">{label}</ThemedText>
  </TouchableOpacity>
);
