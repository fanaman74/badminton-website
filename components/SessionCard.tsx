"use client";

import Link from "next/link";
import type { Session, RsvpStatus } from "@/types/database";
import { CourtMeter } from "@/components/ui/CourtMeter";

interface Props {
  session: Session;
  inCount: number;
  userStatus: RsvpStatus | null;
  isHero?: boolean;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  IN:       { label: "You're in",  color: "var(--in)" },
  WAITLIST: { label: "Waitlisted", color: "var(--maybe)" },
  MAYBE:    { label: "Maybe",      color: "var(--maybe)" },
  OUT:      { label: "Not going",  color: "var(--out)" },
};

function DateBlock({ date, big }: { date: Date; big?: boolean }) {
  const dow = date.toLocaleDateString("en-GB", { weekday: "short" }).toUpperCase();
  const day = date.getDate().toString().padStart(2, "0");
  const mon = date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
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

export function SessionCard({ session, inCount, userStatus, isHero }: Props) {
  const date = new Date(session.date);
  const cap = session.max_capacity;
  const full = inCount >= cap;
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  const statusMeta = userStatus ? STATUS_META[userStatus] : null;

  if (isHero) {
    const when = (() => {
      const today = new Date(); today.setHours(0,0,0,0);
      const d = new Date(date); d.setHours(0,0,0,0);
      const diff = (d.getTime() - today.getTime()) / 86400000;
      if (diff === 0) return "Today";
      if (diff === 1) return "Tomorrow";
      return date.toLocaleDateString("en-GB", { weekday: "long" });
    })();

    return (
      <Link href={`/sessions/${session.id}`} style={{ textDecoration: "none", display: "block" }}>
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)",
          border: "1px solid var(--line)", overflow: "hidden",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.30)",
        }}>
          <div style={{ background: "var(--ink)", padding: "16px 18px 15px" }}>
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
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "var(--accent)", lineHeight: 1 }}>{inCount}</div>
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10.5,
                  letterSpacing: "0.08em", color: "rgba(241,239,230,0.55)", textTransform: "uppercase" }}>of {cap} in</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "13px 18px 15px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <CourtMeter session={session} confirmedCount={inCount} compact />
            {statusMeta ? (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px",
                borderRadius: 999, background: `color-mix(in srgb, ${statusMeta.color} 14%, transparent)`,
                color: statusMeta.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5 }}>
                {statusMeta.label}
              </span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
                color: "var(--brand)", fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 13.5 }}>
                {full ? "Join waitlist" : "Tap to RSVP"} →
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/sessions/${session.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{
        background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 13,
        border: "1px solid var(--line)",
        boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.30)",
      }}>
        <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
          <DateBlock date={date} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
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
        {statusMeta && (
          <div style={{ marginTop: 11, paddingTop: 11, borderTop: "1px solid var(--line)" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px",
              borderRadius: 999, background: `color-mix(in srgb, ${statusMeta.color} 14%, transparent)`,
              color: statusMeta.color, fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11 }}>
              {statusMeta.label}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
