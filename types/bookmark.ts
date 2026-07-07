import type { Tag } from "./tag";

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  siteName: string | null;
  author: string | null;
  publishedAt: string | null;
  contentType: string | null;
  memo: string | null;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
  summary: string | null;
  quotes: string[];
  aiTags: string[];
}

export interface CreateBookmarkInput {
  url: string;
  folderId?: string | null;
}

export interface UpdateBookmarkInput {
  url?: string;
  title?: string;
  description?: string | null;
  memo?: string | null;
  folderId?: string | null;
}
