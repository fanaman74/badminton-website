import { sql, type Profile, type Session, type RsvpStatus } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { YouMultiDateSelector } from "@/components/YouMultiDateSelector";
import type { SessionPerson } from "@/components/GoingNames";

export const dynamic = "force-dynamic";

export default async function YouPage() {
  const userId = await getCurrentUserId();

  const profileRows = userId
    ? ((await sql`
        SELECT name, email, role, email_notifications, password_hash
        FROM profiles
        WHERE id = ${userId}
        LIMIT 1;
      `) as Pick<Profile, "name" | "email" | "role" | "email_notifications" | "password_hash">[])
    : [];

  const profile = profileRows[0];

  const sessions = (await sql`
    SELECT *
    FROM sessions
    WHERE status = 'UPCOMING' AND date >= ((CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date AT TIME ZONE 'UTC')
    ORDER BY date ASC;
  `) as Session[];

  // Who is going, so each date can list the players by name
  const inRsvps = (await sql`
    SELECT r.session_id, r.user_id, p.name
    FROM rsvps r
    JOIN profiles p ON r.user_id = p.id
    WHERE r.status = 'IN'
    ORDER BY r.created_at ASC;
  `) as { session_id: string; user_id: string; name: string }[];

  const myRsvps = userId
    ? ((await sql`
        SELECT session_id, status
        FROM rsvps
        WHERE user_id = ${userId};
      `) as { session_id: string; status: RsvpStatus }[])
    : [];

  const inCountBySession = inRsvps.reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.session_id]: (acc[r.session_id] ?? 0) + 1 }),
    {}
  );

  const peopleBySession = inRsvps.reduce<Record<string, SessionPerson[]>>(
    (acc, r) => ({
      ...acc,
      [r.session_id]: [...(acc[r.session_id] ?? []), { id: r.user_id, name: r.name }],
    }),
    {}
  );

  const myStatusBySession = myRsvps.reduce<Record<string, RsvpStatus>>(
    (acc, r) => ({ ...acc, [r.session_id]: r.status }),
    {}
  );

  return (
    <div style={{ minHeight: "100%", background: "var(--bg)" }}>
      {/* Header */}
      <div className="page-shell" style={{ paddingTop: 28, paddingBottom: 14 }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 5 }}>
          VUB Smashers
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
          lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>You</div>
      </div>

      <div className="page-shell" style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 140 }}>
        {/* Multi-Date Selector for quick joining & managing playing dates */}
        <section id="my-games" aria-labelledby="my-games-title">
          <h2 id="my-games-title" style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 8px" }}>My upcoming games</h2>
          <YouMultiDateSelector key={JSON.stringify(myStatusBySession)} sessions={sessions} inCountBySession={inCountBySession} myStatusBySession={myStatusBySession} peopleBySession={peopleBySession} viewerId={userId} />
        </section>

        {/* Profile Settings */}
        <section id="profile" aria-labelledby="profile-title">
          <h2 id="profile-title" style={{ fontFamily: "var(--font-display)", fontSize: 20, margin: "0 0 8px" }}>Profile</h2>
          <ProfileEditForm
            name={profile?.name || ""}
            email={profile?.email || ""}
            userId={userId!}
            isAdmin={profile?.role === "ADMIN"}
            emailNotifications={profile?.email_notifications ?? true}
            hasPassword={Boolean(profile?.password_hash)}
          />
        </section>

        {/* Sign out */}
        <form action={signOutAction}>
          <button type="submit" style={{
            width: "100%", height: 48, borderRadius: "var(--r-md)", border: "none",
            background: "var(--out)", color: "#fff",
            fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
            cursor: "pointer", boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--out) 60%, transparent)",
          }}>
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
