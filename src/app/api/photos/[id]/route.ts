import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { requireAuthApi } from "@/lib/auth";
import { deletePhoto, getPhoto, updatePhoto } from "@/lib/db";
import { deleteObject } from "@/lib/r2";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuthApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const env = await getEnv();
  const photo = await getPhoto(env.DB, id);
  if (!photo) {
    return NextResponse.json({ error: "写真が見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ photo });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuthApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "リクエストの形式が不正です" }, { status: 400 });
  }

  const patch: { caption?: string | null; tagNames?: string[] } = {};
  if ("caption" in body) {
    patch.caption = typeof body.caption === "string" ? body.caption.trim() || null : null;
  }
  if ("tags" in body && typeof body.tags === "string") {
    patch.tagNames = body.tags
      .split(",")
      .map((t: string) => t.trim())
      .filter(Boolean);
  }

  const env = await getEnv();
  const photo = await updatePhoto(env.DB, id, patch);
  if (!photo) {
    return NextResponse.json({ error: "写真が見つかりません" }, { status: 404 });
  }
  return NextResponse.json({ photo });
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuthApi();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const env = await getEnv();
  const photo = await deletePhoto(env.DB, id);
  if (!photo) {
    return NextResponse.json({ error: "写真が見つかりません" }, { status: 404 });
  }

  await deleteObject(env.PHOTOS_BUCKET, photo.fileKey);
  await deleteObject(env.PHOTOS_BUCKET, photo.thumbnailKey);

  return NextResponse.json({ ok: true });
}
