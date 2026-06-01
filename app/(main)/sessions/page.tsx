import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { SessionCard } from "@/components/SessionCard";
import type { RsvpStatus } from "@/types/database";

export default async function SessionsPage() {
  const userId = await getCurrentUserId();
  const supabase = await createClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("status", "UPCOMING")
    .order("date", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId!)
    .single();

  const { data: inRsvps } = await supabase
    .from("rsvps")
    .select("session_id")
    .eq("status", "IN");

  const { data: myRsvps } = await supabase
    .from("rsvps")
    .select("session_id, status")
    .eq("user_id", userId!);

  const inCountBySession = (inRsvps ?? []).reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r.session_id]: (acc[r.session_id] ?? 0) + 1 }),
    {}
  );

  const myStatusBySession = (myRsvps ?? []).reduce<Record<string, RsvpStatus>>(
    (acc, r) => ({ ...acc, [r.session_id]: r.status as RsvpStatus }),
    {}
  );

  const isAdmin = profile?.role === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sessions</h1>
        {isAdmin && (
          <Link
            href="/admin/sessions/new"
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            New session
          </Link>
        )}
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-medium">No upcoming sessions</p>
          {isAdmin && (
            <p className="text-sm mt-1">Create the first one using the button above.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              inCount={inCountBySession[session.id] ?? 0}
              userStatus={myStatusBySession[session.id] ?? null}
            />
          ))}
        </div>
      )}
    </div>
  );
}
