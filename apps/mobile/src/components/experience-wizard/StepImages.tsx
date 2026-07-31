import React, { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { WizardStepProps } from "./types";
import { WizardFooter } from "./WizardFooter";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "../ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { pickAndUploadImage } from "@/lib/upload";
import { apiClient } from "@/lib/api";

const MAX_IMAGES = 5;

export function StepImages({
  formData,
  updateData,
  onNext,
  onPrev,
  isFirstStep,
  isLastStep,
  isSaving,
  experienceId,
}: WizardStepProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadPhase, setUploadPhase] = useState<string>("");

  const images = formData.images;
  const hasAtLeastOne = images.length > 0;

  const handlePickImage = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert("Limit Reached", `You can upload at most ${MAX_IMAGES} images.`);
      return;
    }

    try {
      const idx = images.length;
      setUploadingIdx(idx);
      setUploadPhase("Compressing...");

      const result = await pickAndUploadImage({
        purpose: "experience",
        experienceId,
        onProgress: (phase) => {
          const labels = {
            compressing: "Compressing...",
            uploading: "Uploading...",
            confirming: "Saving...",
          };
          setUploadPhase(labels[phase]);
        },
      });

      if (!result) {
        setUploadingIdx(null);
        return;
      }

      // Attach image to the experience in the backend
      setUploadPhase("Attaching...");
      let imageId: string | undefined;
      if (experienceId) {
        const attached = await apiClient.addExperienceImage(experienceId, {
          mediaId: result.mediaId,
        });
        imageId = attached.id;
      }

      updateData({
        images: [
          ...images,
          { localUri: result.localUri, mediaId: result.mediaId, imageId },
        ],
      });
    } catch (err: any) {
      Alert.alert("Upload Failed", err.message || "Something went wrong.");
    } finally {
      setUploadingIdx(null);
      setUploadPhase("");
    }
  };

  const handleRemoveImage = async (idx: number) => {
    const img = images[idx];
    try {
      if (img.imageId && experienceId) {
        await apiClient.removeExperienceImage(experienceId, img.imageId);
      } else if (img.mediaId) {
        // If not yet attached (no imageId), just delete the raw media
        await apiClient.deleteMedia(img.mediaId);
      }
      const updated = images.filter((_, i) => i !== idx);
      updateData({ images: updated });
    } catch {
      Alert.alert("Error", "Failed to remove image. Please try again.");
    }
  };

  return (
    <View className="flex-1">
      <ScrollView className="flex-1 px-5 pt-6 pb-4" keyboardShouldPersistTaps="handled">
        <ThemedText className="text-3xl font-extrabold mb-2 tracking-tight">Photos</ThemedText>
        <ThemedText className="text-base text-gray-500 dark:text-gray-400 mb-8">
          Add up to {MAX_IMAGES} photos. The first photo becomes your cover image.
        </ThemedText>

        {/* Image Grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {images.map((img, idx) => (
            <View
              key={img.mediaId}
              className="relative rounded-2xl overflow-hidden"
              style={{ width: "47%", aspectRatio: 1 }}
            >
              <Image source={{ uri: img.localUri }} className="w-full h-full" resizeMode="cover" />

              {/* Cover badge */}
              {idx === 0 && (
                <View className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-full">
                  <ThemedText className="text-white text-xs font-bold">Cover</ThemedText>
                </View>
              )}

              {/* Remove button */}
              <TouchableOpacity
                onPress={() => handleRemoveImage(idx)}
                className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full"
              >
                <IconSymbol name="xmark" size={14} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Upload slot */}
          {images.length < MAX_IMAGES && (
            <TouchableOpacity
              onPress={handlePickImage}
              disabled={uploadingIdx !== null}
              className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 items-center justify-center"
              style={{ width: "47%", aspectRatio: 1 }}
            >
              {uploadingIdx !== null ? (
                <View className="items-center px-2">
                  <ActivityIndicator size="small" color={colors.tint} />
                  <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {uploadPhase}
                  </ThemedText>
                </View>
              ) : (
                <View className="items-center">
                  <IconSymbol name="plus" size={28} color={colors.text} />
                  <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Add Photo
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>

        {!hasAtLeastOne && (
          <View className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <ThemedText className="text-amber-700 dark:text-amber-400 text-sm font-medium">
              At least one photo is required to publish your experience.
            </ThemedText>
          </View>
        )}
      </ScrollView>

      <WizardFooter
        onNext={onNext}
        onPrev={onPrev}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isSaving={isSaving}
        nextDisabled={!hasAtLeastOne || uploadingIdx !== null}
      />
    </View>
  );
}
