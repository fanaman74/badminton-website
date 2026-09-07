import Link from "next/link";
import { sql, type Session, type RsvpStatus, type Profile } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { SessionCard } from "@/components/SessionCard";
import { HeroBanner } from "@/components/HeroBanner";

export default async function SessionsPage() {
  const userId = await getCurrentUserId();

  const sessions = (await sql`
    SELECT *
    FROM sessions
    WHERE status = 'UPCOMING'
    ORDER BY date ASC;
  `) as Session[];

  const profileRows = userId
    ? ((await sql`
        SELECT name, role
        FROM profiles
        WHERE id = ${userId}
        LIMIT 1;
      `) as Pick<Profile, "name" | "role">[])
    : [];
  const profile = profileRows[0];

  const inRsvps = (await sql`
    SELECT session_id
    FROM rsvps
    WHERE status = 'IN';
  `) as { session_id: string }[];

  const myRsvps = userId
    ? ((await sql`
        SELECT session_id, status
        FROM rsvps
        WHERE user_id = ${userId};
      `) as { session_id: string; status: RsvpStatus }[])
    : [];

  const countRows = (await sql`
    SELECT COUNT(*)::int AS count
    FROM profiles;
  `) as { count: number }[];
  const memberCount = countRows[0]?.count ?? 0;

  const inCountBySession = (inRsvps ?? []).reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.session_id]: (acc[r.session_id] ?? 0) + 1 }),
    {}
  );

  const myStatusBySession = (myRsvps ?? []).reduce<Record<string, RsvpStatus>>(
    (acc, r) => ({ ...acc, [r.session_id]: r.status }),
    {}
  );

  const isAdmin = profile?.role === "ADMIN";
  const list = sessions ?? [];

  return (
    <div style={{ minHeight: "100%", background: "var(--bg)" }}>
      {/* Hero banner */}
      <HeroBanner name={profile?.name ?? "Player"} memberCount={memberCount} isGuest={!userId} />

      {/* Sessions header row */}
      <div style={{ padding: "16px 20px 10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22,
          letterSpacing: "-0.02em", color: "var(--ink)" }}>Sessions</div>
        {isAdmin && (
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/config" style={{
              width: 38, height: 38, borderRadius: 999, border: "1px solid var(--line)",
              background: "var(--surface)", color: "var(--ink)", display: "flex",
              alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0,
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
              </svg>
            </Link>
            <Link href="/admin/sessions/new" style={{
              width: 38, height: 38, borderRadius: 999, border: "1px solid var(--line)",
              background: "var(--surface)", color: "var(--ink)", display: "flex",
              alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0,
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
