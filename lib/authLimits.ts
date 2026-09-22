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

export const AUTH_LIMITS = {
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

/** The values currently in force, for diagnostics. */
export function describeAuthLimits() {
  return {
    windowSeconds: AUTH_LIMITS.windowSeconds,
    passwordPerAccount: AUTH_LIMITS.passwordAccount,
    passwordPerIp: AUTH_LIMITS.passwordIp,
    otpVerifyPerAccount: AUTH_LIMITS.otpAccount,
    otpVerifyPerIp: AUTH_LIMITS.otpIp,
    otpRequestsPerAccount: AUTH_LIMITS.otpRequestsAccount,
  };
}
