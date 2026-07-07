"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu, X } from "lucide-react";

/**
 * 데스크톱에서는 사이드바를 그대로 보여주고, 모바일(md 미만)에서는
 * 상단바 + 햄버거 버튼으로 여닫는 오버레이 드로어로 바꿔준다.
 * 사이드바 자체(폴더/태그 데이터 fetch)는 그대로 Server Component로 두고
 * children으로 받아서 감싸기만 한다.
 */
export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 링크 클릭 등으로 라우트가 바뀌면 열려있던 드로어를 자동으로 닫는다.
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  return (
    <>
      <header className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-3 md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="POUCH" className="h-6 w-auto" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="메뉴 열기"
          className="flex size-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {open && (
        <div
          role="presentation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 flex -translate-x-full transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="메뉴 닫기"
          className="absolute top-6 right-3 flex size-7 items-center justify-center rounded-md text-description transition-colors hover:bg-accent hover:text-foreground md:hidden"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </>
  );
}
