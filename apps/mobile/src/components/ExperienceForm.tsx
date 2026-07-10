import { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CreateExperienceDto, ExperienceDifficulty } from "@/types/api";
import { useCategories } from "@/hooks/use-experiences";

const DIFFICULTIES: ExperienceDifficulty[] = [
  "EASY",
  "MODERATE",
  "HARD",
  "EXPERT",
];

interface ExperienceFormProps {
  initialValues?: Partial<CreateExperienceDto>;
  onSubmit: (data: CreateExperienceDto) => void;
  isLoading?: boolean;
  submitLabel?: string;
}

function FieldLabel({ label }: { label: string }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  return (
    <Text className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
      {label}
    </Text>
  );
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
  const [shortDescription, setShortDescription] = useState(
    initialValues.shortDescription || "",
  );
  const [description, setDescription] = useState(
    initialValues.description || "",
  );

  // `categoryId` only tracks an *explicit* user selection.
  // The value actually used for rendering/submission is derived below.
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    initialValues.categoryId || "",
  );

  const [difficulty, setDifficulty] = useState<ExperienceDifficulty>(
    initialValues.difficulty || "MODERATE",
  );
  const [durationHours, setDurationHours] = useState(
    initialValues.durationHours?.toString() || "",
  );
  const [minParticipants, setMinParticipants] = useState(
    initialValues.minParticipants?.toString() || "",
  );
  const [maxParticipants, setMaxParticipants] = useState(
    initialValues.maxParticipants?.toString() || "",
  );
  const [basePrice, setBasePrice] = useState(
    initialValues.basePrice?.toString() || "",
  );
  const [city, setCity] = useState(initialValues.location?.city || "");
  const [district, setDistrict] = useState(
    initialValues.location?.district || "",
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived value: falls back to the first available category when the
  // user hasn't made an explicit choice yet. No effect / setState needed.
  const categoryId = useMemo(() => {
    if (selectedCategoryId) return selectedCategoryId;
    return categories && categories.length > 0 ? categories[0].id : "";
  }, [selectedCategoryId, categories]);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) newErrors.title = "Title is required.";
    if (!shortDescription.trim())
      newErrors.shortDescription = "Short description is required.";
    if (!description.trim())
      newErrors.description = "Full description is required.";
    if (!categoryId) newErrors.categoryId = "Please select a category.";
    if (!durationHours.trim())
      newErrors.durationHours = "Duration is required.";
    if (!basePrice.trim()) newErrors.basePrice = "Price is required.";
    if (!minParticipants.trim())
      newErrors.minParticipants = "Min people is required.";
    if (!maxParticipants.trim())
      newErrors.maxParticipants = "Max people is required.";
    if (!city.trim()) newErrors.city = "City is required.";
    if (!district.trim()) newErrors.district = "District is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const data: CreateExperienceDto = {
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      categoryId,
      difficulty,
      durationHours: parseFloat(durationHours),
      minParticipants: parseInt(minParticipants, 10),
      maxParticipants: parseInt(maxParticipants, 10),
      basePrice: parseFloat(basePrice),
      currency: "NPR",
      languagesOffered: ["English", "Nepali"],
      location: {
        city: city.trim(),
        district: district.trim(),
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
          style={[inputStyle, errors.title ? { borderColor: "#EF4444" } : {}]}
        />
        {errors.title && (
          <Text className="text-red-500 text-xs mt-1">{errors.title}</Text>
        )}
      </View>

      {/* Short Description */}
      <View className="mb-4">
        <FieldLabel label="Short Description *" />
        <TextInput
          value={shortDescription}
          onChangeText={setShortDescription}
          placeholder="One-line summary"
          placeholderTextColor={colors.textMuted}
          style={[
            inputStyle,
            errors.shortDescription ? { borderColor: "#EF4444" } : {},
          ]}
        />
        {errors.shortDescription && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.shortDescription}
          </Text>
        )}
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
          style={[
            inputStyle,
            { minHeight: 100 },
            errors.description ? { borderColor: "#EF4444" } : {},
          ]}
        />
        {errors.description && (
          <Text className="text-red-500 text-xs mt-1">
            {errors.description}
          </Text>
        )}
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
                  onPress={() => setSelectedCategoryId(cat.id)}
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
        {errors.categoryId && (
          <Text className="text-red-500 text-xs mt-1">{errors.categoryId}</Text>
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
            style={[
              inputStyle,
              errors.durationHours ? { borderColor: "#EF4444" } : {},
            ]}
          />
          {errors.durationHours && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.durationHours}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <FieldLabel label="Price (NPR)" />
          <TextInput
            value={basePrice}
            onChangeText={setBasePrice}
            keyboardType="numeric"
            style={[
              inputStyle,
              errors.basePrice ? { borderColor: "#EF4444" } : {},
            ]}
          />
          {errors.basePrice && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.basePrice}
            </Text>
          )}
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
            style={[
              inputStyle,
              errors.minParticipants ? { borderColor: "#EF4444" } : {},
            ]}
          />
          {errors.minParticipants && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.minParticipants}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <FieldLabel label="Max People" />
          <TextInput
            value={maxParticipants}
            onChangeText={setMaxParticipants}
            keyboardType="numeric"
            style={[
              inputStyle,
              errors.maxParticipants ? { borderColor: "#EF4444" } : {},
            ]}
          />
          {errors.maxParticipants && (
            <Text className="text-red-500 text-xs mt-1">
              {errors.maxParticipants}
            </Text>
          )}
        </View>
      </View>

      {/* Location */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <FieldLabel label="City" />
          <TextInput
            value={city}
            onChangeText={setCity}
            style={[inputStyle, errors.city ? { borderColor: "#EF4444" } : {}]}
          />
          {errors.city && (
            <Text className="text-red-500 text-xs mt-1">{errors.city}</Text>
          )}
        </View>
        <View className="flex-1">
          <FieldLabel label="District" />
          <TextInput
            value={district}
            onChangeText={setDistrict}
            style={[
              inputStyle,
              errors.district ? { borderColor: "#EF4444" } : {},
            ]}
          />
          {errors.district && (
            <Text className="text-red-500 text-xs mt-1">{errors.district}</Text>
          )}
        </View>
      </View>

      {/* Submit */}
      <TouchableOpacity
        className="py-4 rounded-2xl items-center mt-2"
        style={{
          backgroundColor: colors.primary,
          opacity: isLoading ? 0.7 : 1,
        }}
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
