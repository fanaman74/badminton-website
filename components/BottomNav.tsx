"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Wallet, Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/sessions", label: "Sessions", icon: CalendarDays, enabled: true },
  { href: "/finances", label: "Finances", icon: Wallet, enabled: false },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy, enabled: false },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon, enabled }) => {
          const isActive = pathname.startsWith(href);

          if (!enabled) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <button
                    className="flex-1 flex flex-col items-center gap-1 py-3 text-slate-300 cursor-not-allowed"
                    aria-disabled="true"
                  >
                    <Icon size={22} />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top">Coming soon</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-3 min-h-[60px] transition-colors",
                isActive ? "text-green-600" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
