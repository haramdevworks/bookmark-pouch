import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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

async function getSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle errors silently
          }
        },
      },
    }
  );
}

export async function getFolders(userId: string): Promise<Folder[]> {
  const supabase = await getSupabaseClient();
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
  const supabase = await getSupabaseClient();
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

  const supabase = await getSupabaseClient();
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

  const supabase = await getSupabaseClient();
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
  const supabase = await getSupabaseClient();
  const { error } = await supabase.from("folders").delete().eq("id", id).eq("user_id", userId);

  if (error) {
    throw new Error("폴더를 삭제하지 못했습니다.");
  }
}
