import { sql, type Profile } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { TeamMemberCard } from "@/components/TeamMemberCard";

export default async function TeamPage() {
  const userId = await getCurrentUserId();

  const profiles = (await sql`
    SELECT id, name, email, role
    FROM profiles
    ORDER BY name ASC;
  `) as Pick<Profile, "id" | "name" | "email" | "role">[];

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
            isCurrentUser={p.id === userId}
            currentUserIsAdmin={currentUserIsAdmin}
          />
        ))}
      </div>
    </div>
  );
}
