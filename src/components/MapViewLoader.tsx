"use client";

import dynamic from "next/dynamic";
import type { Photo } from "@/lib/types";

const MapView = dynamic(() => import("./MapView").then((mod) => mod.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-[var(--color-ink-light)]">
      地図を読み込み中...
    </div>
  ),
});

export function MapViewLoader({ photos }: { photos: Photo[] }) {
  return <MapView photos={photos} />;
}
