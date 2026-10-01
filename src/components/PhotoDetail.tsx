"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Photo } from "@/lib/types";

function formatDateTime(iso: string | null): string {
  if (!iso) return "撮影日時不明";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "撮影日時不明";
  return date.toLocaleString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PhotoDetail({ photo }: { photo: Photo }) {
  const router = useRouter();
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [tags, setTags] = useState(photo.tags.map((t) => t.name).join(", "));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSavedMessage(null);

    const res = await fetch(`/api/photos/${photo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption, tags }),
    });

    if (res.ok) {
      setSavedMessage("保存しました");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "保存に失敗しました");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm("この写真を削除しますか？この操作は取り消せません。")) return;

    setDeleting(true);
    setError(null);

    const res = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "削除に失敗しました");
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="polaroid">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/files/${photo.fileKey}`}
          alt={photo.caption ?? "旅の写真"}
          className="w-full rounded-sm object-contain"
        />
      </div>

      <p className="font-body text-sm text-[var(--color-ink-light)]">
        {formatDateTime(photo.takenAt)}
      </p>

      <label className="flex flex-col gap-1 text-sm text-[var(--color-ink)]">
        キャプション
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
          className="rounded-md border border-[var(--color-border)] bg-white/70 px-3 py-2 outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-[var(--color-ink)]">
        タグ（カンマ区切り）
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="rounded-md border border-[var(--color-border)] bg-white/70 px-3 py-2 outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {savedMessage && <p className="text-sm text-green-700">{savedMessage}</p>}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 rounded-md bg-[var(--color-accent)] py-2.5 font-body font-medium text-[var(--color-frame)] disabled:opacity-60"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 rounded-md border border-red-700 py-2.5 font-body font-medium text-red-700 disabled:opacity-60"
        >
          {deleting ? "削除中..." : "削除"}
        </button>
      </div>
    </div>
  );
}
