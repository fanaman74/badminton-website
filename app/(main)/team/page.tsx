import { sql, type Profile } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import { accountLimitKeys, fetchRecentAccountAttempts } from "@/lib/rateLimit";
import { AUTH_LIMITS } from "@/lib/authLimits";

export default async function TeamPage() {
  const userId = await getCurrentUserId();

  const profiles = (await sql`
    SELECT p.id, p.name, p.email, p.role, p.auth_provider,
           (SELECT COUNT(*)::int
              FROM user_sessions s
             WHERE s.user_id = p.id
               AND s.expires_at >= NOW()) AS active_sessions
    FROM profiles p
    ORDER BY p.name ASC;
  `) as (Pick<Profile, "id" | "name" | "email" | "role" | "auth_provider"> & { active_sessions: number })[];

  const currentUserRows = userId
    ? await sql`
        SELECT role
        FROM profiles
        WHERE id = ${userId}
        LIMIT 1;
      `
    : [];

  const currentUserIsAdmin = currentUserRows[0]?.role === "ADMIN";
  const list = profiles ?? [];

  // Recent failed sign-in attempts per member, so an admin can see who is throttled
  const attemptRows = await fetchRecentAccountAttempts(AUTH_LIMITS.windowSeconds);
  const lockoutAttemptsFor = (email: string | null): number => {
    if (!email) return 0;
    return Math.max(0, ...accountLimitKeys(email).map((key) => attemptRows.get(key) ?? 0));
  };

  return (
    <div style={{ minHeight: "100%", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 12px" }}>
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 11.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--brand)",
            marginBottom: 5,
          }}
        >
          VUB Smashers
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 32,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              color: "var(--ink)",
            }}
          >
            The Team
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: 15,
              color: "var(--muted)",
            }}
          >
            {list.length} players
          </span>
        </div>
      </div>

      {/* Player cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, padding: "8px 20px 140px" }}>
        {list.map((p) => (
          <TeamMemberCard
            key={p.id}
            id={p.id}
            name={p.name}
            email={p.email}
            role={p.role}
            activeSessions={p.active_sessions}
            authProvider={p.auth_provider}
            lockoutAttempts={lockoutAttemptsFor(p.email)}
            isCurrentUser={p.id === userId}
            currentUserIsAdmin={currentUserIsAdmin}
          />
        ))}
      </div>
    </div>
  );
}
