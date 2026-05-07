// src/components/LanguageChip.tsx

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import React from "react";
import { View } from "react-native";

interface Props {
  label: string;
  colors: typeof Colors.light;
}

export const LanguageChip: React.FC<Props> = ({ label, colors }) => (
  <View
    style={{
      paddingHorizontal: 16,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.card,
    }}
  >
    <ThemedText style={{ fontSize: 13, fontWeight: "500" }}>{label}</ThemedText>
  </View>
);
