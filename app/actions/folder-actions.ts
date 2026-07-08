"use server";

import { revalidatePath } from "next/cache";
import { createFolder, deleteFolder, updateFolder } from "@/services/folderService";
import { getUserId } from "@/lib/auth";

export interface FolderActionState {
  error?: string;
}

export async function createFolderAction(
  _prevState: FolderActionState,
  formData: FormData,
): Promise<FolderActionState> {
  const name = String(formData.get("name") ?? "");

  try {
    const userId = await getUserId();
    await createFolder({ name }, userId);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "폴더를 생성하지 못했습니다." };
  }

  revalidatePath("/");
  return {};
}

export async function updateFolderAction(id: string, name: string): Promise<void> {
  const userId = await getUserId();
  await updateFolder(id, name, userId);
  revalidatePath("/");
}

export async function deleteFolderAction(id: string): Promise<void> {
  const userId = await getUserId();
  await deleteFolder(id, userId);
  revalidatePath("/");
}
