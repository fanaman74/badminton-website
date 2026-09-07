import { notFound } from "next/navigation";
import Link from "next/link";
import { sql, type RsvpStatus, type Session } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { RsvpButtons } from "@/components/RsvpButtons";
import { CourtMeter } from "@/components/ui/CourtMeter";
import { DeleteSessionButton } from "@/components/DeleteSessionButton";
import { SessionComments } from "@/components/SessionComments";
import { AdminRemoveRsvpButton } from "@/components/AdminRemoveRsvpButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_META: Record<string, { label: string; color: string }> = {
  IN:       { label: "Going",      color: "var(--in)" },
  WAITLIST: { label: "Waitlist",   color: "var(--maybe)" },
  MAYBE:    { label: "Maybe",      color: "var(--faint)" },
  OUT:      { label: "Can't make it", color: "var(--out)" },
};

interface RsvpWithProfile {
  user_id: string;
  status: RsvpStatus;
  created_at: string;
  name: string;
  email: string | null;
}

interface CommentWithAuthor {
  id: string;
  body: string;
  created_at: string;
  name: string;
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params;
  const userId = await getCurrentUserId();

  const sessionRows = await sql`
    SELECT *
    FROM sessions
    WHERE id = ${id}
    LIMIT 1;
  `;

  if (!sessionRows || sessionRows.length === 0) notFound();
  const s = sessionRows[0] as Session;

  const rsvpRows = (await sql`
    SELECT 
      r.user_id,
      r.status,
      r.created_at,
      p.name,
      p.email
    FROM rsvps r
    JOIN profiles p ON r.user_id = p.id
    WHERE r.session_id = ${id}
    ORDER BY r.created_at ASC;
  `) as RsvpWithProfile[];

  const profileRows = userId
    ? await sql`
        SELECT role
        FROM profiles
        WHERE id = ${userId}
        LIMIT 1;
      `
    : [];

  const commentRows = (await sql`
    SELECT 
      c.id,
      c.body,
      c.created_at,
      p.name
    FROM session_comments c
    JOIN profiles p ON c.author_id = p.id
    WHERE c.session_id = ${id}
    ORDER BY c.created_at ASC;
  `) as CommentWithAuthor[];

  const myRsvp = rsvpRows.find((r) => r.user_id === userId);
  const myStatus = myRsvp?.status ?? null;

  const grouped = {
    IN:       rsvpRows.filter((r) => r.status === "IN"),
    WAITLIST: rsvpRows.filter((r) => r.status === "WAITLIST"),
    MAYBE:    rsvpRows.filter((r) => r.status === "MAYBE"),
    OUT:      rsvpRows.filter((r) => r.status === "OUT"),
  };

  const inCount = grouped.IN.length;
  const isFull = inCount >= s.max_capacity;
  const courtsNeeded = Math.max(1, Math.ceil(inCount / 4));
  const spots = s.max_capacity - inCount;

