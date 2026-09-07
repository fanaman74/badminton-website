"use client";

import { useState, useActionState } from "react";
import { emailAuthAction } from "@/lib/actions/auth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  returnTo?: string;
  initialMode?: "signin" | "signup";
}

export function AuthModal({ isOpen, onClose, returnTo = "/sessions", initialMode = "signup" }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [state, formAction, isPending] = useActionState(emailAuthAction, undefined);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(6, 12, 28, 0.75)", backdropFilter: "blur(6px)",
      WebkitBackdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "var(--surface)", borderRadius: "var(--r-lg)",
        border: "1px solid var(--line)", maxWidth: 400, width: "100%",
        padding: 24, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.3)",
        position: "relative",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
            width: 32, height: 32, borderRadius: 999, border: "none",
            background: "var(--surface-2)", color: "var(--muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 16,
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🏸</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--ink)" }}>
            {mode === "signup" ? "Join VUB Smashers" : "Welcome Back"}
          </div>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
            {mode === "signup" ? "Sign up with your personal email or social account" : "Sign in to manage your RSVPs and profile"}
          </p>
        </div>

        {/* Mode Toggle Pills */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
          padding: 4, background: "var(--surface-2)", borderRadius: "var(--r-sm)",
          marginBottom: 16, border: "1px solid var(--line)",
        }}>
          <button
            type="button"
            onClick={() => setMode("signup")}
            style={{
              padding: "7px 0", border: "none", borderRadius: "calc(var(--r-sm) - 2px)",
              background: mode === "signup" ? "var(--surface)" : "transparent",
              color: mode === "signup" ? "var(--ink)" : "var(--muted)",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
              boxShadow: mode === "signup" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              cursor: "pointer",
            }}
          >
            Sign Up (Join)
          </button>
          <button
            type="button"
            onClick={() => setMode("signin")}
            style={{
              padding: "7px 0", border: "none", borderRadius: "calc(var(--r-sm) - 2px)",
              background: mode === "signin" ? "var(--surface)" : "transparent",
              color: mode === "signin" ? "var(--ink)" : "var(--muted)",
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
              boxShadow: mode === "signin" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </div>

        {/* Social Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {/* Google */}
          <a
            href={`/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", height: 44, borderRadius: "var(--r-md)",
              background: "#FFFFFF", border: "1.5px solid #E2E8F0",
              color: "#1E293B", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14,
              textDecoration: "none", transition: "all .15s ease",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <GoogleIcon />
            Continue with Google
          </a>

          {/* Facebook */}
          <a
            href={`/api/auth/facebook?returnTo=${encodeURIComponent(returnTo)}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", height: 44, borderRadius: "var(--r-md)",
              background: "#1877F2", border: "none",
              color: "#FFFFFF", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14,
              textDecoration: "none", transition: "all .15s ease",
              boxShadow: "0 1px 2px rgba(24,119,242,0.3)",
            }}
          >
            <FacebookIcon />
            Continue with Facebook
          </a>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "14px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11.5, color: "var(--faint)", textTransform: "uppercase" }}>
            or with email
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        {/* Email Form */}
        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="hidden" name="returnTo" value={returnTo} />

          {mode === "signup" && (
            <div>
              <label htmlFor="name" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5, color: "var(--ink)", marginBottom: 4 }}>
                Your Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required={mode === "signup"}
                placeholder="e.g. Robin Sharma"
                disabled={isPending}
                style={{
                  width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
                  padding: "10px 12px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
                  color: "var(--ink)", background: "var(--surface-2)", outline: "none",
                }}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5, color: "var(--ink)", marginBottom: 4 }}>
              Personal Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@gmail.com"
              disabled={isPending}
              style={{
                width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
                padding: "10px 12px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
                color: "var(--ink)", background: "var(--surface-2)", outline: "none",
              }}
            />
          </div>

          {state?.error && (
            <div style={{
              background: "color-mix(in srgb, var(--out) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
              borderRadius: "var(--r-sm)", padding: "8px 12px",
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--out)",
            }}>
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            style={{
              width: "100%", height: 46, marginTop: 4, borderRadius: "var(--r-md)", border: "none",
              background: "var(--brand)", color: "#fff",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
              cursor: isPending ? "not-allowed" : "pointer", opacity: isPending ? 0.7 : 1,
              boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
            }}
          >
            {isPending ? "Connecting…" : mode === "signup" ? "Join the Team →" : "Sign in →"}
          </button>
        </form>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"/>
      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="#FFFFFF">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}
