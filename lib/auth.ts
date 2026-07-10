"use server";

import { getSupabaseServerClient } from "./supabaseServerClient";
import { redirect } from "next/navigation";

export async function getUserId(): Promise<string> {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[auth.ts] getUser 결과:", {
    user: user ? { id: user.id, email: user.email } : null,
    session: "check cookies"
  });

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  return user.id;
}

export async function logout(): Promise<void> {
  const supabase = await getSupabaseServerClient();

  await supabase.auth.signOut();
  redirect("/auth/login");
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}

export async function getUserProfile(): Promise<UserProfile> {
  const supabase = await getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !user.email) {
    throw new Error("Unauthorized");
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.user_metadata?.name || user.email?.split("@")[0],
    avatarUrl: user.user_metadata?.avatar_url,
  };
}
