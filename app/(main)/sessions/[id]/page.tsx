import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, ExternalLink, ArrowLeft, Pencil } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { RsvpButtons } from "@/components/RsvpButtons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { RsvpStatus, Session } from "@/types/database";

interface Props {
  params: Promise<{ id: string }>;
}

const statusColors: Record<RsvpStatus, string> = {
  IN: "bg-green-100 text-green-700",
  MAYBE: "bg-yellow-100 text-yellow-700",
  OUT: "bg-red-100 text-red-700",
  WAITLIST: "bg-slate-100 text-slate-600",
};

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!session) notFound();

  const typedSession = session as Session;

  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("user_id, status, created_at, profiles(name)")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId!)
    .single();

  const myRsvp = rsvps?.find((r) => r.user_id === userId);
  const myStatus = (myRsvp?.status as RsvpStatus) ?? null;

  const inPlayers = rsvps?.filter((r) => r.status === "IN") ?? [];
  const waitlistPlayers = rsvps?.filter((r) => r.status === "WAITLIST") ?? [];
  const maybePlayers = rsvps?.filter((r) => r.status === "MAYBE") ?? [];
  const outPlayers = rsvps?.filter((r) => r.status === "OUT") ?? [];

  const inCount = inPlayers.length;
  const isFull = inCount >= typedSession.max_capacity;
  const courtsNeeded = Math.ceil(inCount / 4);

  const date = new Date(typedSession.date);
  const formattedDate = date.toLocaleDateString("en-SG", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-SG", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const isAdmin = profile?.role === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/sessions" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4 w-fit">
        <ArrowLeft size={16} />
        All sessions
      </Link>

      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-sm font-medium text-slate-500">{formattedDate}</p>
          <h1 className="text-2xl font-bold text-slate-900">{formattedTime}</h1>
        </div>
        {isAdmin && (
          <Link
            href={`/admin/sessions/${id}/edit`}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
          >
            <Pencil size={14} />
            Edit
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1.5 mb-6">
        <MapPin size={15} className="text-slate-400 shrink-0" />
        {typedSession.location_maps_url ? (
          <a
            href={typedSession.location_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-600 hover:underline flex items-center gap-1"
          >
            {typedSession.location_name}
            <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-sm text-slate-600">{typedSession.location_name}</span>
        )}
      </div>

      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-800">
              <strong>{inCount}</strong> confirmed → <strong>{courtsNeeded}</strong>{" "}
              {courtsNeeded === 1 ? "court" : "courts"} needed
            </span>
            <Badge
              variant="outline"
              className={
                isFull
                  ? "border-orange-300 text-orange-700 bg-orange-50"
                  : "border-green-300 text-green-700 bg-green-50"
              }
            >
              {isFull ? "Full" : `${typedSession.max_capacity - inCount} spots left`}
            </Badge>
          </div>
          <div className="mt-1 text-xs text-green-700 opacity-75">
            {typedSession.courts_booked}{" "}
            {typedSession.courts_booked === 1 ? "court" : "courts"} booked · max{" "}
            {typedSession.max_capacity} players
          </div>
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-3">
          Your RSVP
        </h2>
        <RsvpButtons sessionId={id} currentStatus={myStatus} isFull={isFull} />
      </div>

      <div className="space-y-4">
        <PlayerSection
          title={`Going (${inCount})`}
          players={inPlayers}
          currentUserId={userId!}
          statusClass={statusColors.IN}
        />
        {waitlistPlayers.length > 0 && (
          <PlayerSection
            title={`Waitlist (${waitlistPlayers.length})`}
            players={waitlistPlayers}
            currentUserId={userId!}
            statusClass={statusColors.WAITLIST}
          />
        )}
        {maybePlayers.length > 0 && (
          <PlayerSection
            title={`Maybe (${maybePlayers.length})`}
            players={maybePlayers}
            currentUserId={userId!}
            statusClass={statusColors.MAYBE}
          />
        )}
        {outPlayers.length > 0 && (
          <PlayerSection
            title={`Can't go (${outPlayers.length})`}
            players={outPlayers}
            currentUserId={userId!}
            statusClass={statusColors.OUT}
          />
        )}
      </div>
    </div>
  );
}

function PlayerSection({
  title,
  players,
  currentUserId,
}: {
  title: string;
  players: { user_id: string; profiles: { name: string } | null }[];
  currentUserId: string;
  statusClass: string;
}) {
  if (players.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
      <div className="space-y-1.5">
        {players.map((p) => (
          <div
            key={p.user_id}
            className={`flex items-center px-3 py-2 rounded-lg ${
              p.user_id === currentUserId ? "bg-slate-100" : "bg-white border border-slate-100"
            }`}
          >
            <span className="text-sm text-slate-800">
              {p.profiles?.name ?? "Unknown"}
              {p.user_id === currentUserId && (
                <span className="ml-1.5 text-xs text-slate-500">(you)</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
