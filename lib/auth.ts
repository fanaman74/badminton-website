import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const SESSION_COOKIE_NAME = "badminton_session";

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_sessions")
    .select("user_id")
    .eq("token", sessionToken)
    .gte("expires_at", new Date().toISOString())
    .single();

  if (error || !data) {
    return null;
  }

  return data.user_id;
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  return data;
}
