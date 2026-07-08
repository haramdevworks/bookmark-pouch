"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Folder } from "@/types";
import { FolderList } from "./FolderList";

export function FolderListWithRefresh({ initialFolders }: { initialFolders: Folder[] }) {
  const [folders, setFolders] = useState(initialFolders);
  const [isLoading, setIsLoading] = useState(initialFolders.length === 0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(initialFolders.length > 0);

  useEffect(() => {
    setFolders(initialFolders);
    if (initialFolders.length > 0) {
      setHasLoadedOnce(true);
      setIsLoading(false);
    }
  }, [initialFolders]);

  useEffect(() => {
    // 초기 데이터가 없으면 클라이언트에서 로드
    if (!hasLoadedOnce && folders.length === 0) {
      loadFolders();
    }

    // auth 상태 변화 감지 - SIGNED_IN 이벤트만 처리
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event) => {
      if (_event === "SIGNED_IN") {
        await loadFolders();
      } else if (_event === "SIGNED_OUT") {
        setFolders([]);
        setHasLoadedOnce(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [hasLoadedOnce]);

  async function loadFolders() {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/folders?userId=${user.id}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      setFolders(data);
      setHasLoadedOnce(true);
    } catch (error) {
      console.error("[FolderListWithRefresh] 폴더 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading && folders.length === 0) {
    return <div className="px-2 py-2 text-[13px] text-description">불러오는 중...</div>;
  }

  return <FolderList folders={folders} />;
}
