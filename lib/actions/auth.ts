"use server";

import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { generateSessionToken } from "@/lib/auth";


const SESSION_COOKIE_NAME = "badminton_session";


export async function createSessionForUser(userId: string, returnTo: string = "/sessions") {
  const sessionToken = generateSessionToken();

  await sql`
    INSERT INTO user_sessions (user_id, token) 
    VALUES (${userId}, ${sessionToken});
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });

  redirect(returnTo);
}

export async function emailAuthAction(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
): Promise<{ error?: string; success?: boolean } | undefined> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const name = (formData.get("name") as string)?.trim();
  const returnTo = (formData.get("returnTo") as string) || "/sessions";

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  // Check if user already exists
  const existingRows = await sql`
    SELECT id, name
    FROM profiles 
    WHERE LOWER(email) = ${email} 
    LIMIT 1;
  `;

  let userId: string;

  if (existingRows && existingRows.length > 0) {
    userId = existingRows[0].id as string;
  } else {
    // New joiner registration
    const playerName = name || email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    
    const insertRows = await sql`
      INSERT INTO profiles (name, email, role)
      VALUES (${playerName}, ${email}, 'PLAYER')
      RETURNING id;
    `;
    userId = insertRows[0]?.id as string;
  }

  await createSessionForUser(userId, returnTo);
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await sql`DELETE FROM user_sessions WHERE token = ${token};`;
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/sessions");
}
