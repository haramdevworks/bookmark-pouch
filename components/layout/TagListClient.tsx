"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Tag } from "@/types";
import { TagList } from "./TagList";

export function TagListClient() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        setError(null);
        const { data: { user } } = await supabase.auth.getUser();

        if (!user?.id) {
          setTags([]);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/tags?userId=${user.id}`);
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        setTags(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error("[TagListClient] 태그 불러오기 실패:", message);
        setError(message);
        setTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        loadTags();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (error) {
    return <div className="px-2 py-2 text-[11px] text-destructive">태그 로드 실패: {error}</div>;
  }

  if (isLoading) {
    return <div className="px-2 py-2 text-[13px] text-description">불러오는 중...</div>;
  }

  return <TagList tags={tags} />;
}
