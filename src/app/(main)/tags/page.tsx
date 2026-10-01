import { getEnv } from "@/lib/cloudflare";
import { listPhotos, listTags } from "@/lib/db";
import { PhotoGrid } from "@/components/PhotoGrid";
import { TagFilterBar } from "@/components/TagFilterBar";

interface PageProps {
  searchParams: Promise<{ tag?: string }>;
}

export default async function TagsPage({ searchParams }: PageProps) {
  const { tag } = await searchParams;
  const env = await getEnv();
  const [tags, photos] = await Promise.all([
    listTags(env.DB),
    listPhotos(env.DB, tag),
  ]);

  return (
    <div>
      <h2 className="font-heading text-lg text-[var(--color-ink)]">タグで探す</h2>
      <TagFilterBar tags={tags} activeTag={tag} />
      <PhotoGrid photos={photos} />
    </div>
  );
}
