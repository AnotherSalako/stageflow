/**
 * Downscales and re-encodes an image in the browser before it's ever uploaded.
 * A phone camera photo can be 4-8MB; nobody browsing StageFlow on mobile data
 * needs full resolution for a profile photo or portfolio thumbnail. This runs
 * client-side via canvas, so slow uploads and slow page loads both shrink.
 */
export async function compressImage(file: File, maxDimension = 1600, quality = 0.8): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file; // GIFs and non-images pass through untouched (canvas would drop animation)
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob || blob.size >= file.size) return file; // never ship a "compressed" file that's bigger

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
