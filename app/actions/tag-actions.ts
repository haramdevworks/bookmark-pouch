"use server";

import { revalidatePath } from "next/cache";
import { createTag, deleteTag, linkTagsToBookmark, unlinkTagFromBookmark, updateTag } from "@/services/tagService";
import { getUserId } from "@/lib/auth";

export async function addTagToBookmarkAction(bookmarkId: string, name: string): Promise<void> {
  const userId = await getUserId();
  const tag = await createTag(name, userId);
  await linkTagsToBookmark(bookmarkId, [tag.id]);

  revalidatePath("/");
  revalidatePath(`/links/${bookmarkId}`);
}

export async function removeTagFromBookmarkAction(bookmarkId: string, tagId: string): Promise<void> {
  const userId = await getUserId();
  await unlinkTagFromBookmark(bookmarkId, tagId);

  revalidatePath("/");
  revalidatePath(`/links/${bookmarkId}`);
}

export async function updateTagAction(id: string, name: string): Promise<void> {
  const userId = await getUserId();
  await updateTag(id, name, userId);
  revalidatePath("/");
}

export async function deleteTagAction(id: string): Promise<void> {
  const userId = await getUserId();
  await deleteTag(id, userId);
  revalidatePath("/");
}
