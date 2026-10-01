export interface Tag {
  id: string;
  name: string;
}

export interface Photo {
  id: string;
  fileKey: string;
  thumbnailKey: string;
  caption: string | null;
  takenAt: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  tags: Tag[];
}

export interface NewPhotoInput {
  fileKey: string;
  thumbnailKey: string;
  caption: string | null;
  takenAt: string | null;
  latitude: number | null;
  longitude: number | null;
  tagNames: string[];
}

export interface UpdatePhotoInput {
  caption?: string | null;
  tagNames?: string[];
}
