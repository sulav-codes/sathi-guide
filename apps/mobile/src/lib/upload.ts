import * as ImagePicker from "expo-image-picker";
import { File as ExpoFile } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { apiClient } from "./api";

export type UploadPurpose = "EXPERIENCE" | "AVATAR" | "DOCUMENT";

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
 * Per-purpose compression configuration.
 *
 * Purpose            | Max size | Output | Dimensions    | Aspect
 * ------------------- | -------- | ------ | ------------- | ------
 * experience (cover)  | 2 MB     | WebP   | 1200 × 900    | 4:3
 * avatar              | 1 MB     | WebP   |  512 × 512    | 1:1
 * document            | 5 MB     | WebP   | original      | unchanged
 */
interface CompressionConfig {
  maxWidth: number;
  maxHeight: number;
  initialQuality: number;
  minQuality: number;
  maxSizeBytes: number;
  output: "jpg" | "png" | "webp";
}

const COMPRESSION_CONFIG: Record<UploadPurpose, CompressionConfig> = {
  EXPERIENCE: {
    maxWidth: 1200,
    maxHeight: 900,
    initialQuality: 0.85,
    minQuality: 0.5,
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    output: "webp",
  },
  AVATAR: {
    maxWidth: 512,
    maxHeight: 512,
    initialQuality: 0.85,
    minQuality: 0.45,
    maxSizeBytes: 1 * 1024 * 1024, // 1 MB
    output: "webp",
  },
  DOCUMENT: {
    maxWidth: 8192,
    maxHeight: 8192,
    initialQuality: 0.9,
    minQuality: 0.6,
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    output: "webp",
  },
};

// MIME type derived from the output format
const OUTPUT_MIME: Record<CompressionConfig["output"], string> = {
  webp: "image/webp",
  jpg: "image/jpeg",
  png: "image/png",
};

const QUALITY_STEP = 0.1;
const MAX_COMPRESSION_ATTEMPTS = 5;

export async function pickAndUploadImage(
  options: UploadOptions,
): Promise<UploadResult | null> {
  const { purpose, experienceId, onProgress } = options;

  // Guard: experience uploads must always have an experienceId.
  if (purpose === "EXPERIENCE" && !experienceId) {
    throw new Error(
      "Upload failed: experience ID is not available. Please go back to the first step and try again.",
    );
  }

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
  const config = COMPRESSION_CONFIG[purpose];

  // Compress
  onProgress?.("compressing");

  const { uri: compressedUri, size: compressedSize } = await compressToTarget(
    asset,
    config,
  );

  const compressedMime = OUTPUT_MIME[config.output];
  const baseFilename = asset.fileName ?? `photo_${Date.now()}`;
  const compressedFilename = baseFilename.replace(/\.[^.]+$/, `.${config.output}`);

  if (__DEV__) {
    console.log(
      `[upload] ${purpose} → ${config.output.toUpperCase()} ` +
        `${(compressedSize / 1024).toFixed(0)} KB  (${compressedMime})`,
    );
  }

  // Request presigned URL
  const { uploadUrl, key } = await apiClient.requestPresignedUrl({
    purpose,
    mimeType: compressedMime,
    filename: compressedFilename,
    experienceId,
  });

  // Upload binary
  onProgress?.("uploading");

  const localFile = new ExpoFile(compressedUri);

  const uploadResponse = await expoFetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": compressedMime },
    body: localFile,
  });

  if (!uploadResponse.ok) {
    const errorBody = await uploadResponse.text().catch(() => "Unknown error");
    throw new Error(`Upload failed (${uploadResponse.status}): ${errorBody}`);
  }

  // Confirm with backend
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

// Private helpers

async function compressToTarget(
  asset: ImagePicker.ImagePickerAsset,
  config: CompressionConfig,
): Promise<{ uri: string; size: number }> {
  let quality = config.initialQuality;
  let lastSize = Infinity;

  let resizeWidth = asset.width;
  let resizeHeight = asset.height;

  if (resizeWidth > config.maxWidth || resizeHeight > config.maxHeight) {
    const ratio = Math.min(config.maxWidth / resizeWidth, config.maxHeight / resizeHeight);
    resizeWidth = Math.round(resizeWidth * ratio);
    resizeHeight = Math.round(resizeHeight * ratio);
  }

  const format = 
    config.output === "webp" ? SaveFormat.WEBP :
    config.output === "png" ? SaveFormat.PNG :
    SaveFormat.JPEG;

  for (let attempt = 0; attempt < MAX_COMPRESSION_ATTEMPTS; attempt++) {
    // SDK 52+ Context API
    const context = ImageManipulator.manipulate(asset.uri);
    context.resize({ width: resizeWidth, height: resizeHeight });
    
    const imageRef = await context.renderAsync();
    const result = await imageRef.saveAsync({
      compress: quality,
      format,
    });

    const size = getFileSize(result.uri);
    lastSize = size;

    if (__DEV__) {
      console.log(
        `[upload] attempt ${attempt + 1}: quality=${quality.toFixed(2)} ` +
          `size=${(size / 1024).toFixed(0)} KB  ` +
          `target=${(config.maxSizeBytes / 1024).toFixed(0)} KB`,
      );
    }

    if (size <= config.maxSizeBytes) {
      return { uri: result.uri, size };
    }

    if (quality <= config.minQuality) break;
    quality = Math.max(quality - QUALITY_STEP, config.minQuality);
  }

  throw new Error(
    `Could not compress image below ${(config.maxSizeBytes / 1024 / 1024).toFixed(1)} MB ` +
      `(best attempt: ${(lastSize / 1024 / 1024).toFixed(2)} MB). ` +
      `Please choose a smaller or simpler image.`,
  );
}

/** Read a local file's size synchronously via the new ExpoFile API. */
function getFileSize(uri: string): number {
  try {
    const file = new ExpoFile(uri);
    const size = file.size;

    if (size == null) {
      if (__DEV__) {
        console.warn(`[upload] getFileSize: null size for ${uri}`);
      }
      return Infinity;
    }

    return size;
  } catch (err) {
    if (__DEV__) {
      console.warn(`[upload] getFileSize threw for ${uri}:`, err);
    }
    return Infinity;
  }
}
