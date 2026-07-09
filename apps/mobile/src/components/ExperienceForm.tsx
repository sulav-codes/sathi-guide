import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CreateExperienceDto, ExperienceDifficulty } from "@/types/api";
import { useCategories } from "@/hooks/use-experiences";

const DIFFICULTIES: ExperienceDifficulty[] = ["EASY", "MODERATE", "HARD", "EXPERT"];

interface ExperienceFormProps {
  initialValues?: Partial<CreateExperienceDto>;
  onSubmit: (data: CreateExperienceDto) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

function FieldLabel({ label }: { label: string }) {
  return <Text className="text-sm font-semibold mb-1 text-dark">{label}</Text>;
}

export function ExperienceForm({
  initialValues = {},
  onSubmit,
  isLoading,
  submitLabel = "Save",
}: ExperienceFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const { data: categories, isLoading: loadingCategories } = useCategories();

  const [title, setTitle] = useState(initialValues.title || "");
  const [shortDescription, setShortDescription] = useState(initialValues.shortDescription || "");
  const [description, setDescription] = useState(initialValues.description || "");
  const [categoryId, setCategoryId] = useState(initialValues.categoryId || "");
  const [difficulty, setDifficulty] = useState<ExperienceDifficulty>(
    initialValues.difficulty || "MODERATE"
  );
  const [durationHours, setDurationHours] = useState(
    initialValues.durationHours?.toString() || "2"
  );
  const [minParticipants, setMinParticipants] = useState(
    initialValues.minParticipants?.toString() || "1"
  );
  const [maxParticipants, setMaxParticipants] = useState(
    initialValues.maxParticipants?.toString() || "10"
  );
  const [basePrice, setBasePrice] = useState(initialValues.basePrice?.toString() || "1000");
  const [city, setCity] = useState(initialValues.location?.city || "Kathmandu");
  const [district, setDistrict] = useState(initialValues.location?.district || "Kathmandu");

  // Set default categoryId once categories load (only if not already set)
  React.useEffect(() => {
    if (categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("Validation Error", "Title is required.");
      return;
    }
    if (!shortDescription.trim()) {
      Alert.alert("Validation Error", "Short description is required.");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Validation Error", "Full description is required.");
      return;
    }
    if (!categoryId) {
      Alert.alert("Validation Error", "Please select a category.");
      return;
    }

    const data: CreateExperienceDto = {
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      categoryId,
      difficulty,
      durationHours: parseFloat(durationHours) || 2,
      minParticipants: parseInt(minParticipants, 10) || 1,
      maxParticipants: parseInt(maxParticipants, 10) || 10,
      basePrice: parseFloat(basePrice) || 1000,
      currency: "NPR",
      languagesOffered: ["English", "Nepali"],
      location: {
        city: city.trim() || "Kathmandu",
        district: district.trim() || "Kathmandu",
        latitude: 27.7172,
        longitude: 85.324,
        country: "Nepal",
      },
      pricingRules: [
        {
          name: "Standard Rate",
          unit: "PER_PERSON",
          amount: parseFloat(basePrice) || 1000,
          currency: "NPR",
        },
      ],
    };

    onSubmit(data);
  };

  const inputStyle = {
    borderColor: colors.border,
    color: colors.text,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  };

  return (
    <View className="flex-1">
      {/* Title */}
      <View className="mb-4">
        <FieldLabel label="Title *" />
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Kathmandu Heritage Walk"
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
        />
      </View>

      {/* Short Description */}
      <View className="mb-4">
        <FieldLabel label="Short Description *" />
        <TextInput
          value={shortDescription}
          onChangeText={setShortDescription}
          placeholder="One-line summary"
          placeholderTextColor={colors.textMuted}
          style={inputStyle}
        />
      </View>

      {/* Description */}
      <View className="mb-4">
        <FieldLabel label="Full Description *" />
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Detailed description of the experience..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={[inputStyle, { minHeight: 100 }]}
        />
      </View>

      {/* Category */}
      <View className="mb-4">
        <FieldLabel label="Category *" />
        {loadingCategories ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
          >
            {(categories || []).map((cat) => {
              const isSelected = cat.id === categoryId;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setCategoryId(cat.id)}
                  className="px-3 py-2 rounded-full"
                  style={{
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderWidth: 1,
                    borderColor: isSelected ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#fff" : colors.text,
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      {/* Difficulty */}
      <View className="mb-4">
        <FieldLabel label="Difficulty" />
        <View className="flex-row gap-2 flex-wrap">
          {DIFFICULTIES.map((d) => {
            const isSelected = d === difficulty;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setDifficulty(d)}
                className="px-3 py-2 rounded-full"
                style={{
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderWidth: 1,
                  borderColor: isSelected ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? "#fff" : colors.text,
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  {d}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Duration & Price */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <FieldLabel label="Duration (hrs)" />
          <TextInput
            value={durationHours}
            onChangeText={setDurationHours}
            keyboardType="decimal-pad"
            style={inputStyle}
          />
        </View>
        <View className="flex-1">
          <FieldLabel label="Price (NPR)" />
          <TextInput
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="numeric"
            style={inputStyle}
          />
        </View>
      </View>

      {/* Min/Max Participants */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <FieldLabel label="Min People" />
          <TextInput
            value={minParticipants}
            onChangeText={setMinParticipants}
            keyboardType="numeric"
            style={inputStyle}
          />
        </View>
        <View className="flex-1">
          <FieldLabel label="Max People" />
          <TextInput
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="numeric"
            style={inputStyle}
          />
        </View>
      </View>

      {/* Location */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <FieldLabel label="City" />
          <TextInput
            value={city}
            onChangeText={setCity}
            style={inputStyle}
          />
        </View>
        <View className="flex-1">
          <FieldLabel label="District" />
          <TextInput
            value={district}
            onChangeText={setDistrict}
            style={inputStyle}
          />
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        className="py-4 rounded-2xl items-center mt-2"
        style={{ backgroundColor: colors.primary, opacity: isLoading ? 0.7 : 1 }}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-bold text-base">{submitLabel}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
