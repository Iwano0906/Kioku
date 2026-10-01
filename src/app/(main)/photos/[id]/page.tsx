import { notFound } from "next/navigation";
import { getEnv } from "@/lib/cloudflare";
import { getPhoto } from "@/lib/db";
import { PhotoDetail } from "@/components/PhotoDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PhotoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const env = await getEnv();
  const photo = await getPhoto(env.DB, id);

  if (!photo) {
    notFound();
  }

  return <PhotoDetail photo={photo} />;
}
