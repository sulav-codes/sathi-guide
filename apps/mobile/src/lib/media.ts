// src/lib/media.ts

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
