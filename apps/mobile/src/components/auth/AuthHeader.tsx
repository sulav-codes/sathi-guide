import { View } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedView } from "../themed-view";
import { Image } from "expo-image";
import { ThemedText } from "../themed-text";
import { Colors } from "@/constants/theme";

const AuthHeader = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const logoTextStyle = { fontSize: 28, fontFamily: "Poppins-Bold" };
  return (
    <ThemedView
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 2,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
        <Image
          source={require("@/assets/images/logo-icon.png")}
          style={{ width: 40, height: 40 }}
          contentFit="contain"
          transition={1000}
        />
        <ThemedText style={[logoTextStyle, { paddingTop: 6 }]}>
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
    </ThemedView>
  );
};

export default AuthHeader;
