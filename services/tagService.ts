import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
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

export async function getTags(userId: string): Promise<Tag[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tags")
    .select(TAG_SELECT)
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("태그 목록을 불러오지 못했습니다.");
  }

  return (data as TagRow[]).map(mapRow);
}

export async function getTagsByBookmarkId(bookmarkId: string, userId: string): Promise<Tag[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookmark_tags")
    .select("tags ( id, name, created_at )")
    .eq("bookmark_id", bookmarkId);

  if (error) {
    throw new Error("태그를 불러오지 못했습니다.");
  }

  const tags = ((data ?? []) as unknown as { tags: TagRow | null }[])
    .map((row) => row.tags)
    .filter((tag): tag is TagRow => Boolean(tag));

  const { data: verifiedTags, error: verifyError } = await supabase
    .from("tags")
    .select(TAG_SELECT)
    .eq("user_id", userId)
    .in(
      "id",
      tags.map((t) => t.id),
    );

  if (verifyError) {
    throw new Error("태그를 검증하지 못했습니다.");
  }

  return ((verifiedTags ?? []) as TagRow[]).map(mapRow);
}

export async function createTag(name: string, userId: string): Promise<Tag> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("태그 이름을 입력해주세요.");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tags")
    .upsert({ name: trimmed, user_id: userId }, { onConflict: "user_id,name" })
    .select(TAG_SELECT)
    .single();

  if (error || !data) {
    throw new Error("태그를 생성하지 못했습니다.");
  }

  return mapRow(data as TagRow);
}

export async function linkTagsToBookmark(bookmarkId: string, tagIds: string[], userId: string): Promise<void> {
  if (tagIds.length === 0) return;

  const supabase = await getSupabaseServerClient();
  console.log("[linkTagsToBookmark] 시작:", { bookmarkId, tagIds, userId });

  // onConflict 없이 단순 insert 시도 (delete후 insert)
  try {
    // 먼저 기존 관계 삭제
    await supabase
      .from("bookmark_tags")
      .delete()
      .eq("bookmark_id", bookmarkId)
      .in("tag_id", tagIds);

    // 새로 insert (user_id 제외 - 테이블 기본값에 의존)
    const { error: insertError } = await supabase
      .from("bookmark_tags")
      .insert(
        tagIds.map((tagId) => ({ bookmark_id: bookmarkId, tag_id: tagId })),
      );

    if (insertError) {
      console.error("[linkTagsToBookmark] Insert error:", insertError);
      throw new Error(`태그를 연결하지 못했습니다: ${insertError.message}`);
    }

    console.log("[linkTagsToBookmark] 완료");
  } catch (error) {
    console.error("[linkTagsToBookmark] Error:", error);
    throw error;
  }
}

export async function unlinkTagFromBookmark(bookmarkId: string, tagId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase
    .from("bookmark_tags")
    .delete()
    .eq("bookmark_id", bookmarkId)
    .eq("tag_id", tagId);

  if (error) {
    throw new Error("태그를 삭제하지 못했습니다.");
  }
}

export async function updateTag(id: string, name: string, userId: string): Promise<Tag> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("태그 이름을 입력해주세요.");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("tags")
    .update({ name: trimmed })
    .eq("id", id)
    .eq("user_id", userId)
    .select(TAG_SELECT)
    .single();

  if (error || !data) {
    throw new Error("태그를 수정하지 못했습니다.");
  }

  return mapRow(data as TagRow);
}

export async function deleteTag(id: string, userId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("tags").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    throw new Error("태그를 삭제하지 못했습니다.");
  }
}
