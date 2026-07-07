"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteBookmarkAction } from "@/app/actions/bookmark-actions";

export function DeleteBookmarkButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = window.confirm("이 링크를 삭제할까요? 삭제하면 되돌릴 수 없습니다.");
    if (!confirmed) return;

    try {
      await deleteBookmarkAction(id);
      router.push("/");
    } catch {
      window.alert("삭제 중 문제가 발생했습니다. 다시 시도해주세요.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-[13px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
    >
      <Trash2 className="size-3.5" />
      삭제
    </button>
  );
}
