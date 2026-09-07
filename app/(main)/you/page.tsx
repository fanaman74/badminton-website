import { sql, type Profile, type Session, type RsvpStatus } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { ProfileEditForm } from "@/components/ProfileEditForm";
import { YouMultiDateSelector } from "@/components/YouMultiDateSelector";

export const dynamic = "force-dynamic";

export default async function YouPage() {
  const userId = await getCurrentUserId();

  const profileRows = userId
    ? ((await sql`
        SELECT name, email, role
        FROM profiles
        WHERE id = ${userId}
        LIMIT 1;
      `) as Pick<Profile, "name" | "email" | "role">[])
    : [];

  const profile = profileRows[0];

  const sessions = (await sql`
    SELECT *
    FROM sessions
    WHERE status = 'UPCOMING'
    ORDER BY date ASC;
  `) as Session[];

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

  const inCountBySession = inRsvps.reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.session_id]: (acc[r.session_id] ?? 0) + 1 }),
    {}
  );

  const myStatusBySession = myRsvps.reduce<Record<string, RsvpStatus>>(
    (acc, r) => ({ ...acc, [r.session_id]: r.status }),
    {}
  );

  return (
    <div style={{ minHeight: "100%", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 14px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 5 }}>
          VUB Smashers
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
          lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>You</div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 20, paddingBottom: 140 }}>
        {/* Multi-Date Selector for quick joining & managing playing dates */}
        <YouMultiDateSelector
          sessions={sessions}
          inCountBySession={inCountBySession}
          myStatusBySession={myStatusBySession}
        />

        {/* Profile Settings */}
        <ProfileEditForm
          name={profile?.name || ""}
          email={profile?.email || ""}
          userId={userId!}
          isAdmin={profile?.role === "ADMIN"}
        />

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
