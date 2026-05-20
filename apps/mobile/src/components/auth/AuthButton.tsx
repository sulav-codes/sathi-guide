import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
  type TouchableOpacityProps,
} from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import type { IconSymbolName } from "@/types";

interface Props extends TouchableOpacityProps {
  label: string;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  icon?: IconSymbolName;
  colors: typeof Colors.light;
}

export const AuthButton: React.FC<Props> = ({
  label,
  isLoading = false,
  variant = "primary",
  icon,
  colors,
  style,
  ...props
}) => {
  const bgColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? colors.secondary
        : "transparent";

  const textColor =
    variant === "primary"
      ? "#FFFFFF"
      : variant === "secondary"
        ? "#FFFFFF"
        : colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isLoading}
      className="flex-row items-center justify-center rounded-2xl py-4 gap-2"
      style={[
        {
          backgroundColor: bgColor,
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor: variant === "outline" ? colors.primary : "transparent",
          opacity: isLoading ? 0.75 : 1,
        },
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "secondary"
              ? "#fff"
              : colors.primary
          }
          size="small"
        />
      ) : (
        <>
          {icon && <IconSymbol name={icon} size={18} color={textColor} />}
          <Text className="text-base font-bold" style={{ color: textColor }}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
