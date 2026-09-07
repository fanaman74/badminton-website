"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { emailAuthAction, requestEmailOtpAction, verifyEmailOtpAction } from "@/lib/actions/auth";

const ADMIN_EMAILS = ["fredanaman@gmail.com", "marika.vernon@yahoo.co.uk"];

function AuthForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/sessions";
  const errorParam = searchParams.get("error");
  const isAdminTarget = returnTo.includes("/admin");

  const [mode, setMode] = useState<"signup" | "signin">(isAdminTarget ? "signin" : "signup");
  const [step, setStep] = useState<"email" | "otp">("email");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam || null);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState<string | null>(null);

  const isAdminEmail = ADMIN_EMAILS.includes(email.trim().toLowerCase());

  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name.");
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
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "24px 16px",
    }}>
      <div style={{ width: "100%", maxWidth: 390 }}>
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🏸</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26,
            color: "var(--ink)", letterSpacing: "-0.02em" }}>VUB Smashers</div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14,
            color: "var(--muted)", marginTop: 4 }}>
            {step === "otp"
              ? `Check your inbox at ${email}`
              : isAdminTarget
              ? "Admin Sign In: Set playing dates & courts"
              : mode === "signup"
              ? "Join our badminton sessions & community"
              : "Sign in to manage your RSVPs"}
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 24,
          border: "1px solid var(--line)",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 12px 32px -16px rgba(20,18,12,.20)",
        }}>
          {step === "email" ? (
            <>
              {/* Mode Switcher */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4,
                padding: 4, background: "var(--surface-2)", borderRadius: "var(--r-sm)",
                marginBottom: 18, border: "1px solid var(--line)",
              }}>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(null); }}
                  style={{
                    padding: "8px 0", border: "none", borderRadius: "calc(var(--r-sm) - 2px)",
                    background: mode === "signup" ? "var(--surface)" : "transparent",
                    color: mode === "signup" ? "var(--ink)" : "var(--muted)",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
                    boxShadow: mode === "signup" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    cursor: "pointer", transition: "all .15s ease",
                  }}
                >
                  Sign Up (Join)
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(null); }}
                  style={{
                    padding: "8px 0", border: "none", borderRadius: "calc(var(--r-sm) - 2px)",
                    background: mode === "signin" ? "var(--surface)" : "transparent",
                    color: mode === "signin" ? "var(--ink)" : "var(--muted)",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
                    boxShadow: mode === "signin" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    cursor: "pointer", transition: "all .15s ease",
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
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    width: "100%", height: 46, borderRadius: "var(--r-md)",
                    background: "#FFFFFF", border: "1.5px solid #E2E8F0",
                    color: "#1E293B", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14,
                    textDecoration: "none", transition: "all .15s ease",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </a>
              </div>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 16px" }}>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 11.5, color: "var(--faint)", textTransform: "uppercase" }}>
                  or with email
                </span>
                <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
              </div>

              {/* Email Form */}
              <form
                onSubmit={isAdminEmail && password ? handleAdminPasswordLogin : handleSendOtp}
                style={{ display: "flex", flexDirection: "column", gap: 13 }}
              >
                {mode === "signup" && (
                  <div>
                    <label htmlFor="name" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "var(--ink)", marginBottom: 5 }}>
                      Full Name
                    </label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      required={mode === "signup"}
                      placeholder="e.g. Alex Tan"
                      disabled={isLoading}
                      style={{
                        width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
                        padding: "11px 13px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14.5,
                        color: "var(--ink)", background: "var(--surface-2)", outline: "none",
                      }}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "var(--ink)", marginBottom: 5 }}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    placeholder="you@domain.com"
                    disabled={isLoading}
                    style={{
                      width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
                      padding: "11px 13px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14.5,
                      color: "var(--ink)", background: "var(--surface-2)", outline: "none",
                    }}
                  />
                </div>

                {isAdminEmail && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                      <label htmlFor="password" style={{ display: "block", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, color: "var(--ink)" }}>
                        Admin Password
                      </label>
                      <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--brand)", fontWeight: 700 }}>
                        Admin Account
                      </span>
                    </div>
                    <input
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Enter Badminton26"
                      disabled={isLoading}
                      style={{
                        width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
                        padding: "11px 13px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 14.5,
                        color: "var(--ink)", background: "var(--surface-2)", outline: "none",
                      }}
                    />
                  </div>
                )}

                {error && (
                  <div style={{
                    background: "color-mix(in srgb, var(--out) 10%, transparent)",
                    border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                    borderRadius: "var(--r-sm)", padding: "10px 14px",
                    fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--out)",
                  }}>
                    {error}
                  </div>
                )}

                {isAdminEmail && password ? (
                  <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                      width: "100%", height: 48, marginTop: 4, borderRadius: "var(--r-md)", border: "none",
                      background: "var(--brand)", color: "#fff",
                      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
                      cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1,
                      boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
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
                      width: "100%", height: 48, marginTop: 4, borderRadius: "var(--r-md)", border: "none",
                      background: "var(--brand)", color: "#fff",
                      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
                      cursor: isLoading ? "not-allowed" : "pointer", opacity: isLoading ? 0.7 : 1,
                      boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
                    }}
                  >
                    {isLoading ? "Sending code…" : "Send verification code →"}
                  </button>
                )}

                {isAdminEmail && !password && (
                  <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", margin: "4px 0 0" }}>
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
                    padding: "10px 14px",
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: 13,
                    color: "var(--in)",
                    textAlign: "center",
                  }}
                >
                  ✓ Verification code sent to {email}!
                </div>
              )}

              <div>
                <label
                  htmlFor="otp-input"
                  style={{
                    display: "block",
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--ink)",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  Enter the 6-digit verification code
                </label>
                <input
                  id="otp-input"
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
                    height: 54,
                    borderRadius: "var(--r-md)",
                    border: "2px solid var(--line)",
                    padding: "0 12px",
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 28,
                    letterSpacing: "8px",
                    textAlign: "center",
                    color: "var(--ink)",
                    background: "var(--surface-2)",
                    outline: "none",
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: "color-mix(in srgb, var(--out) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                  borderRadius: "var(--r-sm)", padding: "10px 14px",
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--out)",
                  textAlign: "center",
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                style={{
                  width: "100%", height: 48, borderRadius: "var(--r-md)", border: "none",
                  background: "var(--brand)", color: "#fff",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
                  cursor: isLoading || otpCode.length < 6 ? "not-allowed" : "pointer",
                  opacity: isLoading || otpCode.length < 6 ? 0.6 : 1,
                  boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
                }}
              >
                {isLoading ? "Verifying…" : "Verify & Sign In →"}
              </button>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(null); }}
                  style={{
                    background: "none", border: "none", color: "var(--muted)",
                    fontFamily: "var(--font-body)", fontSize: 12.5, cursor: "pointer",
                    padding: "4px 0", textDecoration: "underline",
                  }}
                >
                  ← Use different email
                </button>
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isLoading}
                  style={{
                    background: "none", border: "none", color: "var(--brand)",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5,
                    cursor: isLoading ? "not-allowed" : "pointer", padding: "4px 0",
                  }}
                >
                  Resend code
                </button>
              </div>
            </form>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
          Admin accounts: <strong>fredanaman@gmail.com</strong> &amp; <strong>marika.vernon@yahoo.co.uk</strong>
        </div>

        <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 12.5, color: "var(--muted)", marginTop: 18 }}>
          <a href="/sessions" style={{ color: "var(--muted)", textDecoration: "underline" }}>
            ← Return to upcoming sessions
          </a>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}>
      <AuthForm />
    </Suspense>
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
