import { TopNav } from "@/components/TopNav";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (err: any) {
    if (err?.digest === "DYNAMIC_SERVER_USAGE" || err?.message?.includes("Dynamic server usage")) {
      throw err;
    }
    console.error("[MainLayout] Failed to load user:", err);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav user={user} />
      <main>{children}</main>
    </div>
  );
}

