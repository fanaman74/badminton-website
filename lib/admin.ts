/**
 * Admin sign-in rules.
 *
 * Kept in a plain module rather than in a "use server" action file so the
 * credential checks can be exercised directly in tests.
 *
 * The designated admin addresses are not secret — the password is, so it is read
 * from the ADMIN_PASSWORD environment variable instead of being hardcoded here.
 * This repository is public, so a literal would let anybody sign in as an admin.
 */
export const ADMIN_ACCOUNTS: Record<string, { name: string }> = {
  "fredanaman@gmail.com": { name: "Fred" },
  "marika.vernon@yahoo.co.uk": { name: "Marika Vernon" },
};

/** The configured admin password, or null when ADMIN_PASSWORD is unset or blank. */
export function getAdminPassword(): string | null {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value ? value : null;
}

/**
 * Whether admins can sign in with a password at all. Used to hide the password
 * field instead of showing one that can never succeed.
 */
export function isAdminPasswordConfigured(): boolean {
  return getAdminPassword() !== null;
}

/**
 * Validates an admin password.
 *
 * Fails closed: when ADMIN_PASSWORD is not set, no password is accepted, so a
 * missing variable can never open up admin access. Admins can still sign in with
 * an emailed login code, which proves they control the mailbox anyway.
 */
export function verifyAdminPassword(
  password: string | null | undefined
): { ok: true } | { ok: false; error: string } {
  const expected = getAdminPassword();

  if (!expected) {
    return {
      ok: false,
      error: "Admin password sign-in is not configured. Use the emailed login code instead.",
    };
  }

  if (!password || password.trim() !== expected) {
    return { ok: false, error: "Incorrect password for admin account." };
  }

  return { ok: true };
}
