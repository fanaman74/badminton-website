import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/**
 * Password hashing for member sign-in.
 *
 * Uses Node's built-in scrypt — memory-hard, and no extra dependency to audit or
 * keep patched. The cost parameter is stored with each hash so it can be raised
 * later without invalidating existing passwords. Stored format:
 *
 *   scrypt$<N>$<salt-hex>$<hash-hex>
 */
const SCRYPT_COST = 16384; // N — CPU/memory cost
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const derived = scryptSync(password, salt, KEY_LENGTH, { N: SCRYPT_COST });
  return `scrypt$${SCRYPT_COST}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/** Constant-time verification. Returns false for empty/malformed stored values. */
export function verifyPassword(password: string, stored: string | null | undefined): boolean {
  if (!stored || !password) return false;

  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "scrypt") return false;

  const cost = Number(parts[1]);
  if (!Number.isInteger(cost) || cost <= 0) return false;

  const salt = Buffer.from(parts[2], "hex");
  const expected = Buffer.from(parts[3], "hex");
  if (salt.length === 0 || expected.length === 0) return false;

  try {
    const derived = scryptSync(password, salt, expected.length, { N: cost });
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Minimum rules for a member-chosen password. */
export function checkPasswordStrength(
  password: string | null | undefined
): { ok: true } | { ok: false; error: string } {
  const value = password ?? "";

  if (value.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (value.length > 200) {
    return { ok: false, error: "Password must be 200 characters or fewer." };
  }
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return { ok: false, error: "Password must include at least one letter and one number." };
  }
  return { ok: true };
}
