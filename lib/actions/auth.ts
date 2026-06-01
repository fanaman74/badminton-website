"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE_NAME = "badminton_session";

function generateSessionToken(): string {
  return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "");
}

export async function loginAction(
  _prevState: { error?: string } | undefined,
  formData: FormData
): Promise<{ error?: string } | undefined> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  // Password is the shared team password
  if (password !== process.env.INVITE_CODE) {
    return { error: "Incorrect password." };
  }

  const supabase = await createClient();

  // Look up profile by email
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (profileError || !profile) {
    return { error: "Email not registered. Contact your team admin." };
  }

  // Create session token
  const sessionToken = generateSessionToken();

  const { error: sessionError } = await supabase
    .from("user_sessions")
    .insert({
      user_id: profile.id,
      token: sessionToken,
    });

  if (sessionError) {
    return { error: "Failed to create session. Please try again." };
  }

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  redirect("/sessions");
}

export async function signOutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/auth");
}
