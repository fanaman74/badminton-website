"use client";

import { useState } from "react";
import { adminRemoveRsvpAction } from "@/lib/actions/rsvp";

export function AdminRemoveRsvpButton({
  sessionId,
  userId,
  playerName,
}: {
  sessionId: string;
  userId: string;
  playerName: string;
}) {
  const [isRemoving, setIsRemoving] = useState(false);

  async function handleRemove() {
    if (!confirm(`Remove ${playerName} from this session?`)) return;
    setIsRemoving(true);
    await adminRemoveRsvpAction(sessionId, userId);
    setIsRemoving(false);
  }

  return (
    <button
      onClick={handleRemove}
      disabled={isRemoving}
      style={{
        background: "transparent",
        border: "none",
        color: "var(--faint)",
        cursor: isRemoving ? "not-allowed" : "pointer",
        padding: "4px 8px",
        borderRadius: 6,
        fontSize: 12,
        lineHeight: 1,
        transition: "all 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--out)";
        e.currentTarget.style.background = "color-mix(in srgb, var(--out) 10%, transparent)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--faint)";
        e.currentTarget.style.background = "transparent";
      }}
      title={`Remove ${playerName}`}
    >
      {isRemoving ? "…" : "✕"}
    </button>
  );
}
