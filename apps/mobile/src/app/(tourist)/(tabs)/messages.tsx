import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MessagesScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];
  return (
    <SafeAreaView
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: colors.background }}
    >
      <View
        className="px-5 pt-4 pb-2 flex-row items-center justify-between absolute top-10 left-0 right-0 z-10"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-2xl font-extrabold"
          style={{ color: colors.text }}
        >
          Messages
        </Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text
          className="px-5 flex-row items-center text-xl font-bold"
          style={{ color: colors.text }}
        >
          Messages are coming soon!
        </Text>
        <Text
          className="px-5 flex-row items-center text-base font-medium"
          style={{ color: colors.textMuted }}
        >
          Stay tuned for updates.
        </Text>
      </View>
    </SafeAreaView>
  );
}
