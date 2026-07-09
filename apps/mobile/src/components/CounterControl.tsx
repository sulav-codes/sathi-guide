// src/components/CounterControl.tsx

import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import React from "react";
import { TouchableOpacity, View } from "react-native";

interface Props {
  value: number;
  min?: number;
  max?: number;
  colors: typeof Colors.light;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const CounterControl: React.FC<Props> = ({
  value,
  min = 0,
  max = Infinity,
  colors,
  onIncrement,
  onDecrement,
}) => (
  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
    <TouchableOpacity
      onPress={onDecrement}
      disabled={value <= min}
      activeOpacity={0.7}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ThemedText style={{ fontSize: 18, lineHeight: 20 }}>−</ThemedText>
    </TouchableOpacity>

    <ThemedText
      style={{
        fontSize: 16,
        fontWeight: "700",
        minWidth: 20,
        textAlign: "center",
      }}
    >
      {value}
    </ThemedText>

    <TouchableOpacity
      onPress={onIncrement}
      disabled={value >= max}
      activeOpacity={0.7}
      style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ThemedText style={{ fontSize: 18, lineHeight: 20 }}>+</ThemedText>
    </TouchableOpacity>
  </View>
);
