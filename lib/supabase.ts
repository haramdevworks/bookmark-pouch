"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL 환경변수가 설정되지 않았습니다. .env.local 파일에 Supabase 프로젝트 URL을 입력해주세요.",
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 환경변수가 설정되지 않았습니다. .env.local 파일에 Supabase Publishable Key를 입력해주세요.",
  );
}

export const supabase = createBrowserClient(supabaseUrl, supabasePublishableKey, {
  cookies: {
    getAll() {
      if (typeof document === "undefined") return [];
      const cookies: { name: string; value: string }[] = [];
      document.cookie.split("; ").forEach(cookie => {
        const [name, ...rest] = cookie.split("=");
        if (name) cookies.push({ name, value: rest.join("=") });
      });
      return cookies;
    },
    setAll(cookiesToSet) {
      if (typeof document === "undefined") return;
      cookiesToSet.forEach(({ name, value, options }) => {
        let cookieString = `${name}=${value}`;
        if (options?.maxAge !== undefined) {
          cookieString += `; Max-Age=${options.maxAge}`;
        }
        if (options?.expires) {
          cookieString += `; Expires=${new Date(options.expires).toUTCString()}`;
        }
        if (options?.path) {
          cookieString += `; Path=${options.path}`;
        }
        if (options?.domain) {
          cookieString += `; Domain=${options.domain}`;
        }
        if (options?.secure) {
          cookieString += "; Secure";
        }
        if (options?.sameSite) {
          cookieString += `; SameSite=${options.sameSite}`;
        }
        document.cookie = cookieString;
      });
    },
  },
});
