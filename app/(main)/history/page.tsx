import { sql } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";

interface PastSession {
  id: string;
  date: string;
  location_name: string;
  courts_booked: number;
  max_capacity: number;
  status: string;
  rsvp_status: string | null;
  in_count: number;
}

interface DbPastSessionRow {
  id: string;
  date: string;
  location_name: string;
  courts_booked: number;
  max_capacity: number;
  status: string;
  user_rsvp_status: string | null;
  in_count: number;
}

export default async function HistoryPage() {
  const userId = await getCurrentUserId();

  // Fetch completed/past sessions with user's RSVP status and IN count
  const rows = userId
    ? ((await sql`
        SELECT 
          s.id,
          s.date,
          s.location_name,
          s.courts_booked,
          s.max_capacity,
          s.status,
          (
            SELECT r.status 
            FROM rsvps r 
            WHERE r.session_id = s.id AND r.user_id = ${userId}
            LIMIT 1
          ) AS user_rsvp_status,
          (
            SELECT COUNT(*)::int
            FROM rsvps r
            WHERE r.session_id = s.id AND r.status = 'IN'
          ) AS in_count
        FROM sessions s
        WHERE s.status = 'COMPLETED' OR s.date < NOW()
        ORDER BY s.date DESC
        LIMIT 50;
      `) as DbPastSessionRow[])
    : ((await sql`
        SELECT 
          s.id,
          s.date,
          s.location_name,
          s.courts_booked,
          s.max_capacity,
          s.status,
          NULL AS user_rsvp_status,
          (
            SELECT COUNT(*)::int
            FROM rsvps r
            WHERE r.session_id = s.id AND r.status = 'IN'
          ) AS in_count
        FROM sessions s
        WHERE s.status = 'COMPLETED' OR s.date < NOW()
        ORDER BY s.date DESC
        LIMIT 50;
      `) as DbPastSessionRow[]);


  const pastSessions: PastSession[] = (rows ?? []).map((s) => ({
    id: s.id,
    date: s.date,
    location_name: s.location_name,
    courts_booked: s.courts_booked,
    max_capacity: s.max_capacity,
    status: s.status,
    rsvp_status: s.user_rsvp_status || null,
    in_count: s.in_count || 0,
  }));

  // Group by month
  const grouped = pastSessions.reduce(
    (acc, session) => {
      const date = new Date(session.date);
      const monthKey = date.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      });

      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(session);
      return acc;
    },
    {} as Record<string, PastSession[]>
  );

  const statusBadgeColor: Record<string, string> = {
    IN: "#1FA463",
    MAYBE: "#E08A1E",
    OUT: "#D8463B",
    WAITLIST: "#A8A18C",
  };

  const statusBadgeLabel: Record<string, string> = {
    IN: "Attended",
    MAYBE: "Maybe",
    OUT: "Didn't attend",
    WAITLIST: "Waitlist",
  };

  return (
    <div
      style={{
        padding: "16px",
        maxWidth: 600,
        margin: "0 auto",
        paddingBottom: 100,
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 28,
            color: "var(--ink)",
            margin: "0 0 8px",
          }}
        >
          Booking History
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: 14,
            color: "var(--faint)",
            margin: 0,
          }}
        >
          {pastSessions.length} past session{pastSessions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Sessions grouped by month */}
      {pastSessions.length === 0 ? (
        <div
          style={{
            padding: "40px 16px",
            textAlign: "center",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 15,
            color: "var(--faint)",
          }}
        >
          No past bookings yet
        </div>
      ) : (
        Object.entries(grouped).map(([monthKey, sessions]) => (
          <div key={monthKey} style={{ marginBottom: 32 }}>
            {/* Month header */}
            <div
              style={{
                padding: "12px 0 8px",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted)",
                borderBottom: "1px solid var(--line)",
                marginBottom: 12,
              }}
            >
              {monthKey}
            </div>

            {/* Sessions in this month */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sessions.map((session) => {
                const d = new Date(session.date);
                const dateStr = d.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  timeZone: "UTC",
                });
                const timeStr = d.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "UTC",
                });

                const rsvpColor = session.rsvp_status
                  ? statusBadgeColor[session.rsvp_status]
                  : "#1FA463";
                const rsvpLabel = session.rsvp_status
                  ? statusBadgeLabel[session.rsvp_status]
                  : `${session.in_count} played`;

                return (
                  <div
                    key={session.id}
                    style={{
                      padding: 14,
                      border: "1px solid var(--line)",
                      borderRadius: "var(--r-md)",
                      background: "var(--surface)",
                    }}
                  >
                    {/* Date and time */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 700,
                            fontSize: 13,
                            color: "var(--ink)",
                          }}
                        >
                          {dateStr}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 500,
                            fontSize: 12,
                            color: "var(--faint)",
                          }}
                        >
                          {timeStr}
                        </div>
                      </div>

                      {/* RSVP or attendee badge */}
                      <div style={{ marginLeft: "auto" }}>
                        <span
                          style={{
                            display: "inline-block",
                            background: `color-mix(in srgb, ${rsvpColor} 15%, transparent)`,
                            color: rsvpColor,
                            padding: "4px 10px",
                            borderRadius: "var(--r-sm)",
                            fontFamily: "var(--font-body)",
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                        >
                          {rsvpLabel}
                        </span>
                      </div>
                    </div>


                    {/* Location and courts */}
                    <div style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: 13,
                          color: "var(--ink)",
                          marginBottom: 4,
                        }}
                      >
                        📍 {session.location_name}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: 12,
                          color: "var(--faint)",
                        }}
                      >
                        🏸 {session.courts_booked} court
                        {session.courts_booked > 1 ? "s" : ""} · {session.in_count} /
                        {session.max_capacity} confirmed
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
