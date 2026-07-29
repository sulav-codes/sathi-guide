import React, { useState } from "react";
import { View, TouchableOpacity, Image, ActivityIndicator, Alert } from "react-native";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "./icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { pickAndUploadImage, UploadPurpose } from "@/lib/upload";

interface ImageUploadPickerProps {
  purpose: UploadPurpose;
  onUploadComplete: (mediaId: string, localUri: string) => void;
  onRemove: () => void;
  currentImageUri?: string;
  label?: string;
  description?: string;
}

export function ImageUploadPicker({
  purpose,
  onUploadComplete,
  onRemove,
  currentImageUri,
  label = "Upload Image",
  description,
}: ImageUploadPickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<"compressing" | "uploading" | "confirming" | null>(null);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const handlePick = async () => {
    try {
      setIsUploading(true);
      const result = await pickAndUploadImage(purpose, (phase) => {
        setProgress(phase);
      });

      if (result) {
        onUploadComplete(result.mediaId, result.localUri);
      }
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message || "An unexpected error occurred.");
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  };

  const getProgressText = () => {
    switch (progress) {
      case "compressing": return "Compressing image...";
      case "uploading": return "Uploading to server...";
      case "confirming": return "Confirming upload...";
      default: return "Processing...";
    }
  };

  return (
    <View className="mb-8">
      <View className="mb-3">
        <ThemedText className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          {label}
        </ThemedText>
        {description && (
          <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {description}
          </ThemedText>
        )}
      </View>

      {currentImageUri ? (
        <View className="relative w-full h-48 rounded-2xl overflow-hidden border border-gray-200 dark:border-neutral-800">
          <Image source={{ uri: currentImageUri }} className="w-full h-full" resizeMode="cover" />
          <TouchableOpacity
            onPress={onRemove}
            className="absolute top-3 right-3 bg-black/60 p-2 rounded-full backdrop-blur-md"
          >
            <IconSymbol name="xmark" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={handlePick}
          disabled={isUploading}
          className="w-full h-48 rounded-2xl border-2 border-dashed border-gray-300 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-900 items-center justify-center"
        >
          {isUploading ? (
            <View className="items-center">
              <ActivityIndicator size="large" color={colors.tint} />
              <ThemedText className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                {getProgressText()}
              </ThemedText>
            </View>
          ) : (
            <View className="items-center">
              <View className="bg-gray-100 dark:bg-neutral-800 p-4 rounded-full mb-3">
                <IconSymbol name="photo" size={28} color={colors.text} />
              </View>
              <ThemedText className="font-semibold text-gray-700 dark:text-gray-300">
                Tap to select image
              </ThemedText>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
