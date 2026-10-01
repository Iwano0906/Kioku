import exifr from "exifr";

export interface ExtractedMeta {
  takenAt: string | null;
  latitude: number | null;
  longitude: number | null;
}

export async function extractPhotoMeta(file: File): Promise<ExtractedMeta> {
  try {
    const output = await exifr.parse(file, {
      gps: true,
      pick: ["DateTimeOriginal", "CreateDate", "latitude", "longitude"],
    });
    const takenAtDate: unknown = output?.DateTimeOriginal ?? output?.CreateDate;
    return {
      takenAt: takenAtDate instanceof Date ? takenAtDate.toISOString() : null,
      latitude: typeof output?.latitude === "number" ? output.latitude : null,
      longitude: typeof output?.longitude === "number" ? output.longitude : null,
    };
  } catch {
    return { takenAt: null, latitude: null, longitude: null };
  }
}

export async function createThumbnail(
  file: File,
  maxDimension = 800,
  quality = 0.8
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("サムネイル生成に失敗しました"))),
      "image/jpeg",
      quality
    );
  });
}
