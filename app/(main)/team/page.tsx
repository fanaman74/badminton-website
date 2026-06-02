import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { TeamMemberCard } from "@/components/TeamMemberCard";
import Link from "next/link";

export default async function TeamPage() {
  const userId = await getCurrentUserId();
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .order("name", { ascending: true });

  const { data: currentUserProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId!)
    .single();

  const list = profiles ?? [];
  const currentUserIsAdmin = currentUserProfile?.role === "ADMIN";

  return (
    <div style={{ minHeight: "100%", background: "var(--bg)" }}>
      {/* Back to home */}
      <div style={{ padding: "14px 16px 0" }}>
        <Link href="/sessions" style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 13,
          color: "var(--faint)",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}>
          ← Home
        </Link>
      </div>
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
