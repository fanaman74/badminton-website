"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/sessions", label: "Sessions", icon: CalendarIcon },
  { href: "/history",  label: "History",  icon: HistoryIcon },
  { href: "/team",     label: "Team",     icon: UsersIcon },
  { href: "/you",      label: "You",      icon: UserIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
      display: "grid", gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
      paddingBottom: 20, paddingTop: 8,
      background: "var(--surface)", borderTop: "1px solid var(--line)",
    }}>
      {tabs.map((t) => {
        const on = pathname.startsWith(t.href);
        const Ic = t.icon;
        return (
          <Link key={t.href} href={t.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            color: on ? "var(--brand)" : "var(--faint)",
            padding: "4px 0", textDecoration: "none",
            fontFamily: "var(--font-body)", fontWeight: 700,
            fontSize: 10.5, letterSpacing: "0.02em",
          }}>
            <Ic size={23} active={on} />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

function CalendarIcon({ size = 24, active }: { size?: number; active?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M3.5 9h17M8 2.5v4M16 2.5v4"/></svg>;
}
function UsersIcon({ size = 24, active }: { size?: number; active?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.4"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.4 3.4 0 0 1 0 6.4M17 14.4a5.5 5.5 0 0 1 3.5 5.1"/></svg>;
}
function UserIcon({ size = 24, active }: { size?: number; active?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20a6 6 0 0 1 12 0"/></svg>;
}
function HistoryIcon({ size = 24, active }: { size?: number; active?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/></svg>;
}
