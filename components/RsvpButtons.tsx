"use client";

import { useState, useTransition } from "react";
import { updateRsvp, removeMyRsvpAction } from "@/lib/actions/rsvp";
import type { RsvpStatus } from "@/types/database";
import { AuthModal } from "@/components/AuthModal";

interface Props {
  sessionId: string;
  currentStatus: RsvpStatus | null;
  isFull: boolean;
  isAuthenticated?: boolean;
}

export function RsvpButtons({ sessionId, currentStatus, isFull, isAuthenticated = true }: Props) {
  const [status, setStatus] = useState<RsvpStatus | null>(currentStatus);
  const [isPending, startTransition] = useTransition();
  const [authOpen, setAuthOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);


  const activeKey = status === "WAITLIST" ? "IN" : status;

  const inLabel = status === "IN" ? "You’re going ✓" : status === "WAITLIST" ? "You’re on the waitlist" : isFull ? "Join waitlist" : "Join session";

  const opts = [
    { key: "IN" as const,    label: inLabel, color: status === "WAITLIST" ? "var(--maybe)" : "var(--in)" },
    { key: "MAYBE" as const, label: "Maybe", color: "var(--maybe)" },
    { key: "OUT" as const,   label: "Can't make it",   color: "var(--out)" },
  ];

  function handleRsvp(key: "IN" | "MAYBE" | "OUT") {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await updateRsvp(sessionId, key);
        if (result.error) setFeedback(result.error);
        else if (result.status) setStatus(result.status);
      } catch { setFeedback("We couldn’t save your response. Please try again."); }
    });
  }

  function handleRemoveEntry() {
    if (!confirm("Are you sure you want to remove your entry for this session?")) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await removeMyRsvpAction(sessionId);
        if (result.error) setFeedback(result.error);
        else if (result.success) setStatus(null);
      } catch { setFeedback("We couldn’t remove your response. Please try again."); }
    });
  }

  const icons = {
    IN:    <CheckIcon />,
    MAYBE: <MaybeIcon />,
    OUT:   <XIcon />,
  };

  return (
    <>
      <div style={{
        position: "fixed", bottom: "var(--mobile-nav-offset)", left: 0, right: 0, zIndex: 40,
        padding: "10px max(16px, calc((100vw - 760px) / 2)) calc(12px + env(safe-area-inset-bottom))", background: "var(--surface)",
        borderTop: "1px solid var(--line)",
        boxShadow: "0 -8px 24px -18px rgba(20,18,12,.5)",
      }}>
        {isPending && <div role="status" aria-live="polite" style={{ maxWidth: 760, margin: "0 auto 6px", color: "var(--muted)", fontSize: 12.5, fontWeight: 700, textAlign: "center" }}>Saving…</div>}
        {feedback && <div role="alert" style={{ maxWidth: 760, margin: "0 auto 8px", color: "var(--out)", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{feedback}</div>}
        {!isAuthenticated ? (
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            style={{
              width: "100%",
              border: "none",
              cursor: "pointer",
              background: "var(--brand)",
              color: "#fff",
              borderRadius: "var(--r-md)",
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 16,
              boxShadow: "0 8px 20px -8px var(--brand)",
              transition: "all .18s ease",
            }}
          >
            <span>🏸 Sign in to join</span>
            <span>→</span>
          </button>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr 1fr", gap: 9, maxWidth: 760, margin: "0 auto" }}>
            {opts.map((o) => {
              const on = activeKey === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => handleRsvp(o.key)}
                  aria-pressed={on}
                  title={o.key === "IN" && isFull && status !== "WAITLIST" ? "This session is full; you will join the waitlist." : undefined}
                  disabled={isPending || (o.key === "IN" && (status === "IN" || status === "WAITLIST"))}
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
        )}

        {status && isAuthenticated && (
          <div style={{ textAlign: "center", marginTop: 9 }}>
            <button
              type="button"
              onClick={handleRemoveEntry}
              disabled={isPending}
              style={{
                background: "none",
                border: "none",
                color: "var(--out)",
                fontSize: 12,
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                cursor: isPending ? "not-allowed" : "pointer",
                padding: "2px 8px",
                opacity: isPending ? 0.6 : 0.85,
                transition: "opacity .15s ease",
              }}
            >
              ✕ Remove my entry from this session
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode="signup"
        returnTo={`/sessions/${sessionId}`}
      />
    </>
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
