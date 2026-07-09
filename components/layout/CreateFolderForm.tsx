"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createFolderAction, type FolderActionState } from "@/app/actions/folder-actions";

const initialState: FolderActionState = {};

export function CreateFolderForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createFolderAction, initialState);

  useEffect(() => {
    if (!state.error) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-1 px-2 pt-2">
      <div className="flex items-center gap-1.5">
        <input
          name="name"
          placeholder="새 폴더 이름"
          required
          maxLength={30}
          className="h-7 min-w-0 flex-1 rounded-lg border border-border bg-transparent px-2.5 text-[13px] text-foreground outline-none placeholder:text-description focus:border-primary"
        />
        <button
          type="submit"
          disabled={isPending}
          aria-label="폴더 추가"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-description transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          <Plus className="size-3.5" />
        </button>
      </div>
      {state.error && <p className="text-[11px] text-destructive">{state.error}</p>}
    </form>
  );
}
