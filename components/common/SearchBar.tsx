"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";

/**
 * 검색은 URL의 `?q=` 값을 서버에서 읽어 처리한다 (app/page.tsx 참고).
 * defaultQuery가 바뀔 때(검색 실행/뒤로가기/폴더 "전체" 이동 등)마다
 * 부모에서 key를 바꿔 이 컴포넌트를 새로 마운트시키므로, input은 매번
 * 최신 검색어를 defaultValue로 반영한 뒤 자유롭게 입력할 수 있다.
 * 폴더/태그 필터(folder/tag 파라미터)는 검색 중에도 그대로 유지한다.
 */
export function SearchBar({ defaultQuery = "" }: { defaultQuery?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = String(formData.get("q") ?? "").trim();

    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    const qs = params.toString();

    startTransition(() => {
      router.push(qs ? `/?${qs}` : "/");
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-10 w-full items-center gap-2 rounded-2xl border border-border bg-card px-4"
    >
      <button
        type="submit"
        aria-label="검색"
        className="flex shrink-0 items-center justify-center text-description transition-colors hover:text-foreground"
      >
        {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Search className="size-3.5" />}
      </button>
      <input
        type="text"
        name="q"
        defaultValue={defaultQuery}
        placeholder="제목, 설명, URL, 태그, 메모 검색"
        className="w-full bg-transparent text-[13px] text-foreground placeholder:text-description outline-none"
      />
    </form>
  );
}
