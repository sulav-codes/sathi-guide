/**
 * lib/upload.ts
 * Modern Presigned-URL Upload Pipeline (Expo SDK 54+)
 */

import * as ImagePicker from "expo-image-picker";
import { File as ExpoFile } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
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
  experienceId?: string;
  onProgress?: (phase: "compressing" | "uploading" | "confirming") => void;
}

/**
 * Per-purpose compression targets.
 * `maxSizeBytes` MUST mirror the backend's MAX_FILE_SIZES — keep these in sync.
 * (Consider fetching these limits from the backend at app boot instead of
 * duplicating magic numbers, to avoid future drift.)
 */
interface CompressionConfig {
  maxWidth: number;
  maxHeight: number;
  initialQuality: number;
  minQuality: number;
  maxSizeBytes: number;
}

const COMPRESSION_CONFIG: Record<UploadPurpose, CompressionConfig> = {
  avatar: {
    maxWidth: 512,
    maxHeight: 512,
    initialQuality: 0.8,
    minQuality: 0.4,
    maxSizeBytes: 1 * 1024 * 1024, // 1 MB — matches backend
  },
  experience: {
    maxWidth: 1920,
    maxHeight: 1920,
    initialQuality: 0.8,
    minQuality: 0.4,
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB — matches backend
  },
  document: {
    maxWidth: 2048, // documents need more resolution to stay legible
    maxHeight: 2048,
    initialQuality: 0.85,
    minQuality: 0.5,
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB — matches backend
  },
};

const QUALITY_STEP = 0.15;
const MAX_COMPRESSION_ATTEMPTS = 4;

export async function pickAndUploadImage(
  options: UploadOptions,
): Promise<UploadResult | null> {
  const { purpose, experienceId, onProgress } = options;

  // 1. Permission + pick
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    throw new Error("Camera roll permission is required to upload photos.");
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 1,
    exif: false,
  });

  if (result.canceled || !result.assets[0]) return null;

  const asset = result.assets[0];
  const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;

  // 2. Compress — iteratively, targeting the purpose-specific size limit
  onProgress?.("compressing");
  const config = COMPRESSION_CONFIG[purpose];
  const { uri: compressedUri, size: compressedSize } = await compressToTarget(
    asset.uri,
    config,
  );

  if (__DEV__) {
    console.log(
      `[upload] compressed ${purpose} image to ${(compressedSize / 1024).toFixed(0)}KB`,
    );
  }
  const compressedMime = "image/jpeg";
  const compressedFilename = filename.replace(/\.[^.]+$/, ".jpg");

  // 3. Request presigned URL from backend
  const { uploadUrl, key } = await apiClient.requestPresignedUrl({
    purpose,
    mimeType: compressedMime,
    filename: compressedFilename,
    experienceId,
  });

  // 4. Upload binary directly using modern Object APIs
  onProgress?.("uploading");

  const filePath = compressedUri.startsWith("file://")
    ? compressedUri.replace("file://", "")
    : compressedUri;
  const localFile = new ExpoFile(filePath);

  const uploadResponse = await expoFetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": compressedMime,
    },
    body: localFile,
  });

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.text().catch(() => "Unknown error");
    throw new Error(`Upload failed (${uploadResponse.status}): ${errorBody}`);
  }

  // 5. Confirm with backend
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

/**
 * Compress an image, progressively lowering quality until it fits under
 * `config.maxSizeBytes`, or bail out with a clear error after a few attempts.
 *
 * This guarantees we never send a file to the presigned URL that the
 * backend's confirmUpload will reject for being oversized.
 */
async function compressToTarget(
  uri: string,
  config: CompressionConfig,
): Promise<{ uri: string; size: number }> {
  let quality = config.initialQuality;
  let lastSize = Infinity;
  let lastUri = uri;

  for (let attempt = 0; attempt < MAX_COMPRESSION_ATTEMPTS; attempt++) {
    const compressedUri = await Compressor.compress(uri, {
      compressionMethod: "auto",
      quality,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      output: "jpg",
      returnableOutputType: "uri",
    });

    const size = getFileSize(compressedUri);
    lastUri = compressedUri;
    lastSize = size;

    if (size <= config.maxSizeBytes) {
      return { uri: compressedUri, size };
    }

    if (quality <= config.minQuality) break;
    quality = Math.max(quality - QUALITY_STEP, config.minQuality);
  }

  throw new Error(
    `Could not compress image below ${(config.maxSizeBytes / 1024 / 1024).toFixed(1)}MB ` +
      `(best attempt: ${(lastSize / 1024 / 1024).toFixed(2)}MB, uri: ${lastUri}). ` +
      `Please choose a smaller or simpler image.`,
  );
}

/** Read a local file's size in bytes via expo-file-system. */
function getFileSize(uri: string): number {
  const filePath = uri.startsWith("file://") ? uri.replace("file://", "") : uri;
  try {
    const file = new ExpoFile(filePath);
    return file.size ?? Infinity;
  } catch {
    // If we can't stat it, treat as "unknown/too big" rather than silently proceeding
    return Infinity;
  }
}
