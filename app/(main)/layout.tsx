import { TopNav } from "@/components/TopNav";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (err: unknown) {
    const error = err as { digest?: string; message?: string };
    if (error?.digest === "DYNAMIC_SERVER_USAGE" || error?.message?.includes("Dynamic server usage")) {
      throw err;
    }
    console.error("[MainLayout] Failed to load user:", err);
  }

  return (
    <div className="app-shell" style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav user={user} />
      <main>{children}</main>
    </div>
  );
}
