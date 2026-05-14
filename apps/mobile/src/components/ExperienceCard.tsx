// src/components/ExperienceCard.tsx

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { Experience } from "@/types";
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { StarRating } from "./StarRating";
import { IconSymbol } from "./ui/icon-symbol";

interface Props {
  item: Experience;
  colors: typeof Colors.light;
  onPress?: () => void;
  onFavorite?: () => void;
}

export const ExperienceCard: React.FC<Props> = ({
  item,
  colors,
  onPress,
  onFavorite,
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
    <ThemedView
      style={{
        flexDirection: "row",
        borderRadius: 16,
        alignItems: "center",
        marginBottom: 10,
        borderColor: colors.border,
        borderWidth: 1,
        backgroundColor: colors.card,
        shadowColor: colors.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 6,
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: 140, height: 100, borderRadius: 12 }}
        resizeMode="cover"
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <ThemedText type="subtitle" style={{ fontSize: 14 }} numberOfLines={2}>
          {item.title}
        </ThemedText>
        <View style={{ marginTop: 4 }}>
          <StarRating rating={item.rating} reviews={item.reviews} size="sm" />
        </View>
        <ThemedText type="muted" style={{ marginTop: 4 }}>
          From{" "}
          <ThemedText style={{ fontWeight: "700", fontSize: 13, color: colors.green }}>
            {item.price}
          </ThemedText>{" "}
          /person
        </ThemedText>
      </View>
      <TouchableOpacity
        onPress={onFavorite}
        style={{ padding: 6 }}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="heart"
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>
    </ThemedView>
  </TouchableOpacity>
);
