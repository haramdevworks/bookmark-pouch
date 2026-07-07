import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "POUCH",
  description: "리서치 자료 링크를 저장하고 다시 찾기 쉽게 관리하는 북마크 서비스",
};

// 모든 화면이 Supabase의 최신 데이터를 기준으로 렌더링되도록 정적 프리렌더링을 끈다.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex bg-background text-foreground">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-[1200px] px-8 py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
