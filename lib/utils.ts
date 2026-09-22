import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * True when an error is Next's internal redirect control-flow signal.
 *
 * A Server Action that calls `redirect()` aborts with this error. When the action
 * is invoked imperatively from a client component the promise can reject with it —
 * and it means SUCCESS, so it must never be surfaced as a failure.
 */
export function isRedirectError(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
