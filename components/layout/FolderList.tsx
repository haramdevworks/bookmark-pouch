"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Folder as FolderIcon, Pencil, Trash2 } from "lucide-react";
import { deleteFolderAction, updateFolderAction } from "@/app/actions/folder-actions";
import type { Folder } from "@/types";

/**
 * 폴더를 클릭하면 목록 화면이 해당 폴더로 필터링된다.
 * "전체"는 folder 파라미터만 지우고 검색어/태그 필터는 그대로 유지한다.
 * 이름 옆 연필/휴지통 아이콘으로 이름 수정·삭제도 할 수 있다.
 */
export function FolderList({ folders }: { folders: Folder[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeFolderId = searchParams.get("folder");

  function hrefFor(folderId: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (folderId) {
      params.set("folder", folderId);
    } else {
      params.delete("folder");
    }
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  async function handleRename(folder: Folder) {
    const name = window.prompt("폴더 이름 수정", folder.name);
    if (!name || !name.trim() || name.trim() === folder.name) return;

    try {
      await updateFolderAction(folder.id, name);
      // 폴더 이름 수정 후 목록 갱신
      router.refresh();
    } catch {
      window.alert("폴더 이름을 수정하지 못했습니다.");
    }
  }

  async function handleDelete(folder: Folder) {
    const confirmed = window.confirm(`'${folder.name}' 폴더를 삭제할까요? 폴더 안 링크는 미분류로 이동합니다.`);
    if (!confirmed) return;

    try {
      await deleteFolderAction(folder.id);
      // 폴더 삭제 후 목록 갱신
      router.refresh();
    } catch {
      window.alert("폴더를 삭제하지 못했습니다.");
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <Link
        href={hrefFor(null)}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors ${
          activeFolderId ? "text-foreground/80 hover:bg-accent" : "text-primary"
        }`}
      >
        <FolderIcon className="size-3 shrink-0 fill-current stroke-none" />
        전체
      </Link>
      {folders.map((folder) => (
        <div key={folder.id} className="group flex items-center rounded-lg hover:bg-accent">
          <Link
            href={hrefFor(folder.id)}
            className={`flex flex-1 items-center gap-2 truncate px-3 py-1.5 text-[13px] transition-colors ${
              activeFolderId === folder.id ? "font-semibold text-primary" : "text-foreground/80"
            }`}
          >
            <FolderIcon className="size-3 shrink-0 fill-current stroke-none" />
            <span className="truncate">{folder.name}</span>
          </Link>
          <button
            type="button"
            onClick={() => handleRename(folder)}
            aria-label={`${folder.name} 폴더 이름 수정`}
            className="flex size-6 shrink-0 items-center justify-center text-description opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
          >
            <Pencil className="size-3" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(folder)}
            aria-label={`${folder.name} 폴더 삭제`}
            className="mr-1 flex size-6 shrink-0 items-center justify-center text-description opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
