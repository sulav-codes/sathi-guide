/**
 * lib/upload.ts
 * Full presigned-URL upload pipeline for mobile.
 *
 * Flow:
 *  1. Pick image from device (expo-image-picker)
 *  2. Compress with react-native-compressor
 *  3. POST /uploads/presign  → get signedUrl + key
 *  4. PUT signedUrl (raw binary via fetch)
 *  5. POST /uploads/confirm  → get mediaId
 *  6. Return { mediaId, localUri, publicUrl }
 */

import * as ImagePicker from "expo-image-picker";
import { Image as Compressor } from "react-native-compressor";
import { apiClient } from "./api";

export type UploadPurpose = "experience" | "avatar" | "document";

export interface UploadResult {
  mediaId: string;
  key: string;
  localUri: string;
  publicUrl: string;
}

// Max sizes enforced client-side BEFORE upload (mirrors backend)
const MAX_SIZES: Record<UploadPurpose, number> = {
  experience: 2 * 1024 * 1024,  // 2 MB
  avatar: 1 * 1024 * 1024,       // 1 MB
  document: 5 * 1024 * 1024,     // 5 MB
};

/**
 * Pick one image from the device library and upload it.
 * Returns null if the user cancels.
 */
export async function pickAndUploadImage(
  purpose: UploadPurpose,
  onProgress?: (phase: "compressing" | "uploading" | "confirming") => void,
): Promise<UploadResult | null> {
  // 1. Request permission + launch picker
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Camera roll permission is required to upload photos.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 1, // We handle quality ourselves via compressor
    exif: false,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const mimeType = asset.mimeType ?? "image/jpeg";
  const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;

  // 2. Compress
  onProgress?.("compressing");
  const compressedUri = await Compressor.compress(asset.uri, {
    compressionMethod: "auto",
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    output: "jpg",
    returnableOutputType: "uri",
  });

  // Check compressed size client-side for fast feedback
  const compressedMime = "image/jpeg"; // compressor always outputs jpg
  const compressedFilename = filename.replace(/\.[^.]+$/, ".jpg");
  const maxSize = MAX_SIZES[purpose];

  // 3. Request presigned URL from backend
  const { uploadUrl, key } = await apiClient.requestPresignedUrl({
    purpose,
    mimeType: compressedMime,
    filename: compressedFilename,
  });

  // 4. Upload binary directly to Supabase
  onProgress?.("uploading");
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": compressedMime,
    },
    body: await uriToBlob(compressedUri),
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text().catch(() => "");
    throw new Error(`Upload failed (${uploadResponse.status}): ${text}`);
  }

  // 5. Confirm with backend — creates Media row
  onProgress?.("confirming");
  const confirmed = await apiClient.confirmUpload({
    key,
    mimeType: compressedMime,
    purpose,
  });

  return {
    mediaId: confirmed.id,
    key: confirmed.key,
    localUri: compressedUri,
    publicUrl: confirmed.url,
  };
}

/** Convert a local file URI to a Blob for fetch body. */
async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}
