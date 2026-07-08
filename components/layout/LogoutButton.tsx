"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="w-full flex items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2.5 text-[13px] font-semibold text-foreground transition-colors hover:bg-[#f8f8f8]"
    >
      <LogOut className="size-4" />
      로그아웃
    </button>
  );
}
