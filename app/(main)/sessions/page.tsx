import Link from "next/link";
import { sql, type Session, type RsvpStatus, type Profile } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { HeroBanner } from "@/components/HeroBanner";
import { SessionsList } from "@/components/SessionsList";
import { RetryButton } from "@/components/RetryButton";

export const dynamic = "force-dynamic";

export default async function SessionsPage() {
  let userId: string | null = null;
  let sessions: Session[] = [];
  let profile: Pick<Profile, "name" | "role"> | undefined;
  let inRsvps: { session_id: string }[] = [];
  let myRsvps: { session_id: string; status: RsvpStatus }[] = [];
  let memberCount = 0;
  let dbError: string | null = null;

  try {
    userId = await getCurrentUserId();

    sessions = (await sql`
      SELECT *
      FROM sessions
      WHERE status = 'UPCOMING' AND date >= ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date AT TIME ZONE 'UTC')
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
    profile = profileRows[0];

    inRsvps = (await sql`
      SELECT session_id
      FROM rsvps
      WHERE status = 'IN';
    `) as { session_id: string }[];

    myRsvps = userId
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
    memberCount = countRows[0]?.count ?? 0;
  } catch (err: unknown) {
    const error = err as { digest?: string; message?: string };
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("Dynamic server usage")) {
      throw err;
    }
    console.error("[SessionsPage] Database error:", err);
    dbError = error?.message || "Failed to connect to database";
  }

  if (dbError) {
    return (
      <div style={{ minHeight: "100%", background: "var(--bg)", padding: "40px 20px" }}>
        <div
          style={{
            maxWidth: 540,
            margin: "0 auto",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: 32,
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 12, textAlign: "center" }}>⚠️</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              textAlign: "center",
              marginBottom: 8,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Sessions are temporarily unavailable
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--muted)",
              lineHeight: 1.6,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            We couldn’t load the latest sessions. Please try again in a moment.
          </p>

          <div style={{ textAlign: "center" }}>
            <RetryButton
              style={{
                display: "inline-block",
                padding: "10px 24px",
                background: "var(--accent)",
                color: "var(--accent-ink)",
                borderRadius: 10,
                textDecoration: "none",
                fontWeight: 600,
                fontSize: 14,
              }}
            >Try again</RetryButton>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="page-shell" style={{ paddingTop: 16, paddingBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
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

      <div className="page-shell content-grid">
        <div><SessionsList sessions={list} inCountBySession={inCountBySession} myStatusBySession={myStatusBySession} isAdmin={isAdmin} isAuthenticated={!!userId} /></div>
        <aside className="club-info-card" aria-labelledby="club-info-title">
          <p className="eyebrow" style={{ marginBottom: 6 }}>About the club</p>
          <h2 id="club-info-title" style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 22 }}>Play together</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.5, margin: "8px 0 14px" }}>All abilities are welcome for a bit of fitness and fun.</p>
          <div style={{ display: "grid", gap: 8, color: "var(--ink)", fontSize: 13, fontWeight: 700 }}><span>🏟️ Three courts at the VUB</span><span>⏰ Thursdays · 19:00–20:00</span><span>✉️ <a href="mailto:marika.vernon@yahoo.co.uk" style={{ color: "inherit" }}>Contact Marika</a></span></div>
        </aside>
      </div>
    </div>
  );
}
