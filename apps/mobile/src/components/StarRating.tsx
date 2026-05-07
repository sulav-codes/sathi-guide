// src/components/StarRating.tsx

import { ThemedText } from "@/components/themed-text";
import React from "react";
import { View } from "react-native";

interface Props {
  rating: number;
  reviews: number;
  size?: "sm" | "md";
}

export const StarRating: React.FC<Props> = ({
  rating,
  reviews,
  size = "md",
}) => {
  const fontSize = size === "sm" ? 11 : 13;

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
      <ThemedText style={{ fontSize }}>⭐</ThemedText>
      <ThemedText type="muted" style={{ fontSize, fontWeight: "500" }}>
        {rating} ({reviews})
      </ThemedText>
    </View>
  );
};
