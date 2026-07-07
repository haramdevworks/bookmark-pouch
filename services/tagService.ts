import { supabase } from "@/lib/supabase";
import type { Tag } from "@/types";

const TAG_SELECT = "id, name, created_at";

interface TagRow {
  id: string;
  name: string;
  created_at: string;
}

function mapRow(row: TagRow): Tag {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

/**
 * 태그 Service Layer.
 * 컴포넌트/Server Action은 이 파일을 통해서만 Supabase에 접근한다.
 */
export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select(TAG_SELECT)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("태그 목록을 불러오지 못했습니다.");
  }

  return (data as TagRow[]).map(mapRow);
}

export async function getTagsByBookmarkId(bookmarkId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("bookmark_tags")
    .select("tags ( id, name, created_at )")
    .eq("bookmark_id", bookmarkId);

  if (error) {
    throw new Error("태그를 불러오지 못했습니다.");
  }

  return ((data ?? []) as unknown as { tags: TagRow | null }[])
    .map((row) => row.tags)
    .filter((tag): tag is TagRow => Boolean(tag))
    .map(mapRow);
}

export async function createTag(name: string): Promise<Tag> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("태그 이름을 입력해주세요.");
  }

  const { data, error } = await supabase
    .from("tags")
    .upsert({ name: trimmed }, { onConflict: "name" })
    .select(TAG_SELECT)
    .single();

  if (error || !data) {
    throw new Error("태그를 생성하지 못했습니다.");
  }

  return mapRow(data as TagRow);
}

export async function linkTagsToBookmark(bookmarkId: string, tagIds: string[]): Promise<void> {
  if (tagIds.length === 0) return;

  const { error } = await supabase
    .from("bookmark_tags")
    .upsert(
      tagIds.map((tagId) => ({ bookmark_id: bookmarkId, tag_id: tagId })),
      { onConflict: "bookmark_id,tag_id" },
    );

  if (error) {
    throw new Error("태그를 연결하지 못했습니다.");
  }
}

export async function unlinkTagFromBookmark(bookmarkId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from("bookmark_tags")
    .delete()
    .eq("bookmark_id", bookmarkId)
    .eq("tag_id", tagId);

  if (error) {
    throw new Error("태그를 삭제하지 못했습니다.");
  }
}

export async function updateTag(id: string, name: string): Promise<Tag> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("태그 이름을 입력해주세요.");
  }

  const { data, error } = await supabase
    .from("tags")
    .update({ name: trimmed })
    .eq("id", id)
    .select(TAG_SELECT)
    .single();

  if (error || !data) {
    throw new Error("태그를 수정하지 못했습니다.");
  }

  return mapRow(data as TagRow);
}

// tags를 지우면 bookmark_tags도 함께 삭제된다 (FK on delete cascade).
export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase.from("tags").delete().eq("id", id);

  if (error) {
    throw new Error("태그를 삭제하지 못했습니다.");
  }
}
