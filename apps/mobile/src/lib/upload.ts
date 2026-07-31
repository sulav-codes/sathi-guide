/**
 * lib/upload.ts
 * Full presigned-URL upload pipeline for mobile.
 *
 * Flow:
 *  1. Pick image from device (expo-image-picker)
 *  2. Compress with react-native-compressor
 *  3. POST /uploads/presign  → get signedUrl + key
 *  4. PUT signedUrl (raw binary via fetch)
 *  5. POST /uploads/confirm  → get mediaId + publicUrl
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

export interface UploadOptions {
  purpose: UploadPurpose;
  /** Required when purpose is 'experience' — scopes the storage path */
  experienceId?: string;
  onProgress?: (phase: "compressing" | "uploading" | "confirming") => void;
}

/**
 * Pick one image from the device library and upload it.
 * Returns null if the user cancels.
 */
export async function pickAndUploadImage(
  options: UploadOptions,
): Promise<UploadResult | null> {
  const { purpose, experienceId, onProgress } = options;

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
  const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;

  // 2. Compress image (outputs JPEG)
  onProgress?.("compressing");
  const compressedUri = await Compressor.compress(asset.uri, {
    compressionMethod: "auto",
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1920,
    output: "jpg",
    returnableOutputType: "uri",
  });

  const compressedMime = "image/jpeg"; // compressor always outputs jpg
  const compressedFilename = filename.replace(/\.[^.]+$/, ".jpg");

  // 3. Request presigned URL from backend (backend generates the storage path)
  const { uploadUrl, key } = await apiClient.requestPresignedUrl({
    purpose,
    mimeType: compressedMime,
    filename: compressedFilename,
    experienceId,
  });

  // 4. Upload binary directly to Supabase — backend never touches the file bytes
  onProgress?.("uploading");
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": compressedMime },
    body: await uriToBlob(compressedUri),
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text().catch(() => "");
    throw new Error(`Upload failed (${uploadResponse.status}): ${text}`);
  }

  // 5. Confirm with backend — creates Media row, returns mediaId
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
