"use client";

import { useState } from "react";
import { emailAuthAction, requestEmailOtpAction, verifyEmailOtpAction } from "@/lib/actions/auth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "signin" | "signup";
  initialMode?: "signin" | "signup";
  returnTo?: string;
}

const ADMIN_EMAILS = ["fredanaman@gmail.com", "marika.vernon@yahoo.co.uk"];

export function AuthModal({ isOpen, onClose, defaultMode = "signup", initialMode, returnTo = "/sessions" }: Props) {
  const [mode, setMode] = useState<"signup" | "signin">(initialMode || defaultMode);
  const [step, setStep] = useState<"email" | "otp">("email");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdminEmail = ADMIN_EMAILS.includes(email.trim().toLowerCase());

  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setOtpSuccessMessage(null);

    const res = await requestEmailOtpAction(email, name);
    setIsLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setStep("otp");
      setOtpSuccessMessage(`We sent a 6-digit code to ${email}`);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 6) {
      setError("Please enter the 6-digit code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await verifyEmailOtpAction(email, otpCode.trim(), returnTo);
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
    // On success, verifyEmailOtpAction redirects automatically!
  }

  async function handleAdminPasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const fd = new FormData();
    fd.set("email", email);
    fd.set("password", password);
    fd.set("name", name);
    fd.set("returnTo", returnTo);

    const res = await emailAuthAction(undefined, fd);
    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
    // On success, emailAuthAction redirects automatically!
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--r-lg)",
          padding: "28px 24px",
          maxWidth: 400,
          width: "100%",
          border: "1px solid var(--line)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "var(--muted)",
            padding: 4,
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>🏸</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, color: "var(--ink)", margin: 0 }}>
            {step === "otp" ? "Enter verification code" : mode === "signup" ? "Join VUB Smashers" : "Welcome Back"}
          </h2>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13, color: "var(--muted)", marginTop: 4, lineHeight: 1.4 }}>
            {step === "otp"
              ? `We sent a 6-digit code to ${email}`
              : mode === "signup"
              ? "Sign up with your email to RSVP to badminton sessions"
              : "Sign in with your email or admin account"}
          </p>
        </div>

        {step === "email" ? (
          <>
            {/* Mode Switcher */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 4,
                padding: 3,
                background: "var(--surface-2)",
                borderRadius: "var(--r-sm)",
                marginBottom: 16,
                border: "1px solid var(--line)",
              }}
            >
              <button
                type="button"
                onClick={() => { setMode("signup"); setError(null); }}
                style={{
                  padding: "7px 0",
                  border: "none",
                  borderRadius: "calc(var(--r-sm) - 2px)",
                  background: mode === "signup" ? "var(--surface)" : "transparent",
                  color: mode === "signup" ? "var(--ink)" : "var(--muted)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: mode === "signup" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  cursor: "pointer",
                }}
              >
                Sign Up (Join)
              </button>
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(null); }}
                style={{
                  padding: "7px 0",
                  border: "none",
                  borderRadius: "calc(var(--r-sm) - 2px)",
                  background: mode === "signin" ? "var(--surface)" : "transparent",
                  color: mode === "signin" ? "var(--ink)" : "var(--muted)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: mode === "signin" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            </div>

            {/* Google OAuth Button */}
            <div style={{ marginBottom: 16 }}>
              <a
                href={`/api/auth/google?returnTo=${encodeURIComponent(returnTo)}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  width: "100%",
                  height: 44,
                  borderRadius: "var(--r-md)",
                  background: "#FFFFFF",
                  border: "1.5px solid #E2E8F0",
                  color: "#1E293B",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  transition: "all .15s ease",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <GoogleIcon />
                Continue with Google
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
            <form
              onSubmit={isAdminEmail && password ? handleAdminPasswordLogin : handleSendOtp}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {mode === "signup" && (
                <div>
                  <label htmlFor="modal-name" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5, color: "var(--ink)", marginBottom: 4 }}>
                    Your Name
                  </label>
                  <input
                    id="modal-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    type="text"
                    required={mode === "signup"}
                    placeholder="e.g. Alex Tan"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      borderRadius: "var(--r-sm)",
                      border: "1.5px solid var(--line)",
                      padding: "10px 12px",
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: 14,
                      color: "var(--ink)",
                      background: "var(--surface-2)",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              <div>
                <label htmlFor="modal-email" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5, color: "var(--ink)", marginBottom: 4 }}>
                  Email Address
                </label>
                <input
                  id="modal-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="you@domain.com"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    borderRadius: "var(--r-sm)",
                    border: "1.5px solid var(--line)",
                    padding: "10px 12px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: 14,
                    color: "var(--ink)",
                    background: "var(--surface-2)",
                    outline: "none",
                  }}
                />
              </div>

              {isAdminEmail && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <label htmlFor="modal-password" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5, color: "var(--ink)" }}>
                      Admin Password
                    </label>
                    <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--brand)", fontWeight: 700 }}>
                      Admin Account
                    </span>
                  </div>
                  <input
                    id="modal-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Enter Badminton26"
                    disabled={isLoading}
                    style={{
                      width: "100%",
                      borderRadius: "var(--r-sm)",
                      border: "1.5px solid var(--line)",
                      padding: "10px 12px",
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: 14,
                      color: "var(--ink)",
                      background: "var(--surface-2)",
                      outline: "none",
                    }}
                  />
                </div>
              )}

              {error && (
                <div
                  style={{
                    background: "color-mix(in srgb, var(--out) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                    borderRadius: "var(--r-sm)",
                    padding: "8px 12px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: 12.5,
                    color: "var(--out)",
                  }}
                >
                  {error}
                </div>
              )}

              {isAdminEmail && password ? (
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    height: 46,
                    marginTop: 4,
                    borderRadius: "var(--r-md)",
                    border: "none",
                    background: "var(--brand)",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                    boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
                  }}
                >
                  {isLoading ? "Signing in…" : "Sign In with Password →"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isLoading}
                  style={{
                    width: "100%",
                    height: 46,
                    marginTop: 4,
                    borderRadius: "var(--r-md)",
                    border: "none",
                    background: "var(--brand)",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 15,
                    cursor: isLoading ? "not-allowed" : "pointer",
                    opacity: isLoading ? 0.7 : 1,
                    boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
                  }}
                >
                  {isLoading ? "Sending code…" : "Send verification code →"}
                </button>
              )}

              {isAdminEmail && !password && (
                <p style={{ textAlign: "center", fontSize: 11.5, color: "var(--muted)", margin: "4px 0 0" }}>
                  Admins can enter password above or receive an email code.
                </p>
              )}
            </form>
          </>
        ) : (
          /* Step 2: OTP Verification */
          <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {otpSuccessMessage && (
              <div
                style={{
                  background: "color-mix(in srgb, var(--in) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--in) 35%, transparent)",
                  borderRadius: "var(--r-sm)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 12.5,
                  color: "var(--in)",
                  textAlign: "center",
                }}
              >
                ✓ Verification code sent! Please check your inbox.
              </div>
            )}

            <div>
              <label
                htmlFor="otp-code"
                style={{
                  display: "block",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--ink)",
                  marginBottom: 6,
                  textAlign: "center",
                }}
              >
                6-digit verification code
              </label>
              <input
                id="otp-code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                required
                placeholder="123456"
                disabled={isLoading}
                style={{
                  width: "100%",
                  height: 52,
                  borderRadius: "var(--r-md)",
                  border: "2px solid var(--line)",
                  padding: "0 12px",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 26,
                  letterSpacing: "8px",
                  textAlign: "center",
                  color: "var(--ink)",
                  background: "var(--surface-2)",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  background: "color-mix(in srgb, var(--out) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                  borderRadius: "var(--r-sm)",
                  padding: "8px 12px",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 12.5,
                  color: "var(--out)",
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || otpCode.length < 6}
              style={{
                width: "100%",
                height: 46,
                borderRadius: "var(--r-md)",
                border: "none",
                background: "var(--brand)",
                color: "#fff",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 15,
                cursor: isLoading || otpCode.length < 6 ? "not-allowed" : "pointer",
                opacity: isLoading || otpCode.length < 6 ? 0.6 : 1,
                boxShadow: "0 6px 16px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
              }}
            >
              {isLoading ? "Verifying…" : "Verify & Sign In →"}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
              <button
                type="button"
                onClick={() => { setStep("email"); setError(null); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  cursor: "pointer",
                  padding: "4px 0",
                  textDecoration: "underline",
                }}
              >
                ← Use a different email
              </button>
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={isLoading}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--brand)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  padding: "4px 0",
                }}
              >
                Resend code
              </button>
            </div>
          </form>
        )}
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
