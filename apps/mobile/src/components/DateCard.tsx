// src/components/DateCard.tsx  ← corrected version

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DateItem } from "@/types";
import React from "react";
import { TouchableOpacity } from "react-native";

interface Props {
  item: DateItem;
  isSelected: boolean;
  colors: typeof Colors.light;
  onPress: () => void;
}

export const DateCard: React.FC<Props> = ({
  item,
  isSelected,
  colors,
  onPress,
}) => {
  const colorScheme = useColorScheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: isSelected ? colors.primary : colors.border,
        marginRight: 10,
        minWidth: 64,
        backgroundColor: isSelected
          ? colorScheme === "dark"
            ? "#1e3a5f"
            : "#EBF3FF"
          : colors.card,
      }}
    >
      <ThemedText
        style={{
          fontSize: 12,
          fontWeight: "500",
          color: isSelected ? colors.primary : colors.textMuted,
        }}
      >
        {item.day}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 22,
          fontWeight: "800",
          marginVertical: 2,
          color: isSelected ? colors.primary : colors.text,
        }}
      >
        {item.date}
      </ThemedText>
      <ThemedText
        style={{
          fontSize: 12,
          color: isSelected ? colors.primary : colors.textMuted,
        }}
      >
        {item.month}
      </ThemedText>
    </TouchableOpacity>
  );
};
