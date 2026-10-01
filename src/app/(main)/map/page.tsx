import { getEnv } from "@/lib/cloudflare";
import { listPhotosWithLocation } from "@/lib/db";
import { MapViewLoader } from "@/components/MapViewLoader";

export default async function MapPage() {
  const env = await getEnv();
  const photos = await listPhotosWithLocation(env.DB);

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-heading text-lg text-[var(--color-ink)]">撮影地図</h2>
      {photos.length === 0 && (
        <p className="py-2 font-body text-sm text-[var(--color-ink-light)]">
          位置情報が付いた写真がまだありません。
        </p>
      )}
      <div className="mt-2 h-[70vh] overflow-hidden rounded-lg border border-[var(--color-border)]">
        <MapViewLoader photos={photos} />
      </div>
    </div>
  );
}
