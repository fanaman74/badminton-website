"use client";

import { useState } from "react";
import { removeMyRsvpAction } from "@/lib/actions/rsvp";

export function RemoveMyRsvpButton({
  sessionId,
  compact = false,
}: {
  sessionId: string;
  compact?: boolean;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    if (!confirm("Are you sure you want to remove your entry for this session?")) return;
    setIsRemoving(true);
    await removeMyRsvpAction(sessionId);
    setIsRemoving(false);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        style={{
          background: "color-mix(in srgb, var(--out) 10%, transparent)",
          border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
          color: "var(--out)",
          cursor: isRemoving ? "not-allowed" : "pointer",
          padding: "3px 8px",
          borderRadius: 6,
          fontSize: 11,
          fontFamily: "var(--font-body)",
          fontWeight: 700,
          transition: "all 0.15s ease",
        }}
        title="Remove my entry"
      >
        {isRemoving ? "Removing..." : "Remove entry"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isRemoving}
      style={{
        background: "color-mix(in srgb, var(--out) 10%, transparent)",
        border: "1px solid color-mix(in srgb, var(--out) 25%, transparent)",
        color: "var(--out)",
        cursor: isRemoving ? "not-allowed" : "pointer",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11.5,
        fontFamily: "var(--font-body)",
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        transition: "all 0.15s ease",
      }}
      title="Remove my entry"
    >
      <span>✕</span>
      <span>{isRemoving ? "Removing..." : "Remove my entry"}</span>
    </button>
  );
}
