import Link from "next/link";
import type { Tag } from "@/lib/types";

export function TagFilterBar({
  tags,
  activeTag,
}: {
  tags: Tag[];
  activeTag?: string;
}) {
  if (tags.length === 0) {
    return (
      <p className="py-4 text-center font-body text-sm text-[var(--color-ink-light)]">
        タグはまだありません。アップロード時に追加できます。
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 py-3">
      <Link
        href="/tags"
        className={`rounded-full border px-3 py-1 text-sm font-body transition-colors ${
          !activeTag
            ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-frame)]"
            : "border-[var(--color-border)] text-[var(--color-ink)]"
        }`}
      >
        すべて
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tags?tag=${encodeURIComponent(tag.name)}`}
          className={`rounded-full border px-3 py-1 text-sm font-body transition-colors ${
            activeTag === tag.name
              ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-frame)]"
              : "border-[var(--color-border)] text-[var(--color-ink)]"
          }`}
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
