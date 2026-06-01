import { BottomNav } from "@/components/BottomNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 65 }}>
      <main>{children}</main>
      <BottomNav />
    </div>
  );
}
