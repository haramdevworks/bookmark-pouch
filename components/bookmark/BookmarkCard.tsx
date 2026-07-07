"use client";

import { useRouter } from "next/navigation";
import { Calendar, Folder as FolderIcon, Globe } from "lucide-react";
import type { Bookmark, Folder } from "@/types";
import { TagBadge } from "@/components/common/TagBadge";
import { BookmarkCardActions } from "./BookmarkCardActions";

const HIDDEN_CONTENT_TYPES = new Set(["기타", "기사"]);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function BookmarkCard({
  bookmark,
  folder,
}: {
  bookmark: Bookmark;
  folder: Folder | null;
}) {
  const router = useRouter();
  const siteLabel = bookmark.siteName ?? new URL(bookmark.url).hostname;
  const showContentType = bookmark.contentType && !HIDDEN_CONTENT_TYPES.has(bookmark.contentType);

  function goToDetail() {
    router.push(`/links/${bookmark.id}`);
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={goToDetail}
      onKeyDown={(event) => {
        if (event.key === "Enter") goToDetail();
      }}
      className="group flex cursor-pointer flex-col gap-4 rounded-xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(47,47,47,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(47,47,47,0.08)] sm:flex-row sm:gap-5"
    >
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-2xl bg-muted sm:h-[140px] sm:w-[220px]">
        {bookmark.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bookmark.thumbnail} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Globe className="size-8 text-description" />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-col gap-1">
            {showContentType && (
              <span className="inline-flex w-fit items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">
                {bookmark.contentType}
              </span>
            )}
            <h3 className="line-clamp-2 text-base font-bold text-foreground">{bookmark.title}</h3>
          </div>
          <BookmarkCardActions bookmark={bookmark} />
        </div>

        {bookmark.description && (
          <p className="line-clamp-2 text-[13px] text-description">{bookmark.description}</p>
        )}

        {bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {bookmark.tags.map((tag) => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] text-description">
          <span className="flex items-center gap-1">
            <FolderIcon className="size-3.5" />
            {folder?.name ?? "미분류"}
          </span>
          <span className="flex items-center gap-1">
            <Globe className="size-3.5" />
            {siteLabel}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="size-3.5" />
            {formatDate(bookmark.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
