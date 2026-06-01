"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSessionAction } from "@/lib/actions/sessions";

export function DeleteSessionButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    const result = await deleteSessionAction(sessionId);
    if (result.error) {
      setError(result.error);
      setIsDeleting(false);
    } else {
      router.push("/sessions");
    }
  }

  if (showConfirm) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}>
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 24,
          border: "1px solid var(--line)", maxWidth: 320, width: "100%",
        }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
            color: "var(--ink)", marginBottom: 8 }}>Delete session?</div>
          <p style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 14,
            color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
            This will delete the session and all RSVPs. This cannot be undone.
          </p>
          {error && (
            <div style={{ background: "color-mix(in srgb, var(--out) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
              borderRadius: "var(--r-sm)", padding: "8px 12px",
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: "var(--out)",
              marginBottom: 12 }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isDeleting}
              style={{
                flex: 1, height: 40, borderRadius: "var(--r-md)", border: "1px solid var(--line)",
                background: "var(--surface)", color: "var(--ink)",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
                cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.5 : 1,
              }}>
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                flex: 1, height: 40, borderRadius: "var(--r-md)", border: "none",
                background: "var(--out)", color: "#fff",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13,
                cursor: isDeleting ? "not-allowed" : "pointer", opacity: isDeleting ? 0.5 : 1,
              }}>
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      style={{
        width: 42, height: 42, borderRadius: 999, border: "1px solid var(--line)",
        background: "var(--surface)", color: "var(--out)", display: "flex",
        alignItems: "center", justifyContent: "center", cursor: "pointer",
        fontSize: 18, lineHeight: 1,
      }}
      title="Delete session">
      🗑️
    </button>
  );
}
