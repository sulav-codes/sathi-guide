import React from "react";
import { View } from "react-native";
import { Colors } from "@/constants/theme";

interface Props {
  colors: typeof Colors.light;
}

export const ExperienceCardSkeleton: React.FC<Props> = ({ colors }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        borderRadius: 16,
        alignItems: "center",
        marginBottom: 10,
        borderColor: colors.border,
        borderWidth: 1,
        backgroundColor: colors.card,
        paddingRight: 12,
      }}
    >
      <View
        style={{
          width: 140,
          height: 100,
          borderRadius: 12,
          backgroundColor: colors.border,
          opacity: 0.5,
        }}
      />
      <View style={{ flex: 1, marginLeft: 12, paddingVertical: 8, justifyContent: "center" }}>
        <View
          style={{
            height: 16,
            width: "80%",
            backgroundColor: colors.border,
            borderRadius: 4,
            marginBottom: 8,
            opacity: 0.5,
          }}
        />
        <View
          style={{
            height: 16,
            width: "60%",
            backgroundColor: colors.border,
            borderRadius: 4,
            marginBottom: 12,
            opacity: 0.5,
          }}
        />
        <View
          style={{
            height: 14,
            width: "40%",
            backgroundColor: colors.border,
            borderRadius: 4,
            opacity: 0.5,
          }}
        />
      </View>
    </View>
  );
};
