import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert } from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { CreateExperienceDto, ExperienceDifficulty } from "@/types/api";

const CATEGORIES = [
  { id: "cm0xxx", name: "Culture", icon: "museum.fill" },
  { id: "cm0xxy", name: "Nature", icon: "leaf.fill" },
  { id: "cm0xxz", name: "Adventure", icon: "figure.walk" },
  { id: "cm0xwa", name: "Food", icon: "fork.knife" },
  { id: "cm0xwb", name: "Photography", icon: "camera.fill" },
];

const DIFFICULTIES = ["EASY", "MODERATE", "HARD", "EXPERT"];

interface ExperienceFormProps {
  initialValues?: Partial<CreateExperienceDto>;
  onSubmit: (data: CreateExperienceDto) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function ExperienceForm({ initialValues = {}, onSubmit, isLoading, submitLabel = "Save" }: ExperienceFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [title, setTitle] = useState(initialValues.title || "");
  const [shortDescription, setShortDescription] = useState(initialValues.shortDescription || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [categoryId, setCategoryId] = useState(initialValues.categoryId || CATEGORIES[0].id);
  const [difficulty, setDifficulty] = useState<ExperienceDifficulty>(initialValues.difficulty || "MODERATE");
  const [durationHours, setDurationHours] = useState(initialValues.durationHours?.toString() || "2");
  const [minParticipants, setMinParticipants] = useState(initialValues.minParticipants?.toString() || "1");
  const [maxParticipants, setMaxParticipants] = useState(initialValues.maxParticipants?.toString() || "10");
  const [basePrice, setBasePrice] = useState(initialValues.basePrice?.toString() || "1000");
  const [city, setCity] = useState(initialValues.location?.city || "Kathmandu");
  const [district, setDistrict] = useState(initialValues.location?.district || "Kathmandu");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  const handleSubmit = () => {
    if (!title || !shortDescription || !description) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    const data: CreateExperienceDto = {
      title,
      shortDescription,
      description,
      categoryId,
      difficulty,
      durationHours: parseFloat(durationHours),
      minParticipants: parseInt(minParticipants, 10),
      maxParticipants: parseInt(maxParticipants, 10),
      basePrice: parseFloat(basePrice),
      currency: "NPR",
      languagesOffered: ["English", "Nepali"],
      location: {
        city,
        district,
        latitude: 27.7172,
        longitude: 85.324,
        country: "Nepal",
      },
      pricingRules: [
        {
          name: "Standard Rate",
          unit: "PER_PERSON",
          amount: parseFloat(basePrice),
          currency: "NPR",
        }
      ]
    };

    onSubmit(data);
  };

  const currentCategoryName = CATEGORIES.find(c => c.id === categoryId)?.name || "Select Category";

  return (
    <View className="flex-1">
      {/* Title */}
      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Kathmandu Heritage Walk"
          placeholderTextColor={colors.textMuted}
          className="border rounded-xl px-4 py-3"
          style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
        />
      </View>

      {/* Short Description */}
      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>Short Description</Text>
        <TextInput
          value={shortDescription}
          onChangeText={setShortDescription}
          placeholder="Brief summary of the experience"
          placeholderTextColor={colors.textMuted}
          className="border rounded-xl px-4 py-3"
          style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
        />
      </View>

      {/* Description */}
      <View className="mb-4">
        <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>Full Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Detailed description..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="border rounded-xl px-4 py-3"
          style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card, minHeight: 100 }}
        />
      </View>

      {/* Grid items */}
      <View className="flex-row mx-[-8px]">
        <View className="flex-1 px-2 mb-4">
          <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>Duration (hrs)</Text>
          <TextInput
            value={durationHours}
            onChangeText={setDurationHours}
            keyboardType="numeric"
            className="border rounded-xl px-4 py-3"
            style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
          />
        </View>
        <View className="flex-1 px-2 mb-4">
          <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>Price (NPR)</Text>
          <TextInput
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="numeric"
            className="border rounded-xl px-4 py-3"
            style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
          />
        </View>
      </View>

      <View className="flex-row mx-[-8px]">
        <View className="flex-1 px-2 mb-4">
          <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>Min People</Text>
          <TextInput
            value={minParticipants}
            onChangeText={setMinParticipants}
            keyboardType="numeric"
            className="border rounded-xl px-4 py-3"
            style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
          />
        </View>
        <View className="flex-1 px-2 mb-4">
          <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>Max People</Text>
          <TextInput
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="numeric"
            className="border rounded-xl px-4 py-3"
            style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
          />
        </View>
      </View>

      <View className="flex-row mx-[-8px]">
        <View className="flex-1 px-2 mb-4">
          <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>City</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            className="border rounded-xl px-4 py-3"
            style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
          />
        </View>
        <View className="flex-1 px-2 mb-4">
          <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>District</Text>
          <TextInput
            value={district}
            onChangeText={setDistrict}
            className="border rounded-xl px-4 py-3"
            style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.card }}
          />
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className="py-4 rounded-xl items-center mt-4"
        style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-lg">{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
