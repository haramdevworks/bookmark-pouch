"use client";

import { useRouter } from "next/navigation";
import { ExternalLink, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteBookmarkAction } from "@/app/actions/bookmark-actions";
import type { Bookmark } from "@/types";

export function BookmarkCardActions({ bookmark }: { bookmark: Bookmark }) {
  const router = useRouter();

  function handleOpenOriginal() {
    window.open(bookmark.url, "_blank", "noopener,noreferrer");
  }

  async function handleDelete() {
    const confirmed = window.confirm("이 링크를 삭제할까요? 삭제하면 되돌릴 수 없습니다.");
    if (!confirmed) return;

    try {
      await deleteBookmarkAction(bookmark.id);
      router.refresh();
    } catch {
      window.alert("삭제 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <div onClick={(event) => event.stopPropagation()} className="shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="더보기"
          className="flex size-8 items-center justify-center rounded-md text-description transition-colors hover:bg-accent hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleOpenOriginal}>
            <ExternalLink />
            원문 보기
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleDelete}>
            <Trash2 />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
