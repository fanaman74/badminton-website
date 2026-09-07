import { cookies } from "next/headers";
import { sql, type Profile } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

const SESSION_COOKIE_NAME = "badminton_session";

export async function getCurrentUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const rows = await sql`
    SELECT user_id 
    FROM user_sessions 
    WHERE token = ${sessionToken} 
      AND expires_at >= NOW() 
    LIMIT 1;
  `;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0].user_id as string;
}

export async function getCurrentUser(): Promise<Profile | null> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return null;
  }

  const rows = await sql`
    SELECT * 
    FROM profiles 
    WHERE id = ${userId} 
    LIMIT 1;
  `;

  if (!rows || rows.length === 0) {
    return null;
  }

  return rows[0] as Profile;
}

export function generateSessionToken(): string {
  return uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "");
}


