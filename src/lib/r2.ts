import type { R2Bucket } from "@cloudflare/workers-types";

export async function putObject(
  bucket: R2Bucket,
  key: string,
  data: ArrayBuffer,
  contentType: string
): Promise<void> {
  await bucket.put(key, data, {
    httpMetadata: { contentType },
  });
}

export async function getObject(bucket: R2Bucket, key: string) {
  return bucket.get(key);
}

export async function deleteObject(bucket: R2Bucket, key: string): Promise<void> {
  await bucket.delete(key);
}

export function makeObjectKey(photoId: string, kind: "original" | "thumb", ext: string): string {
  return `photos/${photoId}/${kind}.${ext}`;
}
