"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { Session, RsvpStatus } from "@/types/database";
import { CourtMeter } from "@/components/ui/CourtMeter";
import { DeleteSessionButton } from "@/components/DeleteSessionButton";
import { updateRsvp } from "@/lib/actions/rsvp";
import { AuthModal } from "@/components/AuthModal";

export interface SessionPerson {
  id: string;
  name: string;
}

interface Props {
  session: Session;
  inCount: number;
  userStatus: RsvpStatus | null;
  isHero?: boolean;
  isAdmin?: boolean;
  isAuthenticated?: boolean;
  /** Members confirmed for this session (IN), in join order. */
  people?: SessionPerson[];
  /** The signed-in member, so they show up as "You" and appear as soon as they join. */
  viewer?: SessionPerson | null;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  IN:       { label: "You’re going ✓",    color: "var(--in)" },
  WAITLIST: { label: "You’re on the waitlist", color: "var(--maybe)" },
  MAYBE:    { label: "Maybe",      color: "var(--maybe)" },
  OUT:      { label: "Not going",  color: "var(--out)" },
};

function DateBlock({ date, big }: { date: Date; big?: boolean }) {
  const dow = date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }).toUpperCase();
  const day = date.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" });
  const mon = date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }).toUpperCase();
  return (
    <div style={{
      width: big ? 64 : 54, flexShrink: 0, textAlign: "center",
      background: "var(--accent)", color: "var(--accent-ink)",
      borderRadius: "var(--r-md)", padding: big ? "9px 0 7px" : "7px 0 6px",
    }}>
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 10.5, letterSpacing: "0.1em" }}>{dow}</div>
      <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: big ? 30 : 25, lineHeight: 1, margin: "1px 0" }}>{day}</div>
      <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", opacity: 0.8 }}>{mon}</div>
    </div>
  );
}

