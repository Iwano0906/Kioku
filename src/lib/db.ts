import type { D1Database } from "@cloudflare/workers-types";
import type { NewPhotoInput, Photo, Tag, UpdatePhotoInput } from "./types";

interface PhotoRow {
  id: string;
  file_key: string;
  thumbnail_key: string;
  caption: string | null;
  taken_at: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  tag_ids: string | null;
  tag_names: string | null;
}

const TAG_SEPARATOR = String.fromCharCode(1);

function rowToPhoto(row: PhotoRow): Photo {
  const tagIds = row.tag_ids ? row.tag_ids.split(TAG_SEPARATOR) : [];
  const tagNames = row.tag_names ? row.tag_names.split(TAG_SEPARATOR) : [];
  const tags: Tag[] = tagIds.map((id, i) => ({ id, name: tagNames[i] }));
  return {
    id: row.id,
    fileKey: row.file_key,
    thumbnailKey: row.thumbnail_key,
    caption: row.caption,
    takenAt: row.taken_at,
    latitude: row.latitude,
    longitude: row.longitude,
    createdAt: row.created_at,
    tags,
  };
}

const PHOTO_SELECT = `
  SELECT
    p.id, p.file_key, p.thumbnail_key, p.caption, p.taken_at, p.latitude, p.longitude, p.created_at,
    GROUP_CONCAT(t.id, char(1)) AS tag_ids,
    GROUP_CONCAT(t.name, char(1)) AS tag_names
  FROM photos p
  LEFT JOIN photo_tags pt ON pt.photo_id = p.id
  LEFT JOIN tags t ON t.id = pt.tag_id
`;

export async function listPhotos(
  db: D1Database,
  tagName?: string
): Promise<Photo[]> {
  const where = tagName
    ? `WHERE p.id IN (
        SELECT pt2.photo_id FROM photo_tags pt2
        JOIN tags t2 ON t2.id = pt2.tag_id
        WHERE t2.name = ?
      )`
    : "";
  const query = `${PHOTO_SELECT} ${where} GROUP BY p.id ORDER BY COALESCE(p.taken_at, p.created_at) DESC`;
  const stmt = tagName ? db.prepare(query).bind(tagName) : db.prepare(query);
  const { results } = await stmt.all<PhotoRow>();
  return results.map(rowToPhoto);
}

export async function listPhotosWithLocation(db: D1Database): Promise<Photo[]> {
  const query = `${PHOTO_SELECT} WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL GROUP BY p.id ORDER BY COALESCE(p.taken_at, p.created_at) DESC`;
  const { results } = await db.prepare(query).all<PhotoRow>();
  return results.map(rowToPhoto);
}

export async function getPhoto(db: D1Database, id: string): Promise<Photo | null> {
  const query = `${PHOTO_SELECT} WHERE p.id = ? GROUP BY p.id`;
  const row = await db.prepare(query).bind(id).first<PhotoRow>();
  return row ? rowToPhoto(row) : null;
}

export async function listTags(db: D1Database): Promise<Tag[]> {
  const { results } = await db
    .prepare("SELECT id, name FROM tags ORDER BY name ASC")
    .all<Tag>();
  return results;
}

async function upsertTags(db: D1Database, tagNames: string[]): Promise<string[]> {
  const ids: string[] = [];
  const seen = new Set<string>();
  for (const rawName of tagNames) {
    const name = rawName.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);

    const existing = await db
      .prepare("SELECT id FROM tags WHERE name = ?")
      .bind(name)
      .first<{ id: string }>();

    if (existing) {
      ids.push(existing.id);
    } else {
      const id = crypto.randomUUID();
      await db.prepare("INSERT INTO tags (id, name) VALUES (?, ?)").bind(id, name).run();
      ids.push(id);
    }
  }
  return ids;
}

async function linkTags(db: D1Database, photoId: string, tagIds: string[]): Promise<void> {
  for (const tagId of tagIds) {
    await db
      .prepare("INSERT OR IGNORE INTO photo_tags (photo_id, tag_id) VALUES (?, ?)")
      .bind(photoId, tagId)
      .run();
  }
}

export async function createPhoto(db: D1Database, input: NewPhotoInput): Promise<Photo> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO photos (id, file_key, thumbnail_key, caption, taken_at, latitude, longitude, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      input.fileKey,
      input.thumbnailKey,
      input.caption,
      input.takenAt,
      input.latitude,
      input.longitude,
      createdAt
    )
    .run();

  const tagIds = await upsertTags(db, input.tagNames);
  await linkTags(db, id, tagIds);

  const photo = await getPhoto(db, id);
  if (!photo) throw new Error("Failed to create photo");
  return photo;
}

export async function updatePhoto(
  db: D1Database,
  id: string,
  input: UpdatePhotoInput
): Promise<Photo | null> {
  const existing = await getPhoto(db, id);
  if (!existing) return null;

  if (input.caption !== undefined) {
    await db.prepare("UPDATE photos SET caption = ? WHERE id = ?").bind(input.caption, id).run();
  }

  if (input.tagNames !== undefined) {
    await db.prepare("DELETE FROM photo_tags WHERE photo_id = ?").bind(id).run();
    const tagIds = await upsertTags(db, input.tagNames);
    await linkTags(db, id, tagIds);
  }

  return getPhoto(db, id);
}

export async function deletePhoto(db: D1Database, id: string): Promise<Photo | null> {
  const existing = await getPhoto(db, id);
  if (!existing) return null;

  await db.batch([
    db.prepare("DELETE FROM photo_tags WHERE photo_id = ?").bind(id),
    db.prepare("DELETE FROM photos WHERE id = ?").bind(id),
  ]);

  return existing;
}
