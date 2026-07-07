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

/**
 * bookmark_tags는 배열 필드가 아니라 별도 조인 테이블이라 PostgREST의 기본
 * 연산자만으로는 "이 태그를 가진 북마크"를 바로 필터링할 수 없다. 태그에 연결된
 * bookmark_id 목록을 먼저 조회해 다른 조회 로직과 동일하게 `.in("id", ids)`로 좁힌다.
 */
async function getBookmarkIdsByTag(tagId: string): Promise<string[]> {
  const { data, error } = await supabase.from("bookmark_tags").select("bookmark_id").eq("tag_id", tagId);

  if (error) {
    throw new Error("태그로 필터링하지 못했습니다.");
  }

  return (data ?? []).map((row) => row.bookmark_id as string);
}

/**
 * 북마크 Service Layer.
 * 컴포넌트/Server Action은 이 파일을 통해서만 Supabase에 접근한다.
 */
export async function getBookmarks(filters: BookmarkListFilters = {}): Promise<Bookmark[]> {
  let queryBuilder = supabase.from("bookmarks").select(BOOKMARK_SELECT).order("created_at", { ascending: false });

  if (filters.folderId) {
    queryBuilder = queryBuilder.eq("folder_id", filters.folderId);
  }

  if (filters.tagId) {
    const ids = await getBookmarkIdsByTag(filters.tagId);
    if (ids.length === 0) return [];
    queryBuilder = queryBuilder.in("id", ids);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    throw new Error("북마크 목록을 불러오지 못했습니다.");
  }

  return (data as unknown as BookmarkRow[]).map(mapRow);
}

/**
 * title/description/url/site_name/memo/content_type/summary/quotes/ai_tags를
 * 대상으로 검색한다. 배열 필드(quotes/ai_tags)까지 포함해야 해서
 * Supabase의 `search_bookmark_ids` SQL 함수(unnest + ilike)로 id를 먼저 찾고,
 * 상세 데이터는 기존 BOOKMARK_SELECT로 다시 조회해 다른 조회 로직과 형태를 통일한다.
 * 검색어가 비어 있으면 getBookmarks와 동일하게 전체 목록을 반환한다.
 * 폴더/태그 필터는 검색어와 함께(AND 조건으로) 적용할 수 있다.
 */
export async function searchBookmarks(query: string, filters: BookmarkListFilters = {}): Promise<Bookmark[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return getBookmarks(filters);
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
    const tagBookmarkIds = new Set(await getBookmarkIdsByTag(filters.tagId));
    ids = ids.filter((id) => tagBookmarkIds.has(id));
    if (ids.length === 0) return [];
  }

  let queryBuilder = supabase
    .from("bookmarks")
    .select(BOOKMARK_SELECT)
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

export async function getBookmarkById(id: string): Promise<Bookmark | null> {
  const { data, error } = await supabase
    .from("bookmarks")
    .select(BOOKMARK_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("북마크를 불러오지 못했습니다.");
  }

  return data ? mapRow(data as unknown as BookmarkRow) : null;
}

/**
 * 등록 모달은 URL(과 현재 선택된 폴더)만 받는다. 제목/설명/썸네일 등은 저장
 * 직후 백그라운드에서 applyFetchedMetadata로 채워지고, 메모는 이후 수정
 * 화면에서 채운다.
 */
export async function createBookmark(input: CreateBookmarkInput): Promise<Bookmark> {
  const url = assertValidUrl(input.url);

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({ url, title: DEFAULT_TITLE, folder_id: input.folderId ?? null })
    .select(BOOKMARK_SELECT)
    .single();

  if (error || !data) {
    throw new Error("링크를 저장하지 못했습니다.");
  }

  return mapRow(data as unknown as BookmarkRow);
}

export async function updateBookmark(id: string, input: UpdateBookmarkInput): Promise<Bookmark> {
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

export async function deleteBookmark(id: string): Promise<void> {
  const { error } = await supabase.from("bookmarks").delete().eq("id", id);

  if (error) {
    throw new Error("링크를 삭제하지 못했습니다.");
  }
}

/**
 * 신규 북마크 저장 직후 백그라운드에서 가져온 OG 메타데이터를 반영한다.
 * title/description은 실제로 값을 가져온 경우에만 덮어써서, 사용자가 이미
 * "제목 없음" 대신 다른 값을 넣을 일이 없는 신규 저장 직후에만 안전하게 채운다.
 * 조회/수정 시에는 호출하지 않는다 (백그라운드 enrichment 전용).
 */
export async function applyFetchedMetadata(id: string, metadata: FetchedMetadata): Promise<Bookmark> {
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
    .select(BOOKMARK_SELECT)
    .single();

  if (error || !data) {
    throw new Error("메타데이터를 저장하지 못했습니다.");
  }

  return mapRow(data as unknown as BookmarkRow);
}

/**
 * 신규 북마크 저장 직후 백그라운드에서 생성된 Gemini 분석 결과를 반영한다.
 * 조회/수정 시에는 절대 호출하지 않는다 (aiService.analyzeAndSaveBookmark 전용).
 */
export async function updateBookmarkAiInsights(
  id: string,
  insights: { summary: string; quotes: string[]; aiTags: string[] },
): Promise<void> {
  const { error } = await supabase
    .from("bookmarks")
    .update({
      summary: insights.summary,
      quotes: insights.quotes,
      ai_tags: insights.aiTags,
    })
    .eq("id", id);

  if (error) {
    throw new Error("AI 분석 결과를 저장하지 못했습니다.");
  }
}
