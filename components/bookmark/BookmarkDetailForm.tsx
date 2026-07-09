"use client";

import { useActionState } from "react";
import { Calendar, ExternalLink, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateBookmarkAction, type BookmarkFormState } from "@/app/actions/bookmark-actions";
import { BookmarkTags } from "@/components/bookmark/BookmarkTags";
import { DeleteBookmarkButton } from "@/components/bookmark/DeleteBookmarkButton";
import type { Bookmark, Folder } from "@/types";

const initialState: BookmarkFormState = {};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * 상세 화면 = 수정 화면. 제목/URL/폴더/메모는 바로 고칠 수 있고 "저장"으로
 * 한 번에 반영한다. 태그는 클릭 즉시 반영되는 별도 컴포넌트를 그대로 쓴다.
 * AI 요약/핵심 문장/저장일은 시스템이 만든 값이라 읽기 전용이다.
 */
export function BookmarkDetailForm({ bookmark, folders }: { bookmark: Bookmark; folders: Folder[] }) {
  const action = updateBookmarkAction.bind(null, bookmark.id);
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      {bookmark.thumbnail && (
        <div className="overflow-hidden rounded-xl border border-border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={bookmark.thumbnail} alt="" className="h-40 w-full object-cover" />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title" className="text-[11px] text-description">제목</Label>
        <Input
          id="title"
          name="title"
          defaultValue={bookmark.title}
          className="h-9 rounded-none border-transparent bg-[#F2F2F2] px-3.5 text-[15px] font-bold focus-visible:border-primary focus-visible:ring-primary/30"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="url" className="text-[11px] text-description">URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          required
          defaultValue={bookmark.url}
          className="h-9 rounded-none border-transparent bg-[#F2F2F2] px-3.5 text-[13px] focus-visible:border-primary focus-visible:ring-primary/30"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="folderId" className="text-[11px] text-description">폴더</Label>
        <select
          id="folderId"
          name="folderId"
          defaultValue={bookmark.folderId ?? ""}
          className="h-9 w-full rounded-none border border-transparent bg-[#F2F2F2] px-3.5 text-[13px] text-foreground outline-none focus:border-primary"
        >
          <option value="">미분류</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      <span className="flex items-center gap-1 text-[11px] text-description">
        <Calendar className="size-3.5" />
        {formatDate(bookmark.createdAt)}
      </span>

      {bookmark.description && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-4">
          <p className="text-[11px] font-semibold text-description">설명</p>
          <p className="whitespace-pre-wrap text-[13px] text-foreground/80">{bookmark.description}</p>
        </div>
      )}

      {bookmark.summary && (
        <div className="flex flex-col gap-1.5 border-t border-border pt-4">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold text-description">
            <Sparkles className="size-3.5 text-primary" />
            AI 요약
          </p>
          <p className="whitespace-pre-wrap text-[13px] text-foreground/80">{bookmark.summary}</p>

          {bookmark.quotes.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-border pt-4">
              <p className="text-[11px] font-semibold text-description">핵심 문장</p>
              <ul className="flex flex-col gap-2">
                {bookmark.quotes.map((quote, index) => (
                  <li
                    key={index}
                    className="border-l-2 border-primary pl-3 text-[13px] italic text-foreground/80"
                  >
                    &ldquo;{quote}&rdquo;
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5 border-t border-border pt-4">
        <p className="text-[11px] font-semibold text-description">태그</p>
        <BookmarkTags bookmarkId={bookmark.id} tags={bookmark.tags} suggestions={bookmark.aiTags} />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-border pt-4">
        <Label htmlFor="memo" className="text-[11px] text-description">메모</Label>
        <Textarea
          id="memo"
          name="memo"
          rows={4}
          placeholder="이 자료에 대한 메모를 남겨보세요."
          defaultValue={bookmark.memo ?? ""}
          className="rounded-none border-transparent bg-[#F2F2F2] px-3.5 py-2.5 text-[13px] focus-visible:border-primary focus-visible:ring-primary/30"
        />
      </div>

      {state.error && <p className="text-[13px] text-destructive">{state.error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-[13px] font-semibold text-foreground transition-colors hover:bg-accent"
        >
          <ExternalLink className="size-3.5" />
          원문 보기
        </a>
        <DeleteBookmarkButton id={bookmark.id} />
        <Button
          type="submit"
          disabled={isPending}
          className="h-9 rounded-lg px-5 text-[13px] font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary hover:shadow-lg disabled:opacity-60"
        >
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
}
