"use client";

import { useState, useMemo } from "react";
import type { Session, RsvpStatus } from "@/types/database";
import { SessionCard } from "@/components/SessionCard";

interface SessionsListProps {
  sessions: Session[];
  inCountBySession: Record<string, number>;
  myStatusBySession: Record<string, RsvpStatus>;
  isAdmin?: boolean;
  isAuthenticated?: boolean;
}

export function SessionsList({
  sessions,
  inCountBySession,
  myStatusBySession,
  isAdmin,
  isAuthenticated,
}: SessionsListProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  const monthOptions = useMemo(() => {
    const map = new Map<string, { label: string; fullLabel: string; count: number }>();

    for (const s of sessions) {
      const d = new Date(s.date);
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth(); // 0-11
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;

      if (!map.has(key)) {
        const monthShort = d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });
        const monthFull = d.toLocaleDateString("en-GB", { month: "long", timeZone: "UTC" });
        const yearShort = String(year).slice(-2);
        map.set(key, {
          label: `${monthShort} '${yearShort}`,
          fullLabel: `${monthFull} ${year}`,
          count: 1,
        });
      } else {
        map.get(key)!.count += 1;
      }
    }

    return Array.from(map.entries()).map(([key, data]) => ({
      key,
      ...data,
    }));
  }, [sessions]);

  // Filter sessions based on selection
  const filteredSessions = useMemo(() => {
    if (selectedMonth === "ALL") return sessions;
    return sessions.filter((s) => {
      const d = new Date(s.date);
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth();
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      return key === selectedMonth;
    });
  }, [sessions, selectedMonth]);

  const selectedMonthObj = monthOptions.find((m) => m.key === selectedMonth);
  const selectedLabel = selectedMonthObj ? selectedMonthObj.fullLabel : "Upcoming";

  if (sessions.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "64px 20px",
          color: "var(--muted)",
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: 15,
        }}
      >
        No upcoming sessions
        {isAdmin && (
          <p style={{ marginTop: 8, fontSize: 13, color: "var(--faint)" }}>
            Create one using the + button above.
          </p>
        )}
      </div>
    );
  }

  // Next up hero session is the very first upcoming session overall
  const firstSessionOverall = sessions[0];
  const isFirstSessionInFilter =
    filteredSessions.length > 0 && filteredSessions[0].id === firstSessionOverall.id;

  // Hero card shown when "ALL" or when the month contains the immediate next session
  const showHeroCard = selectedMonth === "ALL" || isFirstSessionInFilter;
  const heroSession = showHeroCard ? filteredSessions[0] : null;
  const regularSessions = showHeroCard ? filteredSessions.slice(1) : filteredSessions;

  return (
    <div>
      {/* Month Bubble Filter Bar */}
      {monthOptions.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              padding: "0 20px 6px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {/* "All" Bubble */}
            <button
              onClick={() => setSelectedMonth("ALL")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 13px",
                borderRadius: 999,
                border: selectedMonth === "ALL" ? "1.5px solid var(--accent)" : "1px solid var(--line)",
                background: selectedMonth === "ALL" ? "var(--ink)" : "var(--surface)",
                color: selectedMonth === "ALL" ? "var(--accent)" : "var(--ink)",
                fontFamily: "var(--font-body)",
                fontWeight: selectedMonth === "ALL" ? 800 : 600,
                fontSize: 12.5,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                boxShadow: selectedMonth === "ALL" ? "0 2px 8px rgba(0,0,0,0.18)" : "0 1px 2px rgba(0,0,0,0.03)",
                transition: "all 0.15s ease",
              }}
            >
              <span>All</span>
              <span
                style={{
                  fontSize: 11,
                  padding: "1px 6px",
                  borderRadius: 999,
                  background: selectedMonth === "ALL" ? "rgba(198,240,60,0.2)" : "var(--surface-2)",
                  color: selectedMonth === "ALL" ? "var(--accent)" : "var(--muted)",
                  fontWeight: 700,
                }}
              >
                {sessions.length}
              </span>
            </button>

            {/* Individual Month Bubbles */}
            {monthOptions.map((m) => {
              const isSelected = selectedMonth === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMonth(m.key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 13px",
                    borderRadius: 999,
                    border: isSelected ? "1.5px solid var(--accent)" : "1px solid var(--line)",
                    background: isSelected ? "var(--ink)" : "var(--surface)",
                    color: isSelected ? "var(--accent)" : "var(--ink)",
                    fontFamily: "var(--font-body)",
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: 12.5,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.18)" : "0 1px 2px rgba(0,0,0,0.03)",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{m.label}</span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "1px 6px",
                      borderRadius: 999,
                      background: isSelected ? "rgba(198,240,60,0.2)" : "var(--surface-2)",
                      color: isSelected ? "var(--accent)" : "var(--muted)",
                      fontWeight: 700,
                    }}
                  >
                    {m.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hero card if applicable */}
      {heroSession && (
        <div style={{ padding: "0 20px 8px" }}>
          <SessionCard
            session={heroSession}
            inCount={inCountBySession[heroSession.id] ?? 0}
            userStatus={myStatusBySession[heroSession.id] ?? null}
            isAdmin={isAdmin}
            isAuthenticated={isAuthenticated}
            isHero
          />
        </div>
      )}

      {/* Section label */}
      <div
        style={{
          padding: "12px 20px 6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 11.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--faint)",
          }}
        >
          {selectedMonth === "ALL" ? "Upcoming" : selectedLabel}
        </div>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 12.5,
            color: "var(--muted)",
            whiteSpace: "nowrap",
          }}
        >
          {filteredSessions.length} {filteredSessions.length === 1 ? "session" : "sessions"}
        </span>
      </div>

      {/* List of regular session cards */}
      {regularSessions.length === 0 && !heroSession ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "var(--muted)",
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          No sessions found for this month.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11, padding: "0 20px 20px" }}>
          {regularSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              inCount={inCountBySession[session.id] ?? 0}
              userStatus={myStatusBySession[session.id] ?? null}
              isAdmin={isAdmin}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
