"use server";

import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { generateSessionToken } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";

const SESSION_COOKIE_NAME = "badminton_session";

// Designated admin accounts and credentials
const ADMIN_ACCOUNTS: Record<string, { name: string; password: string }> = {
  "fredanaman@gmail.com": { name: "Fred", password: "Badminton26" },
  "marika.vernon@yahoo.co.uk": { name: "Marika Vernon", password: "Badminton26" },
};

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
  const password = (formData.get("password") as string)?.trim();
  const name = (formData.get("name") as string)?.trim();
  const returnTo = (formData.get("returnTo") as string) || "/sessions";

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  const adminConfig = ADMIN_ACCOUNTS[email];

  // If this email belongs to an admin account, verify password
  if (adminConfig) {
    if (!password || password !== adminConfig.password) {
      return { error: "Incorrect password for admin account. Please enter the admin password." };
    }
  }

  // Check if user already exists
  const existingRows = await sql`
    SELECT id, name, role
    FROM profiles 
    WHERE LOWER(email) = ${email} 
    LIMIT 1;
  `;

  let userId: string;

  if (existingRows && existingRows.length > 0) {
    userId = existingRows[0].id as string;
    // Upgrade or confirm admin role if applicable
    if (adminConfig && existingRows[0].role !== "ADMIN") {
      await sql`
        UPDATE profiles
        SET role = 'ADMIN', name = COALESCE(NULLIF(name, ''), ${adminConfig.name})
        WHERE id = ${userId};
      `;
    }
  } else {
    // New registration
    const playerName =
      name ||
      (adminConfig
        ? adminConfig.name
        : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    const role = adminConfig ? "ADMIN" : "PLAYER";

    const insertRows = await sql`
      INSERT INTO profiles (name, email, role)
      VALUES (${playerName}, ${email}, ${role})
      RETURNING id;
    `;
    userId = insertRows[0]?.id as string;
  }

  await createSessionForUser(userId, returnTo);
}

export async function requestEmailOtpAction(
  emailInput: string,
  nameInput?: string
): Promise<{ success?: boolean; error?: string }> {
  const email = emailInput?.trim().toLowerCase();
  const name = nameInput?.trim();

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  // Generate 6-digit random code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Delete previous pending OTPs for this email
  await sql`DELETE FROM email_otps WHERE LOWER(email) = ${email};`;

  // Insert OTP with 10-minute expiry
  await sql`
    INSERT INTO email_otps (email, code, name, expires_at)
    VALUES (${email}, ${code}, ${name || null}, NOW() + INTERVAL '10 minutes');
  `;

  // Send email
  const sendRes = await sendOtpEmail(email, code, name);
  if (!sendRes.success && sendRes.error) {
    return { error: `Could not send verification email: ${sendRes.error}` };
  }

  return { success: true };
}

export async function verifyEmailOtpAction(
  emailInput: string,
  codeInput: string,
  returnTo: string = "/sessions"
): Promise<{ success?: boolean; error?: string }> {
  const email = emailInput?.trim().toLowerCase();
  const code = codeInput?.trim();

  if (!email || !code) {
    return { error: "Email and verification code are required." };
  }

  // Find matching valid OTP
  const otpRows = await sql`
    SELECT id, email, code, name
    FROM email_otps
    WHERE LOWER(email) = ${email}
      AND code = ${code}
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  if (!otpRows || otpRows.length === 0) {
    return { error: "Invalid or expired verification code. Please check your email or request a new code." };
  }

  const savedName = otpRows[0].name as string | null;

  // Delete used OTP
  await sql`DELETE FROM email_otps WHERE LOWER(email) = ${email};`;

  // Check if profile exists
  const existingRows = await sql`
    SELECT id, name, role
    FROM profiles
    WHERE LOWER(email) = ${email}
    LIMIT 1;
  `;

  const adminConfig = ADMIN_ACCOUNTS[email];
  let userId: string;

  if (existingRows && existingRows.length > 0) {
    userId = existingRows[0].id as string;
    if (adminConfig && existingRows[0].role !== "ADMIN") {
      await sql`UPDATE profiles SET role = 'ADMIN' WHERE id = ${userId};`;
    }
  } else {
    const playerName =
      savedName ||
      (adminConfig
        ? adminConfig.name
        : email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
    const role = adminConfig ? "ADMIN" : "PLAYER";

    const insertRows = await sql`
      INSERT INTO profiles (name, email, role)
      VALUES (${playerName}, ${email}, ${role})
      RETURNING id;
    `;
    userId = insertRows[0]?.id as string;
  }

  await createSessionForUser(userId, returnTo);
  return { success: true };
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
