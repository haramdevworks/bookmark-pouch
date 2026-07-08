import { supabase } from "@/lib/supabase";
import type { Bookmark, CreateBookmarkInput, Tag, UpdateBookmarkInput } from "@/types";
import type { FetchedMetadata } from "./metadataService";

const DEFAULT_TITLE = "제목 없음";

const BOOKMARK_SELECT = `
  id, url, title, description, thumbnail, site_name, author, published_at,
  content_type, memo, folder_id, created_at, updated_at, summary, quotes, ai_tags,
  bookmark_tags ( tags ( id, name, created_at ) )
`;

interface TagRow {
  id: string;
  name: string;
  created_at: string;
}

interface BookmarkRow {
  id: string;
  url: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  site_name: string | null;
  author: string | null;
  published_at: string | null;
  content_type: string | null;
  memo: string | null;
  folder_id: string | null;
  created_at: string;
  updated_at: string;
  summary: string | null;
  quotes: string[] | null;
  ai_tags: string[] | null;
  bookmark_tags: { tags: TagRow | null }[] | null;
}

function mapRow(row: BookmarkRow): Bookmark {
  const tags: Tag[] = (row.bookmark_tags ?? [])
    .map((entry) => entry.tags)
    .filter((tag): tag is TagRow => Boolean(tag))
    .map((tag) => ({ id: tag.id, name: tag.name, createdAt: tag.created_at }));

  return {
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    siteName: row.site_name,
    author: row.author,
    publishedAt: row.published_at,
    contentType: row.content_type,
    memo: row.memo,
    folderId: row.folder_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    tags,
    summary: row.summary,
    quotes: row.quotes ?? [],
    aiTags: row.ai_tags ?? [],
  };
}

function assertValidUrl(url: string): string {
  const trimmed = url.trim();
  try {
    new URL(trimmed);
  } catch {
    throw new Error("올바른 URL 형식이 아닙니다. (예: https://example.com)");
  }
  return trimmed;
}

export interface BookmarkListFilters {
  folderId?: string;
  tagId?: string;
}

async function getBookmarkIdsByTag(tagId: string, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("bookmark_tags")
    .select("bookmark_id")
    .eq("tag_id", tagId);

  if (error) {
    throw new Error("태그로 필터링하지 못했습니다.");
  }

  const bookmarkIds = (data ?? []).map((row) => row.bookmark_id as string);

  // 사용자의 북마크만 필터링
  if (bookmarkIds.length === 0) return [];

  const { data: bookmarks, error: filterError } = await supabase
    .from("bookmarks")
    .select("id")
    .in("id", bookmarkIds)
    .eq("user_id", userId);

  if (filterError) {
    throw new Error("태그로 필터링하지 못했습니다.");
  }

  return (bookmarks ?? []).map((row) => row.id);
}

export async function getBookmarks(filters: BookmarkListFilters = {}, userId: string): Promise<Bookmark[]> {
  let queryBuilder = supabase
    .from("bookmarks")
    .select(BOOKMARK_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.folderId) {
    queryBuilder = queryBuilder.eq("folder_id", filters.folderId);
  }

  if (filters.tagId) {
    const ids = await getBookmarkIdsByTag(filters.tagId, userId);
    if (ids.length === 0) return [];
    queryBuilder = queryBuilder.in("id", ids);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw new Error("북마크 목록을 불러오지 못했습니다.");
  }

  return (data as unknown as BookmarkRow[]).map(mapRow);
}

export async function searchBookmarks(
  query: string,
  filters: BookmarkListFilters = {},
  userId: string,
): Promise<Bookmark[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return getBookmarks(filters, userId);
  }

  const { data: idRows, error: searchError } = await supabase.rpc("search_bookmark_ids", {
    search_term: trimmed,
  });

  if (searchError) {
    throw new Error("검색에 실패했습니다.");
  }

  let ids = ((idRows ?? []) as { id: string }[]).map((row) => row.id);
  if (ids.length === 0) {
    return [];
  }

  if (filters.tagId) {
    const tagBookmarkIds = new Set(await getBookmarkIdsByTag(filters.tagId, userId));
    ids = ids.filter((id) => tagBookmarkIds.has(id));
    if (ids.length === 0) return [];
  }

  let queryBuilder = supabase
    .from("bookmarks")
    .select(BOOKMARK_SELECT)
    .eq("user_id", userId)
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (filters.folderId) {
    queryBuilder = queryBuilder.eq("folder_id", filters.folderId);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw new Error("검색 결과를 불러오지 못했습니다.");
  }

  return (data as unknown as BookmarkRow[]).map(mapRow);
}

export async function getBookmarkById(id: string, userId: string): Promise<Bookmark | null> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select(BOOKMARK_SELECT)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("북마크를 불러오지 못했습니다.");
  }

  return data ? mapRow(data as unknown as BookmarkRow) : null;
}

export async function createBookmark(input: CreateBookmarkInput, userId: string): Promise<Bookmark> {
  const url = assertValidUrl(input.url);

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      url,
      title: DEFAULT_TITLE,
      folder_id: input.folderId ?? null,
      user_id: userId,
    })
    .select(BOOKMARK_SELECT)
    .single();

  if (error || !data) {
    throw new Error("링크를 저장하지 못했습니다.");
  }

  return mapRow(data as unknown as BookmarkRow);
}

export async function updateBookmark(id: string, input: UpdateBookmarkInput, userId: string): Promise<Bookmark> {
  const patch: Record<string, string | null> = {};
  if (input.url !== undefined) patch.url = assertValidUrl(input.url);
  if (input.title !== undefined) patch.title = input.title.trim() || DEFAULT_TITLE;
  if (input.description !== undefined) patch.description = input.description?.trim() || null;
  if (input.memo !== undefined) patch.memo = input.memo?.trim() || null;
  if (input.folderId !== undefined) patch.folder_id = input.folderId;

  const { data, error } = await supabase
    .from("bookmarks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select(BOOKMARK_SELECT)
    .maybeSingle();

  if (error) {
    throw new Error("링크를 수정하지 못했습니다.");
  }
  if (!data) {
    throw new Error("해당 북마크를 찾을 수 없습니다.");
  }

  return mapRow(data as unknown as BookmarkRow);
}

export async function deleteBookmark(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from("bookmarks").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    throw new Error("링크를 삭제하지 못했습니다.");
  }
}

export async function applyFetchedMetadata(id: string, userId: string, metadata: FetchedMetadata): Promise<Bookmark> {
  const patch: Record<string, string | null> = {
    thumbnail: metadata.thumbnail,
    site_name: metadata.siteName,
    author: metadata.author,
    published_at: metadata.publishedAt,
    content_type: metadata.contentType,
  };
  if (metadata.title) patch.title = metadata.title;
  if (metadata.description) patch.description = metadata.description;

  const { data, error } = await supabase
    .from("bookmarks")
    .update(patch)
    .eq("id", id)
    .eq("user_id", userId)
    .select(BOOKMARK_SELECT)
    .single();

  if (error || !data) {
    throw new Error("메타데이터를 저장하지 못했습니다.");
  }

  return mapRow(data as unknown as BookmarkRow);
}

export async function updateBookmarkAiInsights(
  id: string,
  userId: string,
  insights: { summary: string; quotes: string[]; aiTags: string[] },
): Promise<void> {
  const { error } = await supabase
    .from("bookmarks")
    .update({
      summary: insights.summary,
      quotes: insights.quotes,
      ai_tags: insights.aiTags,
    })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error("AI 분석 결과를 저장하지 못했습니다.");
  }
}
