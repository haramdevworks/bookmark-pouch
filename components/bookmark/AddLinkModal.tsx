"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createBookmarkAction } from "@/app/actions/bookmark-actions";

/**
 * 등록의 유일한 입구. URL만 입력받아 저장하고, 제목/설명/썸네일/AI 요약은
 * 저장 직후 백그라운드에서 채워진다. 세부 내용은 저장 후 수정 화면에서 다듬는다.
 */
export function AddLinkModal({ variant = "fab" }: { variant?: "fab" | "cta" }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await createBookmarkAction({}, formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      formRef.current?.reset();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setError(null);
      }}
    >
      <DialogTrigger
        className={
          variant === "fab"
            ? "fixed right-8 bottom-8 flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            : "inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        }
      >
        <Plus className="size-3.5" />
        {variant === "fab" ? "새 링크 등록" : "추가하기"}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">새 링크 등록</DialogTitle>
          <DialogDescription className="text-[13px]">
            URL만 입력하면 제목, 설명, AI 요약까지 자동으로 채워드려요.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            name="url"
            type="url"
            required
            autoFocus
            placeholder="https://example.com"
            className="h-9 rounded-xl px-3.5 text-[13px] focus-visible:border-primary focus-visible:ring-primary/30"
          />

          {error && <p className="text-[13px] text-destructive">{error}</p>}

          <DialogFooter className="-mx-0 -mb-0 rounded-none border-t-0 bg-transparent p-0 sm:justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="h-9 rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
            >
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
