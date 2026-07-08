"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Tag } from "@/types";
import { TagList } from "./TagList";

export function TagListWithRefresh({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState(initialTags);
  const [isLoading, setIsLoading] = useState(initialTags.length === 0);

  useEffect(() => {
    setTags(initialTags);

    // 초기 데이터가 없으면 클라이언트에서 로드
    if (initialTags.length === 0) {
      console.log("[TagListWithRefresh] 초기 데이터 없음, 클라이언트에서 로드");
      loadTags();
    }

    // auth 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("[TagListWithRefresh] onAuthStateChange:", _event, session?.user?.email ? "user 있음" : "user 없음");

      if (_event === "SIGNED_IN" && session?.user) {
        console.log("[TagListWithRefresh] 로그인됨, 태그 재로드");
        await loadTags();
      } else if (_event === "SIGNED_OUT") {
        setTags([]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [initialTags]);

  async function loadTags() {
    try {
      setIsLoading(true);
      console.log("[TagListWithRefresh] 태그 로드 시작");

      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      console.log("[TagListWithRefresh] getUser 결과:", { email: user?.email, error: getUserError?.message });

      if (!user?.id) {
        console.log("[TagListWithRefresh] user 없음, userId로 로드 불가");
        setIsLoading(false);
        return;
      }

      console.log("[TagListWithRefresh] API 호출 시작: /api/tags?userId=" + user.id);
      const response = await fetch(`/api/tags?userId=${user.id}`);
      console.log("[TagListWithRefresh] API 응답 상태:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("[TagListWithRefresh] 태그 로드 완료:", data.length, data);
      setTags(data);
    } catch (error) {
      console.error("[TagListWithRefresh] 태그 불러오기 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading && tags.length === 0) {
    return <div className="px-2 py-2 text-[13px] text-description">불러오는 중...</div>;
  }

  return <TagList tags={tags} />;
}
