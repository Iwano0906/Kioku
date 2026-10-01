"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createThumbnail, extractPhotoMeta } from "@/lib/clientPhoto";

export function UploadForm() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })),
    [files]
  );

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files ? Array.from(e.target.files) : []);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) {
      setError("写真を選択してください");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("caption", caption);
      formData.set("tags", tags);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setStatusText(`処理中... (${i + 1}/${files.length})`);

        const [meta, thumbnail] = await Promise.all([
          extractPhotoMeta(file),
          createThumbnail(file),
        ]);

        formData.append("file", file);
        formData.append("thumbnail", thumbnail, "thumb.jpg");
        formData.append("meta", JSON.stringify(meta));
      }

      setStatusText("アップロード中...");
      const res = await fetch("/api/upload", { method: "POST", body: formData });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "アップロードに失敗しました");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "アップロードに失敗しました");
      setSubmitting(false);
      setStatusText(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="polaroid flex cursor-pointer flex-col items-center justify-center gap-2 py-10 text-center">
        <span className="text-3xl">📸</span>
        <span className="font-body text-sm text-[var(--color-ink)]">
          {files.length > 0 ? `${files.length}枚を選択中` : "写真を選択"}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {previews.map((preview) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={preview.url}
              src={preview.url}
              alt={preview.name}
              className="aspect-square w-full rounded object-cover"
            />
          ))}
        </div>
      )}

      <label className="flex flex-col gap-1 text-sm text-[var(--color-ink)]">
        キャプション（任意・全体に共通）
        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="例：沖縄の夕日がきれいだった"
          className="rounded-md border border-[var(--color-border)] bg-white/70 px-3 py-2 outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-[var(--color-ink)]">
        タグ（任意・カンマ区切り）
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="例：沖縄, 家族, 海"
          className="rounded-md border border-[var(--color-border)] bg-white/70 px-3 py-2 outline-none focus:border-[var(--color-accent)]"
        />
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[var(--color-accent)] py-2.5 font-body font-medium text-[var(--color-frame)] disabled:opacity-60"
      >
        {submitting ? statusText ?? "処理中..." : "アップロード"}
      </button>
    </form>
  );
}
