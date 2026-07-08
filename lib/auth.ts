"use server";

import { supabase } from "@/lib/supabase";

export async function getUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    throw new Error("Unauthorized");
  }

  return user.id;
}
