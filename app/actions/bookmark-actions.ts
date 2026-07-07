"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { applyFetchedMetadata, createBookmark, deleteBookmark, updateBookmark } from "@/services/bookmarkService";
import { fetchUrlMetadata } from "@/services/metadataService";
import { analyzeAndSaveBookmark } from "@/services/aiService";
import type { UpdateBookmarkInput } from "@/types";

export interface BookmarkFormState {
  error?: string;
}

function readFolderId(formData: FormData): string | null {
  const value = String(formData.get("folderId") ?? "");
  return value ? value : null;
}

/**
 * 신규 저장 직후 백그라운드(after)에서만 호출된다.
 * OG 메타데이터를 먼저 채운 뒤, 같은 페이지에서 함께 추출한 본문(articleText)을
 * 근거로 Gemini 분석을 실행한다. 본문은 AI 프롬프트에만 쓰이고 절대 DB에
 * 저장하지 않는다 — applyFetchedMetadata에는 넘기지 않는다.
 * 모든 단계는 실패해도 예외를 던지지 않는다 — 이미 사용자에게는 저장 완료
 * 응답이 전달된 뒤이기 때문이다.
 */
async function enrichBookmarkInBackground(id: string, url: string): Promise<void> {
  const { metadata, articleText } = await fetchUrlMetadata(url);

  let bookmark;
  try {
    bookmark = await applyFetchedMetadata(id, metadata);
  } catch {
    return;
  }

  await analyzeAndSaveBookmark({
    id: bookmark.id,
    title: bookmark.title,
    description: bookmark.description,
    siteName: bookmark.siteName,
    contentType: bookmark.contentType,
    articleText,
  });
}

/**
 * 등록 모달에서 URL만 입력받아 저장한다. 제목/설명/썸네일 등은 저장 직후
 * 백그라운드에서 메타데이터 수집 → AI 분석 순서로 자동 채워진다.
 * 세부 내용을 손보고 싶으면 저장 후 수정 화면에서 직접 편집한다.
 */
export async function createBookmarkAction(
  _prevState: BookmarkFormState,
  formData: FormData,
): Promise<BookmarkFormState> {
  const url = String(formData.get("url") ?? "");

  try {
    const bookmark = await createBookmark({ url });
    after(() => enrichBookmarkInBackground(bookmark.id, bookmark.url));
  } catch (error) {
    return { error: error instanceof Error ? error.message : "링크를 저장하지 못했습니다." };
  }

  revalidatePath("/");
  return {};
}

export async function updateBookmarkAction(
  id: string,
  _prevState: BookmarkFormState,
  formData: FormData,
): Promise<BookmarkFormState> {
  const input: UpdateBookmarkInput = {
    url: String(formData.get("url") ?? ""),
    title: String(formData.get("title") ?? ""),
    memo: String(formData.get("memo") ?? "") || null,
    folderId: readFolderId(formData),
  };

  try {
    await updateBookmark(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "링크를 수정하지 못했습니다." };
  }

  revalidatePath("/");
  revalidatePath(`/links/${id}`);
  redirect(`/links/${id}`);
}

export async function deleteBookmarkAction(id: string): Promise<void> {
  await deleteBookmark(id);
  revalidatePath("/");
}
