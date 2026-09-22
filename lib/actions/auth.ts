"use server";

import { sql } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { generateSessionToken } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/email";
import { ADMIN_ACCOUNTS, verifyAdminPassword } from "@/lib/admin";
import { verifyPassword } from "@/lib/passwords";
import {
  checkRateLimit,
  registerAttempt,
  clearRateLimit,
  tooManyAttemptsMessage,
  getClientIp,
  PASSWORD_KEY_PREFIX,
  OTP_KEY_PREFIX,
  OTP_REQUEST_KEY_PREFIX,
} from "@/lib/rateLimit";
import { getAuthLimits } from "@/lib/authLimits";

// Rate-limit values come from lib/authLimits.ts — env defaults plus any admin overrides

const SESSION_COOKIE_NAME = "badminton_session";

// Admin accounts and the ADMIN_PASSWORD check live in lib/admin.ts

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
  // Deliberately not trimmed: a password is hashed and verified byte for byte
  const password = (formData.get("password") as string) ?? "";
  const name = (formData.get("name") as string)?.trim();
  const returnTo = (formData.get("returnTo") as string) || "/sessions";

  if (!email || !email.includes("@")) {
    return { error: "Please enter a valid email address." };
  }

  // SECURITY: this action must never mint a session without checking a credential.
  // The emailed-code path goes through verifyEmailOtpAction instead. (Previously a
  // non-admin email with no password was signed in with no verification at all.)
  // Checked before any lookup so junk requests never touch the database.
  if (!password) {
    return { error: "Enter your password, or request a login code by email." };
  }

  // Effective limits: env defaults with any admin overrides from app_settings
  const limits = await getAuthLimits();

  // Throttle password guessing against a single account
  const pwKey = `${PASSWORD_KEY_PREFIX}${email}`;
  const pwLimit = await checkRateLimit(pwKey, limits.passwordAccount, limits.windowSeconds);
  if (!pwLimit.allowed) {
    return { error: tooManyAttemptsMessage(pwLimit.retryAfterSeconds) };
  }

  // …and a looser per-IP budget, so guessing spread across many accounts is still
  // slowed down. Generous on purpose: a sports hall can share one egress IP.
  const clientIp = await getClientIp();
  const ipKey = clientIp ? `ip-pw:${clientIp}` : null;
  if (ipKey) {
    const ipLimit = await checkRateLimit(ipKey, limits.passwordIp, limits.windowSeconds);
    if (!ipLimit.allowed) {
      return { error: tooManyAttemptsMessage(ipLimit.retryAfterSeconds) };
    }
  }

  const adminConfig = ADMIN_ACCOUNTS[email];

  // Look the member up once, so we have their stored hash to verify against
  const existingRows = await sql`
    SELECT id, name, role, password_hash
    FROM profiles
    WHERE LOWER(email) = ${email}
    LIMIT 1;
  `;

  const existing = existingRows[0] as
    | { id: string; name: string; role: string; password_hash: string | null }
    | undefined;

  const passwordMatches =
    (existing?.password_hash ? verifyPassword(password, existing.password_hash) : false) ||
    (adminConfig ? verifyAdminPassword(password).ok : false);

  if (!passwordMatches) {
    await registerAttempt(pwKey, limits.windowSeconds);
    if (ipKey) await registerAttempt(ipKey, limits.windowSeconds);
    if (!existing?.password_hash && !adminConfig) {
      return {
        error:
          "No password is set for this email yet. Request a login code instead, then set a password from your profile.",
      };
    }
    return { error: "Incorrect email or password." };
  }

  let userId: string;

  if (existing) {
    userId = existing.id;
    // Upgrade or confirm admin role if applicable
    if (adminConfig && existing.role !== "ADMIN") {
      await sql`
        UPDATE profiles
        SET role = 'ADMIN', name = COALESCE(NULLIF(name, ''), ${adminConfig.name})
        WHERE id = ${userId};
      `;
    }
  } else {
    // Only reachable for a designated admin email that has no profile yet: everyone
    // else needs an existing password to get this far, so this profile is always an admin.
    const playerName = name || adminConfig?.name || email.split("@")[0];
    const insertRows = await sql`
      INSERT INTO profiles (name, email, role)
      VALUES (${playerName}, ${email}, 'ADMIN')
      RETURNING id;
    `;
    userId = insertRows[0]?.id as string;
  }

  await clearRateLimit(pwKey);

  // Local sign-in (emailed code / admin password) — access resets apply to them
  await sql`UPDATE profiles SET auth_provider = 'email' WHERE id = ${userId} AND auth_provider <> 'email';`;

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

  const limits = await getAuthLimits();

  // Throttle code requests per address — otherwise the form can be used to spam a mailbox
  const requestKey = `${OTP_REQUEST_KEY_PREFIX}${email}`;
  const requestLimit = await checkRateLimit(requestKey, limits.otpRequestsAccount, limits.windowSeconds);
  if (!requestLimit.allowed) {
    return { error: tooManyAttemptsMessage(requestLimit.retryAfterSeconds) };
  }
  await registerAttempt(requestKey, limits.windowSeconds);

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

  const limits = await getAuthLimits();

  // Throttle code guessing (6 digits is only a million combinations)
  const otpKey = `${OTP_KEY_PREFIX}${email}`;
  const otpLimit = await checkRateLimit(otpKey, limits.otpAccount, limits.windowSeconds);
  if (!otpLimit.allowed) {
    return { error: tooManyAttemptsMessage(otpLimit.retryAfterSeconds) };
  }

  // Same idea per IP, for guessing spread across many addresses
  const otpIp = await getClientIp();
  const otpIpKey = otpIp ? `ip-otp:${otpIp}` : null;
  if (otpIpKey) {
    const ipLimit = await checkRateLimit(otpIpKey, limits.otpIp, limits.windowSeconds);
    if (!ipLimit.allowed) {
      return { error: tooManyAttemptsMessage(ipLimit.retryAfterSeconds) };
    }
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
    await registerAttempt(otpKey, limits.windowSeconds);
    if (otpIpKey) await registerAttempt(otpIpKey, limits.windowSeconds);
    return { error: "Invalid or expired verification code. Please check your email or request a new code." };
  }

  const savedName = otpRows[0].name as string | null;

  // Correct code: clear the throttle and consume it
  await clearRateLimit(otpKey);

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

  // Local sign-in (emailed code) — access resets apply to them
  await sql`UPDATE profiles SET auth_provider = 'email' WHERE id = ${userId} AND auth_provider <> 'email';`;

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
