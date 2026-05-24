/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#1A1A1A",
    textSecondary: "#6B7280",
    textMuted: "#9CA3AF",
    background: "#F0F4FF",
    card: "#FFFFFF",
    border: "#F0F4FF",
    muted: "#CBD5E1",
    tint: "#1A73E8",
    primary: "#1A73E8",
    secondary: "#FE6D00",
    green: "#2DBE6C",
    orange: "#F5820A",
    tabBar: "#FFFFFF",
    tabBarBorder: "#E8E8E8",
    heroOverlay: "#FFB40422",
    inputBackground: "#FFFFFF",
    categoryBackground: "#FFFFFF",
    tagBackground: "#F3F4F6",
    statBackground: "#F7F8FA",
    shadow: "#000000",
  },
  dark: {
    text: "#F9FAFB",
    textSecondary: "#D1D5DB",
    textMuted: "#6B7280",
    background: "#0F172A",
    card: "#1E293B",
    border: "#334155",
    muted: "#334155",
    tint: "#60A5FA",
    primary: "#60A5FA",
    secondary: "#FE6D00",
    green: "#2DBE6C",
    orange: "#FB923C",
    tabBar: "#1E293B",
    tabBarBorder: "#334155",
    heroOverlay: "#3a2d3288",
    inputBackground: "#1E293B",
    categoryBackground: "#1E293B",
    tagBackground: "#334155",
    statBackground: "#334155",
    shadow: "#000000",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
