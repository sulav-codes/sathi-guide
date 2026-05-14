// src/components/CategoryItem.tsx

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Category } from "@/types";
import React from "react";
import { TouchableOpacity } from "react-native";
import { IconSymbol } from "./ui/icon-symbol";

interface Props {
  item: Category;
  colors: typeof Colors.light;
  onPress?: () => void;
}

export const CategoryItem: React.FC<Props> = ({ item, colors, onPress }) => (
  <TouchableOpacity
    style={{ alignItems: "center", width: 64 }}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <ThemedView
      style={{
        width: 52,
        height: 52,
        borderRadius: 52 / 2,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: item.color + "22",
     
      }}
    >
      <IconSymbol name={item.icon} size={24} color={item.color} />
    </ThemedView>
    <ThemedText
      type="muted"
      style={{ fontSize: 12, marginTop: 6, textAlign: "center" }}
    >
      {item.label}
    </ThemedText>
  </TouchableOpacity>
);
