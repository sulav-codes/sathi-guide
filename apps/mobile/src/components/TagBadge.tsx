import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import React from "react";

interface Props {
  icon: string;
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
    <ThemedText style={{ fontSize: 22 }}>{icon}</ThemedText>
    <ThemedText
      type="muted"
      style={{ fontSize: 11, textAlign: "center", marginTop: 4 }}
      numberOfLines={2}
    >
      {label}
    </ThemedText>
  </ThemedView>
);