  const date = new Date(s.date);
  const tz = "UTC"; // Sessions are stored in UTC matching what the admin typed
  const dow = date.toLocaleDateString("en-GB", { weekday: "short", timeZone: tz }).toUpperCase();
  const day = date.toLocaleDateString("en-GB", { day: "2-digit", timeZone: tz });
  const mon = date.toLocaleDateString("en-GB", { month: "short", timeZone: tz }).toUpperCase();
  const fullDate = date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: tz });
  const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: tz });

  const isAdmin = profileRows[0]?.role === "ADMIN";

  return (
    <div style={{ minHeight: "100%", background: "var(--bg)", paddingBottom: 140 }}>
      {/* Top bar */}
      <div style={{ padding: "48px 16px 10px", display: "flex", alignItems: "center",
        justifyContent: "space-between", background: "var(--bg)", borderBottom: "1px solid var(--line)" }}>
        <Link href="/sessions" style={{
          width: 42, height: 42, borderRadius: 999, border: "1px solid var(--line)",
          background: "var(--surface)", color: "var(--ink)", display: "flex",
          alignItems: "center", justifyContent: "center", textDecoration: "none",
        }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7"/>
          </svg>
        </Link>
        <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
          letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
          {fullDate}
        </div>
        {isAdmin ? (
          <div style={{ display: "flex", gap: 8 }}>
            <Link href={`/admin/sessions/${id}/edit`} style={{
              width: 42, height: 42, borderRadius: 999, border: "1px solid var(--line)",
              background: "var(--surface)", color: "var(--ink)", display: "flex",
              alignItems: "center", justifyContent: "center", textDecoration: "none", fontSize: 12,
              fontFamily: "var(--font-body)", fontWeight: 700,
            }}>Edit</Link>
            <DeleteSessionButton sessionId={id} />
          </div>
        ) : <div style={{ width: 42 }} />}
      </div>

      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 13 }}>
        {/* Hero row */}
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{
            width: 64, flexShrink: 0, textAlign: "center",
            background: "var(--accent)", color: "var(--accent-ink)",
            borderRadius: "var(--r-md)", padding: "9px 0 7px",
          }}>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 10.5, letterSpacing: "0.1em" }}>{dow}</div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, lineHeight: 1, margin: "1px 0" }}>{day}</div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10, letterSpacing: "0.1em", opacity: 0.8 }}>{mon}</div>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 25,
              lineHeight: 1.05, color: "var(--ink)", letterSpacing: "-0.01em" }}>{s.location_name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6,
              color: "var(--muted)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13.5 }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>
              </svg>
              {time}
            </div>
          </div>
        </div>

        {/* Meta chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <MetaChip icon="pin" text={s.location_maps_url
            ? <a href={s.location_maps_url} target="_blank" rel="noopener noreferrer"
                style={{ color: "inherit", textDecoration: "none" }}>{s.location_name}</a>
            : s.location_name} />
          <MetaChip icon="courts" text={`${s.courts_booked} court${s.courts_booked > 1 ? "s" : ""} booked`} />
        </div>

        {/* Court calculator */}
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 16,
          border: "1px solid var(--line)",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.30)",
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
                letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--faint)" }}>Court calculator</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 8 }}>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 38,
                  lineHeight: 1, color: "var(--ink)" }}>{courtsNeeded}</span>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, color: "var(--muted)" }}>
                  of {s.courts_booked} courts active
                </span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
                color: spots > 0 ? "var(--in)" : "var(--maybe)" }}>
                {spots > 0 ? `${spots} spots left` : "Full"}
              </div>
              <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12, color: "var(--faint)" }}>
                4 players / court
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <CourtMeter session={s} confirmedCount={inCount} />
          </div>
          <div style={{ marginTop: 13, height: 8, borderRadius: 99, background: "var(--surface-2)",
            overflow: "hidden", border: "1px solid var(--line)" }}>
            <div style={{ width: `${Math.min(100, (inCount / s.max_capacity) * 100)}%`, height: "100%",
              borderRadius: 99, background: isFull ? "var(--maybe)" : "var(--brand)",
              transition: "width .4s cubic-bezier(.3,1,.4,1)" }} />
          </div>
          <div style={{ marginTop: 8, fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--muted)" }}>
            <b style={{ color: "var(--ink)", fontWeight: 800 }}>{inCount} confirmed</b>
            {grouped.MAYBE.length > 0 && ` · ${grouped.MAYBE.length} maybe`}
            {grouped.WAITLIST.length > 0 && ` · ${grouped.WAITLIST.length} waiting`}
          </div>
        </div>

        {/* Player lists */}
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: "8px 16px 16px",
          border: "1px solid var(--line)",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.30)",
        }}>
          {(["IN", "WAITLIST", "MAYBE", "OUT"] as const).map((grp) => {
            const players = grouped[grp];
            if (!players.length) return null;
            const meta = STATUS_META[grp];
            return (
              <div key={grp} style={{ marginTop: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0" }}>
                  <span style={{ width: 9, height: 9, borderRadius: 9, background: meta.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 12.5,
                    letterSpacing: "0.04em", color: "var(--ink)", textTransform: "uppercase" }}>{meta.label}</span>
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12.5, color: "var(--muted)" }}>
                    {players.length}
                  </span>
                </div>
                <div style={{ borderTop: "1px solid var(--line)" }}>
                  {players.map((p, i) => {
                    const isYou = p.user_id === userId;
                    const pName = p.name ?? "Unknown";
                    return (
                      <div key={p.user_id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "7px 0" }}>
                        {grp === "WAITLIST" && (
                          <span style={{ width: 16, fontFamily: "var(--font-display)", fontWeight: 800,
                            fontSize: 12.5, color: "var(--faint)", textAlign: "right" }}>{i + 1}</span>
                        )}
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                          background: `hsl(${(p.user_id.charCodeAt(0) * 47) % 360}, 60%, 55%)`,
                          color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 12,
                          boxShadow: isYou ? `0 0 0 2.5px var(--surface), 0 0 0 4.5px var(--brand)` : "none",
                        }}>
                          {pName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14.5,
                            color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {isYou ? "You" : pName}
                          </div>
                        </div>
                        {grp === "WAITLIST" && i === 0 && (
                          <span style={{ fontFamily: "var(--font-body)", fontWeight: 800, fontSize: 10.5,
                            letterSpacing: "0.05em", color: "var(--maybe)",
                            background: "color-mix(in srgb,var(--maybe) 13%,transparent)",
                            padding: "3px 8px", borderRadius: 6 }}>NEXT UP</span>
                        )}
                        {isAdmin && (
                          <AdminRemoveRsvpButton
                            sessionId={id}
                            userId={p.user_id}
                            playerName={pName}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Admin notes / comments */}
        <SessionComments
          sessionId={id}
          comments={commentRows.map((c) => ({
            id: c.id,
            body: c.body,
            created_at: c.created_at,
            author: { name: c.name },
          }))}
          isAdmin={isAdmin}
          currentUserId={userId!}
        />
      </div>

      <RsvpButtons sessionId={id} currentStatus={myStatus} isFull={isFull} isAuthenticated={!!userId} />
    </div>
  );
}

function MetaChip({ icon, text }: { icon: string; text: React.ReactNode }) {
  const icons: Record<string, React.ReactNode> = {
    pin: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>,
    courts: <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/></svg>,
  };
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px",
      borderRadius: 999, background: "var(--surface)", border: "1px solid var(--line)",
      color: "var(--ink)", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5 }}>
      <span style={{ display: "flex", color: "var(--brand)" }}>{icons[icon]}</span>
      {text}
    </div>
  );
}
