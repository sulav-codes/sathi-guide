import { View, TouchableOpacity } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";
import { Image } from "expo-image";
import { ThemedText } from "./themed-text";
import { Colors } from "@/constants/theme";

const Header = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const logoTextStyle = { fontSize: 22, fontFamily: "Poppins-Bold" };
  return (
    <ThemedView
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        elevation: 2,
      }}
    >
      <TouchableOpacity activeOpacity={0.7}>
        <IconSymbol
          size={28}
          name="line.3.horizontal"
          color={colors.textMuted}
        />
      </TouchableOpacity>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Image
          source={require("@/assets/images/logo-icon.png")}
          style={{ width: 40, height: 40 }}
          contentFit="contain"
        />
        <ThemedText style={[logoTextStyle, { marginTop: 4 }]}>
          <ThemedText style={[logoTextStyle, { color: colors.primary }]}>
            Sathi
          </ThemedText>
          <ThemedText
            style={{
              ...logoTextStyle,
              color: colors.secondary,
            }}
          >
            Guide
          </ThemedText>
        </ThemedText>
      </View>

      <TouchableOpacity activeOpacity={0.7}>
        <IconSymbol size={28} name="bell.fill" color={colors.textMuted} />
      </TouchableOpacity>
    </ThemedView>
  );
};

export default Header;
