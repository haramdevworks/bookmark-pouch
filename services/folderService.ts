import { getSupabaseServerClient } from "@/lib/supabaseServerClient";
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

export async function getFolders(userId: string): Promise<Folder[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("folders")
    .select(FOLDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error("폴더 목록을 불러오지 못했습니다.");
  }

  return (data as FolderRow[]).map(mapRow);
}

export async function getFolderById(id: string, userId: string): Promise<Folder | null> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("folders")
    .select(FOLDER_SELECT)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("폴더를 불러오지 못했습니다.");
  }

  return data ? mapRow(data as FolderRow) : null;
}

export async function createFolder(input: CreateFolderInput, userId: string): Promise<Folder> {
  const name = input.name.trim();
  if (!name) {
    throw new Error("폴더 이름을 입력해주세요.");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("folders")
    .insert({ name, user_id: userId })
    .select(FOLDER_SELECT)
    .single();

  if (error || !data) {
    throw new Error("폴더를 생성하지 못했습니다.");
  }

  return mapRow(data as FolderRow);
}

export async function updateFolder(id: string, name: string, userId: string): Promise<Folder> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error("폴더 이름을 입력해주세요.");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("folders")
    .update({ name: trimmed })
    .eq("id", id)
    .eq("user_id", userId)
    .select(FOLDER_SELECT)
    .single();

  if (error || !data) {
    throw new Error("폴더를 수정하지 못했습니다.");
  }

  return mapRow(data as FolderRow);
}

export async function deleteFolder(id: string, userId: string): Promise<void> {
  const supabase = await getSupabaseServerClient();
  const { error } = await supabase.from("folders").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    throw new Error("폴더를 삭제하지 못했습니다.");
  }
}
