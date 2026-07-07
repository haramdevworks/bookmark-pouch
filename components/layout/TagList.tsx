"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { deleteTagAction, updateTagAction } from "@/app/actions/tag-actions";
import type { Tag } from "@/types";

/**
 * 태그를 클릭하면 목록 화면이 해당 태그를 가진 북마크로 필터링된다.
 * "전체"는 tag 파라미터만 지우고 검색어/폴더 필터는 그대로 유지한다.
 * 연필/x 아이콘으로 이름 수정·삭제도 할 수 있다.
 */
export function TagList({ tags }: { tags: Tag[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTagId = searchParams.get("tag");

  function hrefFor(tagId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (tagId) {
      params.set("tag", tagId);
    } else {
      params.delete("tag");
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  async function handleRename(tag: Tag) {
    const name = window.prompt("태그 이름 수정", tag.name);
    if (!name || !name.trim() || name.trim() === tag.name) return;

    try {
      await updateTagAction(tag.id, name);
      router.refresh();
    } catch {
      window.alert("태그 이름을 수정하지 못했습니다.");
    }
  }

  async function handleDelete(tag: Tag) {
    const confirmed = window.confirm(`'${tag.name}' 태그를 삭제할까요? 모든 링크에서 이 태그가 제거됩니다.`);
    if (!confirmed) return;

    try {
      await deleteTagAction(tag.id);
      router.refresh();
    } catch {
      window.alert("태그를 삭제하지 못했습니다.");
    }
  }

  if (tags.length === 0) {
    return <p className="text-[13px] text-description">태그가 없습니다.</p>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <Link
        href={hrefFor(null)}
        className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
          activeTagId ? "bg-tag-bg text-tag-fg" : "bg-primary text-primary-foreground"
        }`}
      >
        전체
      </Link>
      {tags.map((tag) => {
        const active = activeTagId === tag.id;
        return (
          <div
            key={tag.id}
            className={`group inline-flex h-6 items-center gap-0.5 rounded-full pr-1 pl-3 text-[11px] font-medium transition-colors ${
              active ? "bg-primary text-primary-foreground" : "bg-tag-bg text-tag-fg"
            }`}
          >
            <Link href={hrefFor(tag.id)}>#{tag.name}</Link>
            <button
              type="button"
              onClick={() => handleDelete(tag)}
              aria-label={`${tag.name} 태그 삭제`}
              className="flex size-4 shrink-0 items-center justify-center"
            >
              <X className="size-2.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
