import { getEnv } from "@/lib/cloudflare";
import { listPhotos } from "@/lib/db";
import { PhotoGrid } from "@/components/PhotoGrid";

export default async function HomePage() {
  const env = await getEnv();
  const photos = await listPhotos(env.DB);

  return (
    <div>
      <h2 className="font-heading text-lg text-[var(--color-ink)]">思い出一覧</h2>
      <PhotoGrid photos={photos} />
    </div>
  );
}
