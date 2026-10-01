import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { requireAuthApi } from "@/lib/auth";
import { getObject } from "@/lib/r2";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ key: string[] }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuthApi();
  if (unauthorized) return unauthorized;

  const { key: keyParts } = await params;
  const key = keyParts.join("/");

  const env = await getEnv();
  const object = await getObject(env.PHOTOS_BUCKET, key);

  if (!object) {
    return NextResponse.json({ error: "ファイルが見つかりません" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
  headers.set("Cache-Control", "private, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);

  return new NextResponse(object.body as unknown as ReadableStream, { headers });
}
