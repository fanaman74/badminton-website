"use client";

import { useState, useTransition } from "react";
import { updateRsvp } from "@/lib/actions/rsvp";
import type { RsvpStatus } from "@/types/database";

interface Props {
  sessionId: string;
  currentStatus: RsvpStatus | null;
  isFull: boolean;
}

export function RsvpButtons({ sessionId, currentStatus, isFull }: Props) {
  const [status, setStatus] = useState<RsvpStatus | null>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const activeKey = status === "WAITLIST" ? "IN" : status;

  const opts = [
    { key: "IN" as const,    label: isFull && status !== "IN" && status !== "WAITLIST" ? "Waitlist" : "In",    color: "var(--in)" },
    { key: "MAYBE" as const, label: "Maybe", color: "var(--maybe)" },
    { key: "OUT" as const,   label: "Out",   color: "var(--out)" },
  ];

  function handleRsvp(key: "IN" | "MAYBE" | "OUT") {
    startTransition(async () => {
      const result = await updateRsvp(sessionId, key);
      if (result.status) setStatus(result.status);
    });
  }

  const icons = {
    IN:    <CheckIcon />,
    MAYBE: <MaybeIcon />,
    OUT:   <XIcon />,
  };

  return (
    <div style={{
      position: "fixed", bottom: 65, left: 0, right: 0, zIndex: 20,
      padding: "12px 16px 16px", background: "var(--surface)",
      borderTop: "1px solid var(--line)",
      boxShadow: "0 -8px 24px -18px rgba(20,18,12,.5)",
    }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr 1fr", gap: 9 }}>
        {opts.map((o) => {
          const on = activeKey === o.key;
          return (
            <button
              key={o.key}
              onClick={() => handleRsvp(o.key)}
              disabled={isPending}
              style={{
                border: on ? "none" : "1.5px solid var(--line)",
                cursor: "pointer",
                background: on ? o.color : "var(--surface)",
                color: on ? "#fff" : "var(--ink)",
                borderRadius: "var(--r-md)",
                padding: "14px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 5,
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 15.5,
                boxShadow: on ? `0 8px 20px -8px ${o.color}` : "none",
                transform: on ? "translateY(-1px)" : "none",
                transition: "all .18s ease",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              <span style={{ display: "flex", color: on ? "#fff" : o.color }}>
                {icons[o.key]}
              </span>
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckIcon() {
  return <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17.5 19 7"/></svg>;
}
function MaybeIcon() {
  return <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.3 9.4a2.8 2.8 0 0 1 5.4.9c0 1.9-2.7 2.4-2.7 3.9M12 17.4h.01"/></svg>;
}
function XIcon() {
  return <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6 6 18"/></svg>;
}
