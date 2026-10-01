import type { Photo } from "@/lib/types";
import { PhotoCard } from "./PhotoCard";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center text-[var(--color-ink-light)]">
        <span className="text-3xl">🗒️</span>
        <p className="font-body text-sm">まだ写真がありません。</p>
        <p className="font-body text-xs">「追加」タブから旅の写真をアップロードしましょう。</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 py-2">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
}
