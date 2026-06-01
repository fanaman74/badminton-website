import Link from "next/link";
import { MapPin, Users, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Session, RsvpStatus } from "@/types/database";

interface SessionCardProps {
  session: Session;
  inCount: number;
  userStatus: RsvpStatus | null;
}

const statusConfig: Record<RsvpStatus, { label: string; className: string }> = {
  IN: { label: "Going", className: "bg-green-100 text-green-700 border-green-200" },
  MAYBE: { label: "Maybe", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  OUT: { label: "Not going", className: "bg-red-100 text-red-700 border-red-200" },
  WAITLIST: { label: "Waitlisted", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

export function SessionCard({ session, inCount, userStatus }: SessionCardProps) {
  const date = new Date(session.date);
  const dayOfWeek = date.toLocaleDateString("en-SG", { weekday: "short" });
  const dayNum = date.toLocaleDateString("en-SG", { day: "numeric" });
  const month = date.toLocaleDateString("en-SG", { month: "short" });
  const time = date.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit", hour12: true });

  const isFull = inCount >= session.max_capacity;
  const statusBadge = userStatus ? statusConfig[userStatus] : null;

  return (
    <Link href={`/sessions/${session.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-slate-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center bg-green-50 rounded-lg px-3 py-2 min-w-[56px]">
              <span className="text-xs font-medium text-green-600 uppercase">{dayOfWeek}</span>
              <span className="text-2xl font-bold text-slate-900 leading-tight">{dayNum}</span>
              <span className="text-xs text-slate-500 uppercase">{month}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-500">{time}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <p className="text-sm text-slate-700 truncate">{session.location_name}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 mt-0.5 shrink-0" />
              </div>
              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <Users size={14} className="text-slate-400" />
                  <span className={`text-xs font-medium ${isFull ? "text-orange-600" : "text-slate-600"}`}>
                    {inCount}/{session.max_capacity}
                    {isFull && " · Full"}
                  </span>
                </div>
                {statusBadge && (
                  <Badge variant="outline" className={`text-xs ${statusBadge.className}`}>
                    {statusBadge.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
