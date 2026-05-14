// src/components/auth/AuthInput.tsx

import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  type TextInputProps,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";

interface Props extends TextInputProps {
  label: string;
  icon: string;
  error?: string;
  isPassword?: boolean;
  colors: typeof Colors.light;
}

export const AuthInput: React.FC<Props> = ({
  label,
  icon,
  error,
  isPassword = false,
  colors,
  ...inputProps
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View className="mb-4">
      {/* Label */}
      <ThemedText className="text-[13px] font-semibold mb-2">
        {label}
      </ThemedText>

      {/* Input Row */}
      <View
        className="flex-row items-center rounded-2xl px-3.5"
        style={{
          backgroundColor: colors.inputBackground,
          borderWidth: 1.5,
          borderColor: error ? "#EF4444" : colors.border,
          shadowColor: colors.shadow,
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        }}
      >
        {/* Icon */}
        <Text className="text-lg mr-2.5">{icon}</Text>

        {/* Input */}
        <TextInput
          className="flex-1 text-[15px] py-3.5"
          style={{ color: colors.text }}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !isVisible}
          autoCapitalize="none"
          {...inputProps}
        />

        {/* Password Toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsVisible((v) => !v)}
            activeOpacity={0.7}
            className="p-1"
          >
            <Text className="text-lg">{isVisible ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {error && (
        <View className="flex-row items-center mt-1.5 gap-1">
          <Text className="text-xs">⚠️</Text>
          <Text className="text-xs text-red-500 flex-1">{error}</Text>
        </View>
      )}
    </View>
  );
};
