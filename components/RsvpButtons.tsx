"use client";

import { useState, useTransition } from "react";
import { CheckCircle, XCircle, HelpCircle, Clock } from "lucide-react";
import { updateRsvp } from "@/lib/actions/rsvp";
import { cn } from "@/lib/utils";
import type { RsvpStatus } from "@/types/database";

interface RsvpButtonsProps {
  sessionId: string;
  currentStatus: RsvpStatus | null;
  isFull: boolean;
}

export function RsvpButtons({ sessionId, currentStatus, isFull }: RsvpButtonsProps) {
  const [optimisticStatus, setOptimisticStatus] = useState<RsvpStatus | null>(currentStatus);
  const [isPending, startTransition] = useTransition();

  async function handleRsvp(newStatus: "IN" | "OUT" | "MAYBE") {
    const prevStatus = optimisticStatus;

    // Optimistic: if clicking IN on a full session, show WAITLIST immediately
    const expectedStatus: RsvpStatus =
      newStatus === "IN" && isFull && optimisticStatus !== "IN" ? "WAITLIST" : newStatus;
    setOptimisticStatus(expectedStatus);

    startTransition(async () => {
      const result = await updateRsvp(sessionId, newStatus);
      if (result.error) {
        setOptimisticStatus(prevStatus);
      } else if (result.status) {
        setOptimisticStatus(result.status as RsvpStatus);
      }
    });
  }

  const buttons: { value: "IN" | "OUT" | "MAYBE"; label: string; icon: React.ReactNode; active: string; inactive: string }[] = [
    {
      value: "IN",
      label: "Going",
      icon: <CheckCircle size={20} />,
      active: "bg-green-600 text-white border-green-600",
      inactive: "bg-white text-slate-600 border-slate-200 hover:border-green-400 hover:text-green-600",
    },
    {
      value: "MAYBE",
      label: "Maybe",
      icon: <HelpCircle size={20} />,
      active: "bg-yellow-500 text-white border-yellow-500",
      inactive: "bg-white text-slate-600 border-slate-200 hover:border-yellow-400 hover:text-yellow-600",
    },
    {
      value: "OUT",
      label: "Can't go",
      icon: <XCircle size={20} />,
      active: "bg-red-500 text-white border-red-500",
      inactive: "bg-white text-slate-600 border-slate-200 hover:border-red-400 hover:text-red-500",
    },
  ];

  return (
    <div>
      <div className="flex gap-2">
        {buttons.map(({ value, label, icon, active, inactive }) => {
          const isActive = optimisticStatus === value || (value === "IN" && optimisticStatus === "WAITLIST");
          return (
            <button
              key={value}
              onClick={() => handleRsvp(value)}
              disabled={isPending}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-sm font-medium transition-all min-h-[72px]",
                isActive ? active : inactive,
                isPending && "opacity-60 cursor-not-allowed"
              )}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      {optimisticStatus === "WAITLIST" && (
        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
          <Clock size={15} className="shrink-0" />
          <span>Session is full — you&apos;re on the waitlist. You&apos;ll be added automatically if a spot opens.</span>
        </div>
      )}
    </div>
  );
}
