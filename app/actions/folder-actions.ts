"use server";

import { revalidatePath } from "next/cache";
import { createFolder, deleteFolder, updateFolder } from "@/services/folderService";

export interface FolderActionState {
  error?: string;
}

export async function createFolderAction(
  _prevState: FolderActionState,
  formData: FormData,
): Promise<FolderActionState> {
  const name = String(formData.get("name") ?? "");

  try {
    await createFolder({ name });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "폴더를 생성하지 못했습니다." };
  }

  revalidatePath("/");
  return {};
}

export async function updateFolderAction(id: string, name: string): Promise<void> {
  await updateFolder(id, name);
  revalidatePath("/");
}

export async function deleteFolderAction(id: string): Promise<void> {
  await deleteFolder(id);
  revalidatePath("/");
}
