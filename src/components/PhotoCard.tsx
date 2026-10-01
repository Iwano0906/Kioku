import Link from "next/link";
import type { Photo } from "@/lib/types";

function rotationFor(id: string): number {
  let sum = 0;
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
  return (sum % 7) - 3; // -3deg 〜 3deg
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

export function PhotoCard({ photo }: { photo: Photo }) {
  const rotation = rotationFor(photo.id);

  return (
    <Link
      href={`/photos/${photo.id}`}
      className="polaroid block"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="aspect-square w-full overflow-hidden bg-[var(--color-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/files/${photo.thumbnailKey}`}
          alt={photo.caption ?? "旅の写真"}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <p className="mt-2 truncate font-body text-xs text-[var(--color-ink-light)]">
        {formatDate(photo.takenAt ?? photo.createdAt)}
      </p>
      {photo.caption && (
        <p className="truncate font-body text-sm text-[var(--color-ink)]">
          {photo.caption}
        </p>
      )}
    </Link>
  );
}
