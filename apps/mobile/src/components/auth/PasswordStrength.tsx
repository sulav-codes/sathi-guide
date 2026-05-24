import { Text, View } from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "../ui/icon-symbol";
import { Colors } from "@/constants/theme";

interface StrengthProps {
  password: string;
  colors: typeof Colors.light;
}

type StrengthLevel = 0 | 1 | 2 | 3 | 4;

const STRENGTH_CONFIG: Record<StrengthLevel, { label: string; color: string }> =
  {
    0: { label: "", color: "#E5E7EB" },
    1: { label: "Weak", color: "#EF4444" },
    2: { label: "Fair", color: "#F59E0B" },
    3: { label: "Good", color: "#3B82F6" },
    4: { label: "Strong", color: "#10B981" },
  };

const PASSWORD_CHECKS = [
  { label: "8+ characters", test: (p: string) => p.length >= 8 },
  { label: "Uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Number", test: (p: string) => /[0-9]/.test(p) },
  {
    label: "Special character",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];
const PasswordStrength = ({ password, colors }: StrengthProps) => {
  const checks = PASSWORD_CHECKS.map((c) => ({
    ...c,
    passed: c.test(password),
  }));

  const passed = checks.filter((c) => c.passed).length as StrengthLevel;
  const strength = STRENGTH_CONFIG[passed];

  return (
    <View className="mb-4">
      {/* Strength Bars */}
      <View className="flex-row gap-1.5 mb-2">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{
              backgroundColor: i < passed ? strength.color : colors.border,
            }}
          />
        ))}
      </View>

      {/* Strength Label */}
      {passed > 0 && (
        <Text
          className="text-xs font-semibold mb-2"
          style={{ color: strength.color }}
        >
          {strength.label} password
        </Text>
      )}

      {/* Checks Grid */}
      <View className="flex-row flex-wrap gap-2">
        {checks.map((check) => (
          <View key={check.label} className="flex-row items-center gap-1">
            <IconSymbol
              name={check.passed ? "checkmark.circle.fill" : "circle"}
              size={12}
              color={check.passed ? "#10B981" : colors.textMuted}
            />
            <ThemedText
              className="text-[11px]"
              style={{
                color: check.passed ? "#10B981" : colors.textMuted,
              }}
            >
              {check.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
};

export default PasswordStrength;
