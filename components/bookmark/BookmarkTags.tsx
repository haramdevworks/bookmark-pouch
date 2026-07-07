"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addTagToBookmarkAction, removeTagFromBookmarkAction } from "@/app/actions/tag-actions";
import type { Tag } from "@/types";

/**
 * 태그는 사용자가 입력하기 전에는 비워두고, 추가하려고 할 때만
 * AI 추천 태그(suggestions)를 후보로 보여준다.
 */
export function BookmarkTags({
  bookmarkId,
  tags,
  suggestions,
}: {
  bookmarkId: string;
  tags: Tag[];
  suggestions: string[];
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isPending, startTransition] = useTransition();

  const existingNames = new Set(tags.map((tag) => tag.name));
  const availableSuggestions = suggestions.filter((name) => !existingNames.has(name));

  function handleAdd(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    startTransition(async () => {
      await addTagToBookmarkAction(bookmarkId, trimmed);
      setInputValue("");
      setIsAdding(false);
    });
  }

  function handleRemove(tagId: string) {
    startTransition(async () => {
      await removeTagFromBookmarkAction(bookmarkId, tagId);
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span
          key={tag.id}
          className="inline-flex h-6 items-center gap-1 rounded-md bg-tag-bg py-0 pr-1.5 pl-3 text-[11px] font-medium text-tag-fg"
        >
          #{tag.name}
          <button
            type="button"
            onClick={() => handleRemove(tag.id)}
            disabled={isPending}
            aria-label={`${tag.name} 태그 삭제`}
            className="flex size-3.5 items-center justify-center rounded-sm text-tag-fg/60 transition-colors hover:bg-tag-fg/10 hover:text-tag-fg disabled:opacity-50"
          >
            <X className="size-2.5" />
          </button>
        </span>
      ))}

      {isAdding ? (
        <div className="flex basis-full flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <input
              autoFocus
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAdd(inputValue);
                }
                if (event.key === "Escape") {
                  setIsAdding(false);
                }
              }}
              placeholder="태그 이름 입력 후 Enter"
              className="h-6 w-36 rounded-md border border-border bg-transparent px-3 text-[11px] text-foreground outline-none focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-[11px] text-description hover:text-foreground"
            >
              취소
            </button>
          </div>

          {availableSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {availableSuggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleAdd(name)}
                  disabled={isPending}
                  className="inline-flex h-6 items-center rounded-md border border-dashed border-tag-fg/40 px-2.5 text-[11px] font-medium text-tag-fg transition-colors hover:bg-tag-bg disabled:opacity-50"
                >
                  +#{name}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex h-6 items-center gap-1 rounded-md border border-dashed border-border px-2.5 text-[11px] text-description transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="size-3" />
          태그 추가
        </button>
      )}
    </div>
  );
}
