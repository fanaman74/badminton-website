"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg, #0f172a)",
        color: "var(--ink, #f8fafc)",
        padding: "24px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          background: "var(--surface, #1e293b)",
          border: "1px solid var(--line, #334155)",
          borderRadius: 16,
          padding: 32,
          textAlign: "center",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h2
          style={{
            fontSize: 22,
            fontWeight: 800,
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Something went wrong
        </h2>

        <p
          style={{
            fontSize: 14,
            color: "var(--muted, #94a3b8)",
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          We couldn’t load this page right now. Please try again.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "var(--accent, #3b82f6)",
              color: "var(--accent-ink, #1C2400)",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <button
            onClick={() => { window.location.href = "/sessions"; }}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid var(--line, #334155)",
              background: "transparent",
              color: "var(--ink, #f8fafc)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Back to sessions
          </button>
        </div>
      </div>
    </div>
  );
}
