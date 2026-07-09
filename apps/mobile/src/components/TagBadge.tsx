import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import React from "react";
import { IconSymbolName } from "@/types";
import { IconSymbol } from "./ui/icon-symbol";

interface Props {
  icon: IconSymbolName | string; // Fallback to string for emojis temporarily if needed
  label: string;
  colors: typeof Colors.light;
}

export const TagBadge: React.FC<Props> = ({ icon, label, colors }) => (
  <ThemedView
    lightColor={Colors.light.tagBackground}
    darkColor={Colors.dark.tagBackground}
    style={{
      alignItems: "center",
      borderRadius: 12,
      padding: 10,
      minWidth: 72,
    }}
  >
    {typeof icon === "string" && (icon.length <= 2 || icon.includes("️")) ? (
      <ThemedText style={{ fontSize: 22 }}>{icon}</ThemedText>
    ) : (
      <IconSymbol name={icon as IconSymbolName} size={24} color={colors.textSecondary} />
    )}
    <ThemedText
      type="muted"
      style={{ fontSize: 11, textAlign: "center", marginTop: 4 }}
      numberOfLines={2}
    >
      {label}
    </ThemedText>
  </ThemedView>
);
