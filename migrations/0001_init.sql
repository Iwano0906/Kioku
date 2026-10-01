-- Kioku initial schema

CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  file_key TEXT NOT NULL,
  thumbnail_key TEXT NOT NULL,
  caption TEXT,
  taken_at TEXT,
  latitude REAL,
  longitude REAL,
  created_at TEXT NOT NULL
);

CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE photo_tags (
  photo_id TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);

CREATE INDEX idx_photos_taken_at ON photos(taken_at);
CREATE INDEX idx_photo_tags_tag_id ON photo_tags(tag_id);
