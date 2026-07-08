"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Folder } from "@/types";
import { FolderList } from "./FolderList";

export function FolderListClient() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFolders = async () => {
      try {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
          setFolders([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/folders?userId=${user.id}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setFolders(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[FolderListClient] 폴더 불러오기 실패:", message);
        setError(message);
        setFolders([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFolders();

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        loadFolders();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (error) {
    return <div className="px-2 py-2 text-[11px] text-destructive">폴더 로드 실패: {error}</div>;
  }

  if (isLoading) {
    return <div className="px-2 py-2 text-[13px] text-description">불러오는 중...</div>;
  }

  return <FolderList folders={folders} />;
}
