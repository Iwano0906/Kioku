import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { requireAuthApi } from "@/lib/auth";
import { listPhotos } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const unauthorized = await requireAuthApi();
  if (unauthorized) return unauthorized;

  const tag = request.nextUrl.searchParams.get("tag") ?? undefined;
  const env = await getEnv();
  const photos = await listPhotos(env.DB, tag);
  return NextResponse.json({ photos });
}
