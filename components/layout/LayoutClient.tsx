"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export function LayoutClient({
  nav,
  children,
}: {
  nav: ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/auth");

  return (
    <>
      {!isAuthPage && nav}
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1200px] px-4 py-6 md:px-8 md:py-8">{children}</div>
      </main>
    </>
  );
}
