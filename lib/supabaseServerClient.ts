"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

let cachedClient: ReturnType<typeof createServerClient> | null = null;
let cachedCookieStore: Awaited<ReturnType<typeof cookies>> | null = null;

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();

  // 쿠키가 변경되면 새 클라이언트 생성 (요청별 격리)
  if (cachedClient && cachedCookieStore === cookieStore) {
    return cachedClient;
  }

  cachedCookieStore = cookieStore;
  cachedClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle errors silently
          }
        },
      },
    }
  );

  return cachedClient;
}
