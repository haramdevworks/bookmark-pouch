"use server";

import { revalidatePath } from "next/cache";
import { createTag, deleteTag, linkTagsToBookmark, unlinkTagFromBookmark, updateTag } from "@/services/tagService";

export async function addTagToBookmarkAction(bookmarkId: string, name: string): Promise<void> {
  const tag = await createTag(name);
  await linkTagsToBookmark(bookmarkId, [tag.id]);

  revalidatePath("/");
  revalidatePath(`/links/${bookmarkId}`);
}

export async function removeTagFromBookmarkAction(bookmarkId: string, tagId: string): Promise<void> {
  await unlinkTagFromBookmark(bookmarkId, tagId);

  revalidatePath("/");
  revalidatePath(`/links/${bookmarkId}`);
}

export async function updateTagAction(id: string, name: string): Promise<void> {
  await updateTag(id, name);
  revalidatePath("/");
}

export async function deleteTagAction(id: string): Promise<void> {
  await deleteTag(id);
  revalidatePath("/");
}
