// src/components/SectionHeader.tsx

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface Props {
  title: string;
  colors: typeof Colors.light;
  onViewAll?: () => void;
}

export const SectionHeader: React.FC<Props> = ({
  title,
  colors,
  onViewAll,
}) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    }}
  >
    <ThemedText type="subtitle">{title}</ThemedText>
    {onViewAll && (
      <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
        <ThemedText type="link">View all</ThemedText>
      </TouchableOpacity>
    )}
  </View>
);
