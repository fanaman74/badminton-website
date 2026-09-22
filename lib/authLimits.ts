import { sql } from "@/lib/db";

/** The six tunable sign-in limits. */
export interface AuthLimits {
  windowSeconds: number;
  passwordAccount: number;
  passwordIp: number;
  otpAccount: number;
  otpIp: number;
  otpRequestsAccount: number;
}

/**
 * Tunable sign-in rate limits.
 *
 * Every value falls back to the built-in default when its environment variable is
 * missing, blank or unusable, so a typo can never accidentally remove a limit.
 *
 * A value of 0 is honoured and means "refuse the very first attempt" — a deliberate
 * way to switch an entry point off, but also an easy way to lock everyone out, so
 * blank/negative values fall back to the default instead of being treated as 0.
 */
function num(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;

  return Math.floor(parsed);
}

export const AUTH_LIMITS: AuthLimits = {
  /** Length of every window below, in seconds. */
  windowSeconds: num("RATE_LIMIT_WINDOW_SECONDS", 900),

  /** Failed password sign-ins per account before the next attempt is refused. */
  passwordAccount: num("RATE_LIMIT_PASSWORD_ACCOUNT", 10),
  /** Failed password sign-ins per IP. Generous: a venue can share one egress IP. */
  passwordIp: num("RATE_LIMIT_PASSWORD_IP", 50),

  /** Failed login-code verifications per account. */
  otpAccount: num("RATE_LIMIT_OTP_ACCOUNT", 10),
  /** Failed login-code verifications per IP. */
  otpIp: num("RATE_LIMIT_OTP_IP", 50),

  /** Login-code requests per account — stops the form being used to spam a mailbox. */
  otpRequestsAccount: num("RATE_LIMIT_OTP_REQUESTS", 5),
} as const;

/**
 * Admin-set overrides live in app_settings under these keys. The env values above
 * stay as the defaults, so a fresh database (or a failed read) behaves sensibly.
 */
const SETTING_KEYS: Record<keyof AuthLimits, string> = {
  windowSeconds: "rate_limit.window_seconds",
  passwordAccount: "rate_limit.password_account",
  passwordIp: "rate_limit.password_ip",
  otpAccount: "rate_limit.otp_account",
  otpIp: "rate_limit.otp_ip",
  otpRequestsAccount: "rate_limit.otp_requests_account",
};

/** Field metadata for the admin form — also the validation applied on save. */
export const AUTH_LIMIT_FIELDS: {
  field: keyof AuthLimits;
  label: string;
  help: string;
  min: number;
  max: number;
}[] = [
  { field: "windowSeconds", label: "Window (seconds)", help: "Length of every window below.", min: 60, max: 86400 },
  { field: "passwordAccount", label: "Password attempts per account", help: "Failed password sign-ins before the next one is refused.", min: 0, max: 10000 },
  { field: "passwordIp", label: "Password attempts per IP", help: "Deliberately generous — a venue can share one egress IP.", min: 0, max: 10000 },
  { field: "otpAccount", label: "Code attempts per account", help: "Failed login-code verifications before the next one is refused.", min: 0, max: 10000 },
  { field: "otpIp", label: "Code attempts per IP", help: "Failed code verifications per IP address.", min: 0, max: 10000 },
  { field: "otpRequestsAccount", label: "Code requests per account", help: "Stops the form being used to spam a mailbox.", min: 0, max: 10000 },
];

/** Cached briefly so a burst of attempts doesn't read the table every time. */
const CACHE_TTL_MS = 30_000;
let cache: { at: number; overrides: Partial<AuthLimits> } | null = null;

async function getOverrides(): Promise<Partial<AuthLimits>> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.overrides;

  const overrides: Partial<AuthLimits> = {};
  try {
    const rows = (await sql`
      SELECT key, value FROM app_settings WHERE key LIKE 'rate_limit.%';
    `) as { key: string; value: number }[];

    const byKey = new Map(rows.map((row) => [row.key, row.value]));
    for (const spec of AUTH_LIMIT_FIELDS) {
      const value = byKey.get(SETTING_KEYS[spec.field]);
      if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
        overrides[spec.field] = value;
      }
    }
  } catch (err) {
    // Fail-open: unscoped/unavailable settings mean "no overrides", never "no sign-in"
    console.error("[authLimits] could not read overrides — using defaults:", err);
  }

  cache = { at: Date.now(), overrides };
  return overrides;
}

/** The values actually in force: env defaults with any admin overrides on top. */
export async function getAuthLimits(): Promise<AuthLimits> {
  return { ...AUTH_LIMITS, ...(await getOverrides()) };
}

/** Defaults, overrides and the effective result — for the admin form and diagnostics. */
export async function getAuthLimitsDetail(): Promise<{
  defaults: AuthLimits;
  overrides: Partial<AuthLimits>;
  effective: AuthLimits;
}> {
  const overrides = await getOverrides();
  return { defaults: { ...AUTH_LIMITS }, overrides, effective: { ...AUTH_LIMITS, ...overrides } };
}

/** Saves overrides, rejecting anything outside its bounds. */
export async function saveAuthLimits(
  values: Partial<Record<keyof AuthLimits, number>>
): Promise<{ error?: string; success?: boolean }> {
  for (const spec of AUTH_LIMIT_FIELDS) {
    const value = values[spec.field];
    if (value === undefined) continue;

    if (!Number.isInteger(value) || value < spec.min || value > spec.max) {
      return { error: `${spec.label} must be a whole number between ${spec.min} and ${spec.max}.` };
    }

    try {
      await sql`
        INSERT INTO app_settings (key, value, updated_at)
        VALUES (${SETTING_KEYS[spec.field]}, ${value}, now())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
      `;
    } catch (err) {
      console.error("[authLimits] failed to save an override:", err);
      return { error: "Could not save the limits. Please try again." };
    }
  }

  cache = null; // so the change applies on the very next read
  return { success: true };
}

/** Removes every override, returning to the env/built-in defaults. */
export async function resetAuthLimits(): Promise<{ error?: string; success?: boolean }> {
  try {
    await sql`DELETE FROM app_settings WHERE key LIKE 'rate_limit.%';`;
  } catch (err) {
    console.error("[authLimits] failed to reset overrides:", err);
    return { error: "Could not reset the limits. Please try again." };
  }

  cache = null;
  return { success: true };
}
