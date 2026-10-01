import { NextRequest, NextResponse } from "next/server";
import { getEnv } from "@/lib/cloudflare";
import { requireAuthApi } from "@/lib/auth";
import { createPhoto } from "@/lib/db";
import { putObject, makeObjectKey } from "@/lib/r2";

export const runtime = "nodejs";

interface FileMeta {
  takenAt: string | null;
  latitude: number | null;
  longitude: number | null;
}

function extFromName(name: string, fallback: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(name);
  return match ? match[1].toLowerCase() : fallback;
}

function parseMeta(raw: string | undefined): FileMeta {
  if (!raw) return { takenAt: null, latitude: null, longitude: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      takenAt: typeof parsed.takenAt === "string" ? parsed.takenAt : null,
      latitude: typeof parsed.latitude === "number" ? parsed.latitude : null,
      longitude: typeof parsed.longitude === "number" ? parsed.longitude : null,
    };
  } catch {
    return { takenAt: null, latitude: null, longitude: null };
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAuthApi();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const files = formData.getAll("file").filter((v): v is File => v instanceof File);
  const thumbnails = formData
    .getAll("thumbnail")
    .filter((v): v is File => v instanceof File);
  const metaEntries = formData.getAll("meta").map((v) => String(v));
  const caption = ((formData.get("caption") as string | null) ?? "").trim() || null;
  const tagsRaw = (formData.get("tags") as string | null) ?? "";
  const tagNames = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  if (files.length === 0) {
    return NextResponse.json({ error: "ファイルがありません" }, { status: 400 });
  }
  if (files.length !== thumbnails.length || files.length !== metaEntries.length) {
    return NextResponse.json({ error: "リクエストの形式が不正です" }, { status: 400 });
  }

  const env = await getEnv();
  const createdIds: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const thumbnail = thumbnails[i];
    const meta = parseMeta(metaEntries[i]);

    const storageId = crypto.randomUUID();
    const originalExt = extFromName(file.name, "jpg");
    const thumbExt = extFromName(thumbnail.name, "jpg");
    const fileKey = makeObjectKey(storageId, "original", originalExt);
    const thumbnailKey = makeObjectKey(storageId, "thumb", thumbExt);

    await putObject(
      env.PHOTOS_BUCKET,
      fileKey,
      await file.arrayBuffer(),
      file.type || "image/jpeg"
    );
    await putObject(
      env.PHOTOS_BUCKET,
      thumbnailKey,
      await thumbnail.arrayBuffer(),
      thumbnail.type || "image/jpeg"
    );

    const photo = await createPhoto(env.DB, {
      fileKey,
      thumbnailKey,
      caption,
      takenAt: meta.takenAt,
      latitude: meta.latitude,
      longitude: meta.longitude,
      tagNames,
    });
    createdIds.push(photo.id);
  }

  return NextResponse.json({ ids: createdIds }, { status: 201 });
}
