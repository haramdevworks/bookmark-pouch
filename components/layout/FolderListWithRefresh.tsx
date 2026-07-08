"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Folder } from "@/types";
import { FolderList } from "./FolderList";

export function FolderListWithRefresh({ initialFolders }: { initialFolders: Folder[] }) {
  const [folders, setFolders] = useState(initialFolders);
  const [isLoading, setIsLoading] = useState(initialFolders.length === 0);

  useEffect(() => {
    setFolders(initialFolders);

    // 초기 데이터가 없으면 클라이언트에서 로드
    if (initialFolders.length === 0) {
      console.log("[FolderListWithRefresh] 초기 데이터 없음, 클라이언트에서 로드");
      loadFolders();
    }

    // auth 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[FolderListWithRefresh] onAuthStateChange:", _event, session?.user?.email ? "user 있음" : "user 없음");

      if (_event === "SIGNED_IN" && session?.user) {
        console.log("[FolderListWithRefresh] 로그인됨, 폴더 재로드");
        await loadFolders();
      } else if (_event === "SIGNED_OUT") {
        setFolders([]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [initialFolders]);

  async function loadFolders() {
    try {
      setIsLoading(true);
      console.log("[FolderListWithRefresh] 폴더 로드 시작");

      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      console.log("[FolderListWithRefresh] getUser 결과:", { email: user?.email, error: getUserError?.message });

      if (!user?.id) {
        console.log("[FolderListWithRefresh] user 없음, userId로 로드 불가");
        setIsLoading(false);
        return;
      }

      console.log("[FolderListWithRefresh] API 호출 시작: /api/folders?userId=" + user.id);
      const response = await fetch(`/api/folders?userId=${user.id}`);
      console.log("[FolderListWithRefresh] API 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("[FolderListWithRefresh] 폴더 로드 완료:", data.length, data);
      setFolders(data);
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
