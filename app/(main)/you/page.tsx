import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";

export default async function YouPage() {
  const userId = await getCurrentUserId();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, role")
    .eq("id", userId!)
    .single();

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

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Profile card */}
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 20,
          border: "1px solid var(--line)",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.20)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{
              width: 54, height: 54, borderRadius: "50%", flexShrink: 0,
              background: `hsl(${(userId!.charCodeAt(0) * 47) % 360}, 60%, 55%)`,
              color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
            }}>
              {profile?.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18,
                color: "var(--ink)", lineHeight: 1.1 }}>{profile?.name}</div>
              {profile?.email && (
                <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5,
                  color: "var(--muted)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {profile.email}
                </div>
              )}
            </div>
          </div>

          {profile?.role === "ADMIN" && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: "var(--r-sm)", background: "var(--accent)",
              color: "var(--accent-ink)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 12.5,
              marginBottom: 16, width: "fit-content",
            }}>
              ⚙️ Admin
            </div>
          )}

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
    </div>
  );
}
