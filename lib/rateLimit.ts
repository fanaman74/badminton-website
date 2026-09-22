import { headers } from "next/headers";
import { sql } from "@/lib/db";

/**
 * DB-backed rate limiting for the credential entry points (password sign-in, and
 * requesting/verifying a login code).
 *
 * Kept in Postgres rather than in memory so it survives deploys and keeps working
 * if the app ever runs more than one instance.
 *
 * FAIL-OPEN BY DESIGN: if the table is missing (migration not applied yet) or the
 * query errors, the request is allowed and the error is logged. The failure mode
 * is "no rate limiting", never "nobody can sign in".
 */
const LOG_PREFIX = "[rateLimit]";

/** How many attempts remain for this key, without consuming one. */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number
): Promise<{ allowed: boolean; retryAfterSeconds?: number }> {
  try {
    const rows = await sql`
      SELECT attempts,
             EXTRACT(EPOCH FROM (window_start + make_interval(secs => ${windowSeconds}) - now()))::int AS remaining
      FROM auth_rate_limits
      WHERE key = ${key}
      LIMIT 1;
    `;

    const row = rows[0] as { attempts: number; remaining: number } | undefined;
    if (!row || row.remaining <= 0) return { allowed: true }; // no window, or it has expired
    if (row.attempts < max) return { allowed: true };

    return { allowed: false, retryAfterSeconds: Math.max(1, row.remaining) };
  } catch (err) {
    console.error(`${LOG_PREFIX} checkRateLimit failed — continuing without limiting:`, err);
    return { allowed: true };
  }
}

/** Consumes one attempt, starting a fresh window when the previous one expired. */
export async function registerAttempt(key: string, windowSeconds: number): Promise<void> {
  try {
    await sql`
      INSERT INTO auth_rate_limits (key, attempts, window_start)
      VALUES (${key}, 1, now())
      ON CONFLICT (key) DO UPDATE SET
        attempts = CASE
          WHEN auth_rate_limits.window_start <= now() - make_interval(secs => ${windowSeconds}) THEN 1
          ELSE auth_rate_limits.attempts + 1
        END,
        window_start = CASE
          WHEN auth_rate_limits.window_start <= now() - make_interval(secs => ${windowSeconds}) THEN now()
          ELSE auth_rate_limits.window_start
        END;
    `;

    // Opportunistic cleanup so the table cannot grow without bound
    await sql`DELETE FROM auth_rate_limits WHERE window_start < now() - INTERVAL '1 day';`;
  } catch (err) {
    console.error(`${LOG_PREFIX} registerAttempt failed — continuing without limiting:`, err);
  }
}

/** Clears the counter, e.g. after a successful sign-in. */
export async function clearRateLimit(key: string): Promise<void> {
  try {
    await sql`DELETE FROM auth_rate_limits WHERE key = ${key};`;
  } catch (err) {
    console.error(`${LOG_PREFIX} clearRateLimit failed:`, err);
  }
}

/** Message for a blocked attempt, in whole minutes. */
export function tooManyAttemptsMessage(retryAfterSeconds?: number): string {
  const minutes = Math.max(1, Math.ceil((retryAfterSeconds ?? 60) / 60));
  return `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

/**
 * Best-effort client IP, for a second rate-limit dimension.
 *
 * Railway (like most hosts) sets x-forwarded-for; the first entry is the original
 * client. Returns null when it cannot be determined, in which case the caller skips
 * IP limiting rather than blocking anyone.
 *
 * Note on limits: a whole sports hall can share one egress IP, so the IP budget is
 * deliberately generous — it exists to blunt distributed guessing, not to police
 * individual members.
 */
export async function getClientIp(): Promise<string | null> {
  try {
    const store = await headers();
    const forwarded = store.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    return store.get("x-real-ip")?.trim() || null;
  } catch {
    return null;
  }
}
