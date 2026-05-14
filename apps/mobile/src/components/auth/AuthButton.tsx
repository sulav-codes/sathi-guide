import React from "react";
import {
  TouchableOpacity,
  ActivityIndicator,
  Text,
  type TouchableOpacityProps,
} from "react-native";
import { Colors } from "@/constants/theme";

interface Props extends TouchableOpacityProps {
  label: string;
  isLoading?: boolean;
  variant?: "primary" | "outline" | "ghost";
  icon?: string;
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
  const bgColor = variant === "primary" ? colors.orange : "transparent";

  const textColor =
    variant === "primary"
      ? "#FFFFFF"
      : variant === "outline"
        ? colors.text
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
          borderColor: variant === "outline" ? colors.border : "transparent",
          opacity: isLoading ? 0.75 : 1,
        },
        style,
      ]}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#fff" : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && <Text className="text-lg">{icon}</Text>}
          <Text className="text-base font-bold" style={{ color: textColor }}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
