"use client";

import { useEffect } from "react";
import Link from "next/link";

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
          The server encountered an error while processing this request. This often happens if the{" "}
          <strong style={{ color: "#38bdf8" }}>DATABASE_URL</strong> environment variable is not configured on Railway.
        </p>

        {error?.digest && (
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(0,0,0,0.2)",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "monospace",
              color: "var(--faint, #64748b)",
              marginBottom: 24,
              wordBreak: "break-all",
            }}
          >
            Error Digest: {error.digest}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            onClick={() => reset()}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "none",
              background: "var(--accent, #3b82f6)",
              color: "#fff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          <Link
            href="/setup"
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid var(--line, #334155)",
              background: "transparent",
              color: "var(--ink, #f8fafc)",
              fontWeight: 600,
              fontSize: 14,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Setup Guide
          </Link>
        </div>
      </div>
    </div>
  );
}
