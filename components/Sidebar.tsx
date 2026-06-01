"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Wallet, Trophy, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth";

const navItems = [
  { href: "/sessions", label: "Sessions", icon: CalendarDays, enabled: true },
  { href: "/finances", label: "Finances", icon: Wallet, enabled: false },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, enabled: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-white border-r border-slate-200 fixed top-0 left-0 z-50">
      <div className="px-6 py-5 border-b border-slate-200">
        <span className="text-xl font-bold text-slate-900">🏸 Badminton</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon, enabled }) => {
          const isActive = pathname.startsWith(href);

          if (!enabled) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 cursor-not-allowed">
                    <Icon size={20} />
                    <span className="text-sm font-medium">{label}</span>
                    <span className="ml-auto text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">
                      Soon
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Coming soon</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-50 text-green-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 py-4 border-t border-slate-200">
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 w-full transition-colors"
          >
            <LogOut size={20} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
