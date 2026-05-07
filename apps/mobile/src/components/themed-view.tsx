// components/ThemedView.tsx

import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { View, type ViewProps } from "react-native";

interface ThemedViewProps extends ViewProps {
  lightColor?: string;
  darkColor?: string;
}

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor =
    colorScheme === "dark"
      ? (darkColor ?? Colors.dark.card)
      : (lightColor ?? Colors.light.card);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
