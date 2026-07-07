import { supabase } from "@/lib/supabase";
import type { CreateFolderInput, Folder } from "@/types";

const FOLDER_SELECT = "id, name, created_at";

interface FolderRow {
  id: string;
  name: string;
  created_at: string;
}

function mapRow(row: FolderRow): Folder {
  return { id: row.id, name: row.name, createdAt: row.created_at };
}

/**
 * 폴더 Service Layer.
 * 컴포넌트/Server Action은 이 파일을 통해서만 Supabase에 접근한다.
 */
export async function getFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from("folders")
    .select(FOLDER_SELECT)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("폴더 목록을 불러오지 못했습니다.");
  }

  return (data as FolderRow[]).map(mapRow);
}

export async function getFolderById(id: string): Promise<Folder | null> {
  const { data, error } = await supabase
    .from("folders")
    .select(FOLDER_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("폴더를 불러오지 못했습니다.");
  }

  return data ? mapRow(data as FolderRow) : null;
}

export async function createFolder(input: CreateFolderInput): Promise<Folder> {
  const name = input.name.trim();
  if (!name) {
    throw new Error("폴더 이름을 입력해주세요.");
  }

  const { data, error } = await supabase
    .from("folders")
    .insert({ name })
    .select(FOLDER_SELECT)
    .single();

  if (error || !data) {
    throw new Error("폴더를 생성하지 못했습니다.");
  }

  return mapRow(data as FolderRow);
}

export async function updateFolder(id: string, name: string): Promise<Folder> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("폴더 이름을 입력해주세요.");
  }

  const { data, error } = await supabase
    .from("folders")
    .update({ name: trimmed })
    .eq("id", id)
    .select(FOLDER_SELECT)
    .single();

  if (error || !data) {
    throw new Error("폴더를 수정하지 못했습니다.");
  }

  return mapRow(data as FolderRow);
}

// 폴더를 삭제해도 안의 북마크는 삭제되지 않는다 (FK가 on delete set null이라 미분류로 이동).
export async function deleteFolder(id: string): Promise<void> {
  const { error } = await supabase.from("folders").delete().eq("id", id);

  if (error) {
    throw new Error("폴더를 삭제하지 못했습니다.");
  }
}
