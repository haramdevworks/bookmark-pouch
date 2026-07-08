"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { applyFetchedMetadata, createBookmark, deleteBookmark, updateBookmark } from "@/services/bookmarkService";
import { fetchUrlMetadata } from "@/services/metadataService";
import { analyzeAndSaveBookmark } from "@/services/aiService";
import { linkTagsToBookmark } from "@/services/tagService";
import { getUserId } from "@/lib/auth";
import type { UpdateBookmarkInput } from "@/types";

export interface BookmarkFormState {
  error?: string;
}

function readFolderId(formData: FormData): string | null {
  const value = String(formData.get("folderId") ?? "");
  return value ? value : null;
}

async function enrichBookmarkInBackground(id: string, url: string, userId: string): Promise<void> {
  const { metadata, articleText } = await fetchUrlMetadata(url);

  let bookmark;
  try {
    bookmark = await applyFetchedMetadata(id, userId, metadata);
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

export async function createBookmarkAction(
  _prevState: BookmarkFormState,
  formData: FormData,
): Promise<BookmarkFormState> {
  const url = String(formData.get("url") ?? "");
  const folderId = readFolderId(formData);
  const tagId = String(formData.get("tagId") ?? "") || null;

  try {
    const userId = await getUserId();
    const bookmark = await createBookmark({ url, folderId }, userId);
    if (tagId) await linkTagsToBookmark(bookmark.id, [tagId]);
    after(() => enrichBookmarkInBackground(bookmark.id, bookmark.url, userId));
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
    const userId = await getUserId();
    await updateBookmark(id, input, userId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "링크를 수정하지 못했습니다." };
  }

  revalidatePath("/");
  revalidatePath(`/links/${id}`);
  redirect(`/links/${id}`);
}

export async function deleteBookmarkAction(id: string): Promise<void> {
  const userId = await getUserId();
  await deleteBookmark(id, userId);
  revalidatePath("/");
}
