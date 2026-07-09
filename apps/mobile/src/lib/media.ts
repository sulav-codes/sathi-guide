// src/lib/media.ts

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-supabase-url.supabase.co";
const BUCKET_NAME = "sathi-media"; // Change this if different

/**
 * Returns a display URL for a given media ID.
 * If mediaId is already a full URL (e.g. from mock data), it returns it as is.
 * Otherwise, it constructs the Supabase public URL.
 */
export function getMediaUrl(mediaId: string | null): string | null {
  if (!mediaId) return null;

  if (mediaId.startsWith("http://") || mediaId.startsWith("https://")) {
    return mediaId;
  }

  // Assuming the backend stores the file path in the bucket as the mediaId
  // and the bucket is public for read access.
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${mediaId}`;
}

/**
 * Uploads a file to Supabase using a presigned URL.
 * 
 * @param presignedUrl The URL obtained from the backend
 * @param uri The local file URI (e.g. from expo-image-picker)
 * @param mimeType The file MIME type (e.g. 'image/jpeg')
 */
export async function uploadToPresignedUrl(
  presignedUrl: string,
  uri: string,
  mimeType: string
): Promise<void> {
  const response = await fetch(uri);
  const blob = await response.blob();

  const uploadResponse = await fetch(presignedUrl, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
    },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload failed with status: ${uploadResponse.status}`);
  }
}
