"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import type { Session, RsvpStatus } from "@/types/database";
import { batchAcceptSessions, removeMyRsvpAction } from "@/lib/actions/rsvp";

interface Props {
  sessions: Session[];
  inCountBySession: Record<string, number>;
  myStatusBySession: Record<string, RsvpStatus>;
}

export function YouMultiDateSelector({
  sessions,
  inCountBySession,
  myStatusBySession: initialStatuses,
}: Props) {
  const [statuses, setStatuses] = useState<Record<string, RsvpStatus>>(initialStatuses);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Month options for filter bubbles
  const monthOptions = useMemo(() => {
    const map = new Map<string, { label: string; fullLabel: string; count: number }>();

    for (const s of sessions) {
      const d = new Date(s.date);
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth();
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

  // Filtered list
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

  // Count unjoined sessions in view
  const unjoinedInFilter = useMemo(() => {
    return filteredSessions.filter((s) => statuses[s.id] !== "IN");
  }, [filteredSessions, statuses]);

  function toggleSession(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSelectAll() {
    const ids = unjoinedInFilter.map((s) => s.id);
    setSelectedIds(new Set(ids));
  }

  function handleSelectNext4() {
    const ids = unjoinedInFilter.slice(0, 4).map((s) => s.id);
    setSelectedIds(new Set(ids));
  }

  function handleClearSelection() {
    setSelectedIds(new Set());
  }

  function handleBatchAccept() {
    if (selectedIds.size === 0) return;

    setFeedback(null);
    const idsToAccept = Array.from(selectedIds);

    startTransition(async () => {
      const result = await batchAcceptSessions(idsToAccept);
      if (result.success) {
        setStatuses((prev) => ({
          ...prev,
          ...(result.statuses || {}),
        }));
        setFeedback({
          type: "success",
          message: `🎉 Success! You have been added to ${result.count} playing date${result.count > 1 ? "s" : ""}.`,
        });
        setSelectedIds(new Set());
      } else {
        setFeedback({
          type: "error",
          message: result.error || "Failed to join selected dates.",
        });
      }
    });
  }

  async function handleRemoveEntry(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove your entry for this session?")) return;

    setRemovingId(sessionId);
    setFeedback(null);

    const result = await removeMyRsvpAction(sessionId);
    setRemovingId(null);

    if (result.success) {
      setStatuses((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(sessionId);
        return next;
      });
      setFeedback({
        type: "success",
        message: "Entry removed successfully.",
      });
    } else {
      setFeedback({
        type: "error",
        message: result.error || "Failed to remove entry.",
      });
    }
  }

  if (sessions.length === 0) {
    return (
      <div style={{
        background: "var(--surface)",
        borderRadius: "var(--r-lg)",
        padding: "24px 20px",
        border: "1px solid var(--line)",
        textAlign: "center",
        color: "var(--muted)",
      }}>
        <div style={{ fontSize: 24, marginBottom: 8 }}>🏸</div>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>No upcoming playing dates scheduled.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--surface)",
      borderRadius: "var(--r-lg)",
      border: "1px solid var(--line)",
      padding: "20px 18px",
      boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.30)",
    }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{
            fontFamily: "var(--font-body)",
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--brand)",
            marginBottom: 4,
          }}>
            Multi-Date Join & Manage
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 21,
            lineHeight: 1.15,
            color: "var(--ink)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}>
            Select Playing Dates
          </h2>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 13,
            color: "var(--muted)",
            margin: "5px 0 0",
            lineHeight: 1.45,
          }}>
            Check multiple dates below and tap <strong>Accept</strong> to add yourself to all of them at once.
          </p>
        </div>
      </div>

      {/* Month Filter Bubbles */}
      {monthOptions.length > 1 && (
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              paddingBottom: 4,
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedMonth("ALL")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "5px 11px",
                borderRadius: 999,
                border: selectedMonth === "ALL" ? "1.5px solid var(--accent)" : "1px solid var(--line)",
                background: selectedMonth === "ALL" ? "var(--ink)" : "var(--surface-2)",
                color: selectedMonth === "ALL" ? "var(--accent)" : "var(--ink)",
                fontFamily: "var(--font-body)",
                fontWeight: selectedMonth === "ALL" ? 800 : 600,
                fontSize: 11.5,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
            >
              All ({sessions.length})
            </button>

            {monthOptions.map((m) => {
              const active = selectedMonth === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setSelectedMonth(m.key)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 11px",
                    borderRadius: 999,
                    border: active ? "1.5px solid var(--accent)" : "1px solid var(--line)",
                    background: active ? "var(--ink)" : "var(--surface-2)",
                    color: active ? "var(--accent)" : "var(--ink)",
                    fontFamily: "var(--font-body)",
                    fontWeight: active ? 800 : 600,
                    fontSize: 11.5,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    transition: "all 0.15s ease",
                  }}
                >
                  {m.label} ({m.count})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Select Buttons */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 0",
        marginBottom: 10,
        borderBottom: "1px solid var(--line)",
      }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {unjoinedInFilter.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 11.5,
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  color: "var(--ink)",
                  cursor: "pointer",
                }}
              >
                Select all available ({unjoinedInFilter.length})
              </button>
              {unjoinedInFilter.length > 4 && (
                <button
                  type="button"
                  onClick={handleSelectNext4}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--line)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    fontSize: 11.5,
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    color: "var(--ink)",
                    cursor: "pointer",
                  }}
                >
                  Select next 4
                </button>
              )}
            </>
          )}
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleClearSelection}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--muted)",
                fontSize: 11.5,
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Clear
            </button>
          )}
        </div>

        <span style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: 12.5,
          color: selectedIds.size > 0 ? "var(--brand)" : "var(--muted)",
        }}>
          {selectedIds.size} selected
        </span>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div style={{
          padding: "10px 14px",
          borderRadius: 8,
          marginBottom: 12,
          fontSize: 13,
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          lineHeight: 1.4,
          background: feedback.type === "success" ? "rgba(31, 164, 99, 0.12)" : "rgba(216, 70, 59, 0.12)",
          color: feedback.type === "success" ? "var(--in)" : "var(--out)",
          border: feedback.type === "success" ? "1px solid rgba(31, 164, 99, 0.3)" : "1px solid rgba(216, 70, 59, 0.3)",
        }}>
          {feedback.message}
        </div>
      )}

      {/* List of Selectable Sessions */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 420, overflowY: "auto", paddingRight: 2 }}>
        {filteredSessions.map((s) => {
          const isSelected = selectedIds.has(s.id);
          const userStatus = statuses[s.id];
          const isAccepted = userStatus === "IN";
          const isWaitlist = userStatus === "WAITLIST";
          const inCount = inCountBySession[s.id] ?? 0;
          const isFull = inCount >= s.max_capacity;

          const date = new Date(s.date);
          const dow = date.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }).toUpperCase();
          const day = date.toLocaleDateString("en-GB", { day: "2-digit", timeZone: "UTC" });
          const mon = date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }).toUpperCase();
          const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" });

          return (
            <div
              key={s.id}
              onClick={() => {
                if (!isAccepted) toggleSession(s.id);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 12px",
                borderRadius: "var(--r-md)",
                border: isSelected
                  ? "2px solid var(--brand)"
                  : (isAccepted ? "1px solid rgba(31, 164, 99, 0.35)" : "1px solid var(--line)"),
                background: isSelected
                  ? "color-mix(in srgb, var(--brand) 6%, var(--surface))"
                  : (isAccepted ? "rgba(31, 164, 99, 0.04)" : "var(--surface-2)"),
                cursor: isAccepted ? "default" : "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {/* Checkbox (or Accepted Checkmark) */}
              <div style={{ flexShrink: 0 }}>
                {isAccepted ? (
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: "var(--in)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 900,
                  }}>
                    ✓
                  </div>
                ) : (
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    border: isSelected ? "2px solid var(--brand)" : "1.5px solid var(--faint)",
                    background: isSelected ? "var(--brand)" : "var(--surface)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 800,
                    transition: "all 0.15s ease",
                  }}>
                    {isSelected ? "✓" : null}
                  </div>
                )}
              </div>

              {/* Date Box */}
              <div style={{
                width: 48,
                flexShrink: 0,
                textAlign: "center",
                background: isAccepted ? "var(--in)" : (isSelected ? "var(--brand)" : "var(--accent)"),
                color: (isAccepted || isSelected) ? "#fff" : "var(--accent-ink)",
                borderRadius: 6,
                padding: "4px 0",
                transition: "all 0.15s ease",
              }}>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.08em" }}>{dow}</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{day}</div>
                <div style={{ fontSize: 8.5, fontWeight: 700, opacity: 0.85 }}>{mon}</div>
              </div>

              {/* Session Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: 14.5,
                  color: "var(--ink)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {s.location_name}
                </div>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginTop: 2,
                  fontSize: 11.5,
                  color: "var(--muted)",
                  fontFamily: "var(--font-body)",
                }}>
                  <span>⏰ {time}</span>
                  <span>·</span>
                  <span>{isFull ? "Full" : `${s.max_capacity - inCount} spots left`}</span>
                </div>
              </div>

              {/* Status / Actions */}
              <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6 }}>
                {isAccepted ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: "rgba(31, 164, 99, 0.15)",
                      color: "var(--in)",
                      fontSize: 11,
                      fontWeight: 800,
                    }}>
                      Accepted ✓
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveEntry(s.id, e)}
                      disabled={removingId === s.id}
                      style={{
                        background: "color-mix(in srgb, var(--out) 12%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--out) 25%, transparent)",
                        color: "var(--out)",
                        borderRadius: 6,
                        padding: "3px 7px",
                        fontSize: 11,
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        cursor: removingId === s.id ? "not-allowed" : "pointer",
                      }}
                      title="Remove my entry from this date"
                    >
                      {removingId === s.id ? "..." : "Remove"}
                    </button>
                  </div>
                ) : isWaitlist ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      display: "inline-flex",
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: "rgba(224, 138, 30, 0.15)",
                      color: "var(--maybe)",
                      fontSize: 11,
                      fontWeight: 800,
                    }}>
                      Waitlisted
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveEntry(s.id, e)}
                      disabled={removingId === s.id}
                      style={{
                        background: "color-mix(in srgb, var(--out) 12%, transparent)",
                        border: "1px solid color-mix(in srgb, var(--out) 25%, transparent)",
                        color: "var(--out)",
                        borderRadius: 6,
                        padding: "3px 7px",
                        fontSize: 11,
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        cursor: removingId === s.id ? "not-allowed" : "pointer",
                      }}
                      title="Remove my entry from this date"
                    >
                      {removingId === s.id ? "..." : "Remove"}
                    </button>
                  </div>
                ) : (
                  <span style={{
                    fontSize: 11.5,
                    fontFamily: "var(--font-body)",
                    fontWeight: 700,
                    color: isSelected ? "var(--brand)" : "var(--faint)",
                  }}>
                    {isSelected ? "Selected" : "Tap to select"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Accept Selected Dates Primary Button */}
      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          onClick={handleBatchAccept}
          disabled={isPending || selectedIds.size === 0}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "var(--r-md)",
            padding: "13px 18px",
            background: selectedIds.size > 0 ? "var(--in)" : "var(--surface-2)",
            color: selectedIds.size > 0 ? "#fff" : "var(--muted)",
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 15,
            cursor: (isPending || selectedIds.size === 0) ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxShadow: selectedIds.size > 0 ? "0 6px 18px -4px var(--in)" : "none",
            transition: "all 0.2s ease",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          <span>🏸</span>
          <span>
            {isPending
              ? "Accepting playing dates..."
              : (selectedIds.size === 0
                ? "Select dates above to Accept"
                : `Accept ${selectedIds.size} Selected Date${selectedIds.size > 1 ? "s" : ""}`)}
          </span>
          {selectedIds.size > 0 && <span>→</span>}
        </button>
      </div>
    </div>
  );
}
