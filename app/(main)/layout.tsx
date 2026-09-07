import { TopNav } from "@/components/TopNav";
import { getCurrentUser } from "@/lib/auth";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav user={user} />
      <main>{children}</main>
    </div>
  );
}

