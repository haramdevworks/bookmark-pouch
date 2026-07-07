"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card px-6 py-24 text-center">
      <p className="text-[13px] text-description">문제가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      >
        다시 시도
      </button>
    </div>
  );
}
