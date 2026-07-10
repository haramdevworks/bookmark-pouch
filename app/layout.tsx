import type { Metadata } from "next";
import "pretendard/dist/web/variable/pretendardvariable.css";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { LayoutClient } from "@/components/layout/LayoutClient";

export const metadata: Metadata = {
  title: "POUCH",
  description: "리서치 자료 링크를 저장하고 다시 찾기 쉽게 관리하는 북마크 서비스",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground md:flex-row">
        <LayoutClient nav={
          <MobileNav>
            <Sidebar />
          </MobileNav>
        }>
          {children}
        </LayoutClient>
      </body>
    </html>
  );
}
