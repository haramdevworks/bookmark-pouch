"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Tag } from "@/types";
import { TagList } from "./TagList";

export function TagListWithRefresh({ initialTags }: { initialTags: Tag[] }) {
  const [tags, setTags] = useState(initialTags);
  const [isLoading, setIsLoading] = useState(initialTags.length === 0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(initialTags.length > 0);

  useEffect(() => {
    setTags(initialTags);
    if (initialTags.length > 0) {
      setHasLoadedOnce(true);
      setIsLoading(false);
    }
  }, [initialTags]);

  useEffect(() => {
    // 초기 데이터가 없으면 클라이언트에서 로드
    if (!hasLoadedOnce && tags.length === 0) {
      loadTags();
    }

    // auth 상태 변화 감지 - SIGNED_IN 이벤트만 처리
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event) => {
      if (_event === "SIGNED_IN") {
        await loadTags();
      } else if (_event === "SIGNED_OUT") {
        setTags([]);
        setHasLoadedOnce(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [hasLoadedOnce]);

  async function loadTags() {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/tags?userId=${user.id}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      setTags(data);
      setHasLoadedOnce(true);
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
