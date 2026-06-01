"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE_NAME = "badminton_session";
const SESSION_TOKEN_LENGTH = 64;

function generateSessionToken(): string {
  return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "");
}

export async function validateInviteCodeAction(
  _prevState: { error: string } | void | undefined,
  formData: FormData
): Promise<{ error?: string }> {
  const inviteCode = formData.get("inviteCode") as string;

  if (!inviteCode) {
    return { error: "Please enter the invite code." };
  }

  if (inviteCode !== process.env.INVITE_CODE) {
    return { error: "Invalid invite code. Ask your team admin for the code." };
  }

  const supabase = await createClient();

  // Generate a new user ID and session token
  const userId = uuidv4();
  const sessionToken = generateSessionToken();

  // Create or get profile for this user
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single();

  if (!existingProfile) {
    // Create new profile with auto-generated name (format: Player + random suffix)
    const playerName = `Player ${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        name: playerName,
        role: "PLAYER",
      });

    if (profileError) {
      return { error: "Failed to create user profile. Please try again." };
    }
  }

  // Create session record
  const { error: sessionError } = await supabase
    .from("user_sessions")
    .insert({
      user_id: userId,
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
