import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";

export default async function TeamPage() {
  const userId = await getCurrentUserId();
  const supabase = await createClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .order("name", { ascending: true });

  const list = profiles ?? [];

  function initials(name: string) {
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  }

  function avatarColor(id: string) {
    const colors = ["#FF5A1F","#1FA463","#2D7FF9","#9B5DE5","#F15BB5","#E0A500","#00B5C9","#E5484D","#14B8A6","#F97316","#8B5CF6","#EC4899"];
    let hash = 0;
    for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
    return colors[Math.abs(hash) % colors.length];
  }

  return (
    <div style={{ minHeight: "100%", background: "var(--bg)" }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 12px" }}>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 5 }}>
          Eastside Smashers
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32,
            lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>The Team</div>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--muted)" }}>
            {list.length} players
          </span>
        </div>
      </div>

      {/* Player cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, padding: "8px 20px 20px" }}>
        {list.map((p, i) => {
          const isYou = p.id === userId;
          const color = avatarColor(p.id);
          return (
            <div key={p.id} style={{
              background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 12,
              border: "1px solid var(--line)",
              boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.30)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 18, textAlign: "center", flexShrink: 0,
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14,
                  color: i < 3 ? "var(--brand)" : "var(--faint)" }}>{i + 1}</span>
                <div style={{
                  width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
                  background: color, color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14,
                  boxShadow: isYou ? `0 0 0 2.5px var(--surface), 0 0 0 4.5px var(--brand)` : "none",
                }}>
                  {initials(p.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
                      color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {isYou ? "You" : p.name}
                    </span>
                    {p.role === "ADMIN" && (
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 9.5,
                        letterSpacing: "0.05em", color: "var(--accent-ink)", background: "var(--accent)",
                        padding: "2px 6px", borderRadius: 5, whiteSpace: "nowrap" }}>ADMIN</span>
                    )}
                  </div>
                  {p.email && (
                    <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12,
                      color: "var(--muted)", marginTop: 3,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
