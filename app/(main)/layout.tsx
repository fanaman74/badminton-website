import { BottomNav } from "@/components/BottomNav";
import { Sidebar } from "@/components/Sidebar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