function FillBar({ value, max }: { value: number; max: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const full = value >= max;
  return (
    <div style={{ height: 6, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden", border: "1px solid var(--line)" }}>
      <div style={{ width: pct + "%", height: "100%", borderRadius: 99,
        background: full ? "var(--maybe)" : "var(--brand)", transition: "width .4s cubic-bezier(.3,1,.4,1)" }} />
    </div>
  );
}

function ClockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>
    </svg>
  );
}

const MAX_NAMES_SHOWN = 8;

function initialsOf(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(id: string) {
  return `hsl(${(id.charCodeAt(0) * 47) % 360}, 60%, 55%)`;
}

/** Names of the members who are going, under the session details. */
function GoingNames({ people, viewerId }: { people: SessionPerson[]; viewerId?: string | null }) {
  if (people.length === 0) return null;

  const label = (p: SessionPerson) => (viewerId && p.id === viewerId ? "You" : p.name);
  const shown = people.slice(0, MAX_NAMES_SHOWN);
  const hiddenCount = people.length - shown.length;

  return (
    <div
      role="list"
      aria-label={`Going: ${people.map(label).join(", ")}`}
      style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 9 }}
    >
      {shown.map((p) => {
        const isYou = Boolean(viewerId) && p.id === viewerId;
        return (
          <span
            key={p.id}
            role="listitem"
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "2px 9px 2px 2px", borderRadius: 999,
              background: "var(--surface-2)", border: "1px solid var(--line)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                background: avatarColor(p.id), color: "#fff",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 9.5,
              }}
            >
              {initialsOf(p.name)}
            </span>
            <span style={{
              fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
              color: isYou ? "var(--brand)" : "var(--ink)",
            }}>
              {isYou ? "You" : p.name.split(" ")[0]}
            </span>
          </span>
        );
      })}
      {hiddenCount > 0 && (
        <span
          role="listitem"
          style={{
            display: "inline-flex", alignItems: "center", padding: "4px 9px",
            borderRadius: 999, background: "var(--surface-2)", border: "1px solid var(--line)",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5, color: "var(--muted)",
          }}
        >
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}

export function SessionCard({
  session,
  inCount: initialInCount,
  userStatus,
  isHero,
  isAdmin,
  isAuthenticated = false,
  people: initialPeople = [],
  viewer,
}: Props) {
  const [status, setStatus] = useState<RsvpStatus | null>(userStatus);
  const [inCount, setInCount] = useState<number>(initialInCount);
  const [people, setPeople] = useState<SessionPerson[]>(initialPeople);
  const [isPending, startTransition] = useTransition();
  const [authOpen, setAuthOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const date = new Date(session.date);
  const cap = session.max_capacity;
  const full = inCount >= cap;
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" });
  const statusMeta = status ? STATUS_META[status] : null;

  function handleQuickAccept(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    setFeedback(null);
    startTransition(async () => {
      try {
        const prev = status;
        const res = await updateRsvp(session.id, "IN");
        if (res.error) { setFeedback(res.error); return; }
        if (!res.status) return;

        setStatus(res.status);
        if (prev !== "IN" && res.status === "IN") {
          setInCount((c) => c + 1);
          // List the member's own name straight away, without a page refresh
          if (viewer) {
            setPeople((list) => (list.some((p) => p.id === viewer.id) ? list : [...list, viewer]));
          }
        }
      } catch { setFeedback("We couldn’t save your response. Please try again."); }
    });
  }

  if (isHero) {
    // Always surface the concrete date of the next session so it is never
    // identified by its weekday alone. "Today"/"Tomorrow" are only hints
    // prefixed to the full date.
    const playDate = date.toLocaleDateString("en-GB", {
      weekday: "long", day: "numeric", month: "long", timeZone: "UTC",
    });
    const when = (() => {
      const todayUTC = new Date(); todayUTC.setUTCHours(0,0,0,0);
      const dUTC = new Date(date); dUTC.setUTCHours(0,0,0,0);
      const diff = Math.round((dUTC.getTime() - todayUTC.getTime()) / 86400000);
      if (diff === 0) return `Today · ${playDate}`;
      if (diff === 1) return `Tomorrow · ${playDate}`;
      return playDate;
    })();

    return (
      <>
        <div style={{
          position: "relative",
          background: "var(--surface)",
          borderRadius: "var(--r-lg)",
          border: "1px solid var(--line)",
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.30)",
          cursor: "pointer",
        }}>
          <Link
            href={`/sessions/${session.id}`}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
            }}
            aria-label={`View session at ${session.location_name}`}
          />
          <div style={{ background: "var(--ink)", padding: "16px 18px 15px", position: "relative", zIndex: 2, pointerEvents: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
                  letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 7 }}>
                  Next up · {when}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 23,
                  color: "var(--bg)", letterSpacing: "-0.01em" }}>{session.location_name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5,
                  color: "rgba(241,239,230,0.65)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13 }}>
                  <ClockIcon size={14} />{time}
                </div>
              </div>
              <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                {isAdmin && (
                  <div style={{ marginBottom: 8, pointerEvents: "auto" }}>
                    <DeleteSessionButton sessionId={session.id} compact />
                  </div>
                )}
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "var(--accent)", lineHeight: 1 }}>{inCount}</div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10.5,
                  letterSpacing: "0.08em", color: "rgba(241,239,230,0.55)", textTransform: "uppercase" }}>of {cap} in</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "13px 18px 15px", position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, position: "relative" }}>
              <div style={{ pointerEvents: "none" }}>
                <CourtMeter session={session} confirmedCount={inCount} compact />
              </div>
              {feedback && <div role="alert" style={{ position: "absolute", bottom: 52, left: 18, right: 18, color: "var(--out)", background: "var(--surface)", padding: "6px 8px", borderRadius: 6, fontSize: 12, pointerEvents: "auto" }}>{feedback}</div>}
              {status === "IN" || status === "WAITLIST" ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px",
                  borderRadius: 999, background: `color-mix(in srgb, ${status === "WAITLIST" ? "var(--maybe)" : "var(--in)"} 16%, transparent)`,
                  color: status === "WAITLIST" ? "var(--maybe)" : "var(--in)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 13 }}>
                  {status === "WAITLIST" ? "You’re on the waitlist" : "You’re going ✓"}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleQuickAccept}
                  disabled={isPending}
                  style={{
                    pointerEvents: "auto",
                    border: "none",
                    cursor: "pointer",
                    background: full ? "var(--maybe)" : "var(--in)",
                    color: "#fff",
                    borderRadius: "var(--r-md)",
                    padding: "8px 18px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 14,
                    boxShadow: full ? "0 4px 14px -4px var(--maybe)" : "0 4px 14px -4px var(--in)",
                    transition: "all .18s ease",
                    opacity: isPending ? 0.7 : 1,
                  }}
                >
                  <span>{isPending ? "Saving…" : (full ? "Join waitlist" : "Join session")}</span>
                </button>
              )}
            </div>
            <div style={{ pointerEvents: "none" }}>
              <GoingNames people={people} viewerId={viewer?.id} />
            </div>
          </div>
        </div>
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          initialMode="signup"
          returnTo={`/sessions/${session.id}`}
        />
      </>
    );
  }

  return (
    <>
      <div style={{
        position: "relative",
        background: "var(--surface)",
        borderRadius: "var(--r-lg)",
        padding: 13,
        border: "1px solid var(--line)",
        boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.30)",
        cursor: "pointer",
      }}>
        <Link
          href={`/sessions/${session.id}`}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
          }}
          aria-label={`View session at ${session.location_name}`}
        />
        <div style={{ display: "flex", gap: 13, alignItems: "center", position: "relative", zIndex: 2, pointerEvents: "none" }}>
          <DateBlock date={date} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16.5,
                  color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {session.location_name}
                </div>
                {full && (
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 9.5,
                    letterSpacing: "0.08em", color: "var(--maybe)",
                    background: "color-mix(in srgb,var(--maybe) 15%,transparent)",
                    padding: "2px 6px", borderRadius: 5, flexShrink: 0 }}>FULL</span>
                )}
              </div>
              {isAdmin && (
                <div style={{ flexShrink: 0, pointerEvents: "auto" }}>
                  <DeleteSessionButton sessionId={session.id} compact />
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3,
              color: "var(--muted)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5 }}>
              <ClockIcon size={13} />{time}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9, gap: 10 }}>
              <div style={{ flex: 1 }}><FillBar value={inCount} max={cap} /></div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12,
                color: full ? "var(--maybe)" : "var(--muted)", flexShrink: 0 }}>
                {inCount}/{cap}
              </span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 11, paddingTop: 10, borderTop: "1px solid var(--line)", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
          {feedback && <div role="alert" style={{ color: "var(--out)", fontSize: 12, fontWeight: 700 }}>{feedback}</div>}
          {statusMeta ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
              borderRadius: 999, background: `color-mix(in srgb, ${statusMeta.color} 14%, transparent)`,
              color: statusMeta.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5 }}>
              {statusMeta.label}
            </span>
          ) : (
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: "var(--muted)" }}>
              {full ? "Session full" : `${cap - inCount} spots left`}
            </span>
          )}

          {status !== "IN" && status !== "WAITLIST" ? (
            <button
              type="button"
              onClick={handleQuickAccept}
              disabled={isPending}
              style={{
                pointerEvents: "auto",
                border: "none",
                cursor: "pointer",
                background: full ? "var(--maybe)" : "var(--in)",
                color: "#fff",
                borderRadius: "var(--r-md)",
                padding: "6px 14px",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 12.5,
                boxShadow: full ? "0 4px 12px -4px var(--maybe)" : "0 4px 12px -4px var(--in)",
                transition: "all .18s ease",
                opacity: isPending ? 0.7 : 1,
              }}
            >
              <span>{isPending ? "Saving…" : (full ? "Join waitlist" : "Join session")}</span>
            </button>
          ) : (
            <span style={{ fontSize: 12, fontFamily: "var(--font-body)", fontWeight: 700, color: "var(--faint)" }}>
              {status === "WAITLIST" ? "View position →" : "View details →"}
            </span>
          )}
        </div>
        <div style={{ pointerEvents: "none", position: "relative", zIndex: 2 }}>
          <GoingNames people={people} viewerId={viewer?.id} />
        </div>
      </div>
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode="signup"
        returnTo={`/sessions/${session.id}`}
      />
    </>
  );
}
