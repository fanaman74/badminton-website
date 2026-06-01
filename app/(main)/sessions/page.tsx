import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { SessionCard } from "@/components/SessionCard";
import type { RsvpStatus } from "@/types/database";

export default async function SessionsPage() {
  const userId = await getCurrentUserId();
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("status", "UPCOMING")
    .order("date", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId!)
    .single();

  const { data: inRsvps } = await supabase
    .from("rsvps")
    .select("session_id")
    .eq("status", "IN");

  const { data: myRsvps } = await supabase
    .from("rsvps")
    .select("session_id, status")
    .eq("user_id", userId!);

  const inCountBySession = (inRsvps ?? []).reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.session_id]: (acc[r.session_id] ?? 0) + 1 }),
    {}
  );

  const myStatusBySession = (myRsvps ?? []).reduce<Record<string, RsvpStatus>>(
    (acc, r) => ({ ...acc, [r.session_id]: r.status as RsvpStatus }),
    {}
  );

  const isAdmin = profile?.role === "ADMIN";
  const list = sessions ?? [];

  return (
    <div style={{ minHeight: "100%", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 14px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
            letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 5 }}>
            VUB Smashers
          </div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
            lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>Sessions</div>
        </div>
        {isAdmin && (
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/config" style={{
              width: 42, height: 42, borderRadius: 999, border: "1px solid var(--line)",
              background: "var(--surface)", color: "var(--ink)", display: "flex",
              alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0,
            }}>
              {/* gear icon */}
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
            </Link>
            <Link href="/admin/sessions/new" style={{
              width: 42, height: 42, borderRadius: 999, border: "1px solid var(--line)",
              background: "var(--surface)", color: "var(--ink)", display: "flex",
              alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0,
            }}>
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </Link>
          </div>
        )}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 20px", color: "var(--muted)",
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 15 }}>
          No upcoming sessions
          {isAdmin && <p style={{ marginTop: 8, fontSize: 13, color: "var(--faint)" }}>Create the first one using the + button above.</p>}
        </div>
      ) : (
        <>
          {/* Hero card */}
          <div style={{ padding: "0 20px 8px" }}>
            <SessionCard
              session={list[0]}
              inCount={inCountBySession[list[0].id] ?? 0}
              userStatus={myStatusBySession[list[0].id] ?? null}
              isHero
            />
          </div>

          {/* Upcoming label */}
          {list.length > 1 && (
            <div style={{ padding: "12px 20px 6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
                letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--faint)" }}>Upcoming</div>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--muted)", whiteSpace: "nowrap" }}>
                {list.length} sessions
              </span>
            </div>
          )}

          {/* Rest of sessions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 11, padding: "0 20px 20px" }}>
            {list.slice(1).map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                inCount={inCountBySession[session.id] ?? 0}
                userStatus={myStatusBySession[session.id] ?? null}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
