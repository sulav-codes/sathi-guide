import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import { useState } from "react";
import { ImageUploadPicker } from "@/components/ui/ImageUploadPicker";
import { UploadPurpose } from "@/lib/upload";
import { useSubmitGuideDocument } from "@/hooks/use-guides";

const DOCUMENT_TYPES = [
  { id: "CITIZENSHIP", label: "Citizenship" },
  { id: "PASSPORT", label: "Passport" },
  { id: "NATIONAL_ID", label: "National ID" },
  { id: "DRIVING_LICENSE", label: "Driving License" },
];

export default function KYCVerificationScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === "dark" ? "dark" : "light"];

  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0].id);
  const [documentNumber, setDocumentNumber] = useState("");
  const [frontImageId, setFrontImageId] = useState<string | null>(null);
  const [backImageId, setBackImageId] = useState<string | null>(null);
  const [selfieImageId, setSelfieImageId] = useState<string | null>(null);

  const [frontImageUri, setFrontImageUri] = useState<string>();
  const [backImageUri, setBackImageUri] = useState<string>();
  const [selfieImageUri, setSelfieImageUri] = useState<string>();

  const submitMutation = useSubmitGuideDocument();

  const isDrivingLicense = documentType === "DRIVING_LICENSE";
  
  const canSubmit = 
    documentNumber.trim().length > 0 &&
    frontImageId !== null &&
    (isDrivingLicense || backImageId !== null);

  const handleSubmit = () => {
    if (!canSubmit) return;
    
    submitMutation.mutate({
      documentType,
      documentNumber,
      frontImageId,
      backImageId: isDrivingLicense ? undefined : backImageId,
      selfieImageId,
    }, {
      onSuccess: () => {
        Alert.alert("Success", "Document submitted successfully for verification.");
        router.back();
      },
      onError: (err: any) => {
        Alert.alert("Error", err.message || "Failed to submit document.");
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Mountain Banner Header */}
      <View className="relative h-48 w-full bg-blue-500 overflow-hidden rounded-b-3xl">
        <Image
          source={require("@/assets/images/sathi_guide_header.png")}
          style={{ width: "100%", height: "100%", position: "absolute", opacity: 0.8 }}
          contentFit="cover"
        />
        <SafeAreaView className="flex-1">
          <View className="px-5 pt-2 flex-row items-center">
            <TouchableOpacity 
              onPress={() => router.back()} 
              className="w-10 h-10 rounded-full bg-black/40 items-center justify-center backdrop-blur-md"
            >
              <IconSymbol name="chevron.left" size={24} color="#FFF" />
            </TouchableOpacity>
            <View className="flex-1 items-center mr-10">
              <Text className="text-white font-extrabold text-xl">Identity Verification</Text>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView 
        className="flex-1 px-5 -mt-10" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View 
          className="rounded-3xl p-6 shadow-sm mb-6"
          style={{ backgroundColor: colors.card, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 }}
        >
          <Text className="text-base font-bold mb-3" style={{ color: colors.text }}>Document Type</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {DOCUMENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                onPress={() => {
                  setDocumentType(type.id);
                  if (type.id === "DRIVING_LICENSE") {
                    setBackImageId(null);
                    setBackImageUri(undefined);
                  }
                }}
                className={`px-4 py-2 rounded-full border ${documentType === type.id ? 'border-primary' : ''}`}
                style={{
                  backgroundColor: documentType === type.id ? `${colors.primary}15` : colors.background,
                  borderColor: documentType === type.id ? colors.primary : colors.border
                }}
              >
                <Text style={{ 
                  color: documentType === type.id ? colors.primary : colors.text,
                  fontWeight: documentType === type.id ? "600" : "400"
                }}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-base font-bold mb-2" style={{ color: colors.text }}>Document Number</Text>
          <View 
            className="rounded-xl border px-4 py-3 mb-6"
            style={{ borderColor: colors.border, backgroundColor: colors.background }}
          >
            <TextInput
              placeholder="Enter Document ID Number"
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text, fontSize: 16 }}
              value={documentNumber}
              onChangeText={setDocumentNumber}
            />
          </View>

          <ImageUploadPicker
            purpose={"DOCUMENT" as UploadPurpose}
            label="Front Photo"
            description="Clear photo of the front of your document"
            currentImageUri={frontImageUri}
            onUploadComplete={(mediaId, uri) => {
              setFrontImageId(mediaId);
              setFrontImageUri(uri);
            }}
            onRemove={() => {
              setFrontImageId(null);
              setFrontImageUri(undefined);
            }}
          />

          {!isDrivingLicense && (
            <ImageUploadPicker
              purpose={"DOCUMENT" as UploadPurpose}
              label="Back Photo"
              description="Clear photo of the back of your document"
              currentImageUri={backImageUri}
              onUploadComplete={(mediaId, uri) => {
                setBackImageId(mediaId);
                setBackImageUri(uri);
              }}
              onRemove={() => {
                setBackImageId(null);
                setBackImageUri(undefined);
              }}
            />
          )}

          <ImageUploadPicker
            purpose={"DOCUMENT" as UploadPurpose}
            label="Selfie (Optional)"
            description="Clear front-facing photo of yourself"
            currentImageUri={selfieImageUri}
            onUploadComplete={(mediaId, uri) => {
              setSelfieImageId(mediaId);
              setSelfieImageUri(uri);
            }}
            onRemove={() => {
              setSelfieImageId(null);
              setSelfieImageUri(undefined);
            }}
          />

          <TouchableOpacity
            className="py-4 rounded-2xl items-center mt-4"
            style={{ 
              backgroundColor: canSubmit ? colors.primary : colors.border,
            }}
            disabled={!canSubmit || submitMutation.isPending}
            onPress={handleSubmit}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text className="text-white font-bold text-base">Submit for Verification</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
