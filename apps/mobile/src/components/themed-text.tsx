// components/ThemedText.tsx

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Text, type TextProps } from "react-native";

interface ThemedTextProps extends TextProps {
  lightColor?: string;
  darkColor?: string;
  type?:
    "default" | "defaultSemiBold" | "title" | "subtitle" | "muted" | "link";
}

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...otherProps
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const color =
    colorScheme === "dark"
      ? (darkColor ?? Colors.dark.text)
      : (lightColor ?? Colors.light.text);

  const typeStyles = {
    default: { fontSize: 14, color },
    defaultSemiBold: { fontSize: 14, color, fontWeight: "600" as const },
    title: { fontSize: 22, fontWeight: "800" as const, color },
    subtitle: { fontSize: 16, fontWeight: "700" as const, color },
    muted: {
      fontSize: 13,
      color:
        colorScheme === "dark" ? Colors.dark.textMuted : Colors.light.textMuted,
    },
    link: {
      fontSize: 14,
      color:
        colorScheme === "dark" ? Colors.dark.primary : Colors.light.primary,
      fontWeight: "600" as const,
    },
  };

  return <Text style={[typeStyles[type], style]} {...otherProps} />;
}
