"use client";

import "pretendard/dist/web/variable/pretendardvariable.css";
import "./globals.css";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="ko">
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card px-8 py-16 text-center">
          <p className="text-[13px] text-description">
            앱을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
