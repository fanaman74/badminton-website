"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSessionAction } from "@/lib/actions/sessions";

export function DeleteSessionButton({
  sessionId,
  redirectUrl,
  compact = false,
}: {
  sessionId: string;
  redirectUrl?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    setIsDeleting(true);
    setError(null);
    const result = await deleteSessionAction(sessionId);
    if (result.error) {
      setError(result.error);
      setIsDeleting(false);
    } else {
      setShowConfirm(false);
      if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.refresh();
      }
    }
  }

  if (showConfirm) {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
          backdropFilter: "blur(4px)",
        }}
      >
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "var(--r-lg)",
            padding: 24,
            border: "1px solid var(--line)",
            maxWidth: 340,
            width: "100%",
            boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 18,
              color: "var(--ink)",
              marginBottom: 8,
            }}
          >
            Delete entry?
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: 13.5,
              color: "var(--muted)",
              marginBottom: 18,
              lineHeight: 1.5,
            }}
          >
            This will permanently remove this session and all its RSVPs. This cannot be undone.
          </p>
          {error && (
            <div
              style={{
                background: "color-mix(in srgb, var(--out) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                borderRadius: "var(--r-sm)",
                padding: "8px 12px",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: 12,
                color: "var(--out)",
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(false);
              }}
              disabled={isDeleting}
              style={{
                flex: 1,
                height: 38,
                borderRadius: "var(--r-md)",
                border: "1px solid var(--line)",
                background: "var(--surface-2)",
                color: "var(--ink)",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 13,
                cursor: isDeleting ? "not-allowed" : "pointer",
                opacity: isDeleting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                flex: 1,
                height: 38,
                borderRadius: "var(--r-md)",
                border: "none",
                background: "var(--out)",
                color: "#fff",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 13,
                cursor: isDeleting ? "not-allowed" : "pointer",
                opacity: isDeleting ? 0.5 : 1,
              }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirm(true);
      }}
      style={{
        width: compact ? 32 : 42,
        height: compact ? 32 : 42,
        borderRadius: 999,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        color: "var(--out)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: compact ? 14 : 18,
        lineHeight: 1,
        transition: "all 0.15s ease",
        flexShrink: 0,
      }}
      title="Delete session entry"
    >
      🗑️
    </button>
  );
}
