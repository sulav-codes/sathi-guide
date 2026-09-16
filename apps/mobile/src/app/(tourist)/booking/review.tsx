import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCreateReview } from "@/hooks/use-reviews";

export default function LeaveReviewScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [knowledgeRating, setKnowledgeRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [comment, setComment] = useState("");

  const createReview = useCreateReview();

  const handleSubmit = () => {
    if (!overallRating) {
      Alert.alert("Missing Rating", "Please provide an overall rating.");
      return;
    }

    createReview.mutate(
      {
        bookingId,
        overallRating,
        communicationRating: communicationRating || undefined,
        punctualityRating: punctualityRating || undefined,
        knowledgeRating: knowledgeRating || undefined,
        valueRating: valueRating || undefined,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert("Thank you!", "Your review has been submitted.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (error: any) => {
          Alert.alert("Error", error.message || "Failed to submit review.");
        },
      },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        className="flex-row items-center justify-between px-4 py-3.5 border-b"
        style={{ borderBottomColor: colors.border }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text className="text-[17px] font-bold" style={{ color: colors.text }}>
          Leave a Review
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="bg-card p-4 rounded-2xl mb-6 shadow-sm"
          style={{
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <Text
            className="text-lg font-bold text-center mb-6"
            style={{ color: colors.text }}
          >
            How was your experience?
          </Text>

          <StarRating
            value={overallRating}
            onChange={setOverallRating}
            label="Overall Rating"
            colors={colors}
          />

          <View
            className="h-px w-full my-4"
            style={{ backgroundColor: colors.border }}
          />

          <Text
            className="text-xs font-bold uppercase mb-4"
            style={{ color: colors.textSecondary }}
          >
            Detailed Ratings (Optional)
          </Text>

          <StarRating
            value={communicationRating}
            onChange={setCommunicationRating}
            label="Communication"
            colors={colors}
          />
          <StarRating
            value={punctualityRating}
            onChange={setPunctualityRating}
            label="Punctuality"
            colors={colors}
          />
          <StarRating
            value={knowledgeRating}
            onChange={setKnowledgeRating}
            label="Knowledge"
            colors={colors}
          />
          <StarRating
            value={valueRating}
            onChange={setValueRating}
            label="Value for Money"
            colors={colors}
          />
        </View>

        <Text
          className="text-base font-bold mb-2"
          style={{ color: colors.text }}
        >
          Share your thoughts
        </Text>
        <TextInput
          placeholder="Tell others about your experience..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          className="p-4 rounded-xl text-base mb-6"
          style={{
            backgroundColor: colors.card,
            color: colors.text,
            borderWidth: 1,
            borderColor: colors.border,
            minHeight: 120,
          }}
          value={comment}
          onChangeText={setComment}
        />

        <TouchableOpacity
          className="py-4 rounded-full items-center justify-center flex-row"
          style={{
            backgroundColor:
              overallRating > 0 ? colors.primary : colors.inactiveCard,
          }}
          disabled={overallRating === 0 || createReview.isPending}
          onPress={handleSubmit}
        >
          {createReview.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">
              Submit Review
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const StarRating = ({
  value,
  onChange,
  label,
  colors,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  colors: any;
}) => (
  <View className="mb-4 flex-row items-center justify-between">
    <Text className="text-sm font-medium" style={{ color: colors.text }}>
      {label}
    </Text>
    <View className="flex-row gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onChange(star)}
          activeOpacity={0.7}
          className="p-1"
        >
          <IconSymbol
            name={star <= value ? "star.fill" : "star"}
            size={28}
            color={star <= value ? colors.orange : colors.border}
          />
        </TouchableOpacity>
      ))}
    </View>
  </View>
);
