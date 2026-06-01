"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";

export default function AuthPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    { error: undefined } as { error?: string }
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "0 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 360 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏸</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28,
            color: "var(--ink)", letterSpacing: "-0.02em" }}>VUB Smashers</div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
            color: "var(--muted)", marginTop: 6 }}>Sign in with your team email</div>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 24,
          border: "1px solid var(--line)",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 12px 32px -16px rgba(20,18,12,.20)",
        }}>
          <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label htmlFor="email" style={{ display: "block", fontFamily: "var(--font-body)",
                fontWeight: 700, fontSize: 13, color: "var(--ink)", marginBottom: 6 }}>
                Email
              </label>
              <input
                id="email" name="email" type="email" required autoFocus
                placeholder="you@example.com"
                disabled={isPending}
                style={{
                  width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
                  padding: "12px 14px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15,
                  color: "var(--ink)", background: "var(--surface-2)", outline: "none",
                  transition: "border-color .15s",
                }}
              />
            </div>
            <div>
              <label htmlFor="password" style={{ display: "block", fontFamily: "var(--font-body)",
                fontWeight: 700, fontSize: 13, color: "var(--ink)", marginBottom: 6 }}>
                Password
              </label>
              <input
                id="password" name="password" type="password" required
                placeholder="Team password"
                disabled={isPending}
                style={{
                  width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
                  padding: "12px 14px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15,
                  color: "var(--ink)", background: "var(--surface-2)", outline: "none",
                }}
              />
            </div>

            {state?.error && (
              <div style={{ background: "color-mix(in srgb, var(--out) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                borderRadius: "var(--r-sm)", padding: "10px 14px",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--out)" }}>
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              style={{
                width: "100%", height: 50, borderRadius: "var(--r-md)", border: "none",
                background: "var(--brand)", color: "var(--brand-ink)",
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
                cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
                boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
                transition: "all .15s ease",
              }}>
              {isPending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
