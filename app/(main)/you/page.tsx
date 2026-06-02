import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { ProfileEditForm } from "@/components/ProfileEditForm";

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

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16, paddingBottom: 140 }}>
        <ProfileEditForm
          name={profile?.name || ""}
          email={profile?.email || ""}
          userId={userId!}
          isAdmin={profile?.role === "ADMIN"}
        />

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
