"use client";

import { useState, useActionState } from "react";
import Link from "next/link";
import { createSessionAction, createRecurringSessionsAction } from "@/lib/actions/sessions";

interface Config {
  day_of_week: number;
  courts: number;
  start_time: string;
  location_name: string;
  location_maps_url: string | null;
}

const DAYS = [
  { val: 0, label: "Monday" },
  { val: 1, label: "Tuesday" },
  { val: 2, label: "Wednesday" },
  { val: 3, label: "Thursday" },
  { val: 4, label: "Friday" },
  { val: 5, label: "Saturday" },
  { val: 6, label: "Sunday" },
];

function getNextDate(dayOfWeek: number): string {
  // dayOfWeek: 0=Mon…6=Sun; JS getDay(): 0=Sun,1=Mon…6=Sat
  const jsDay = (dayOfWeek + 1) % 7;
  const today = new Date(); today.setHours(0,0,0,0);
  let daysAhead = (jsDay - today.getDay() + 7) % 7;
  if (daysAhead === 0) daysAhead = 7;
  const d = new Date(today);
  d.setDate(today.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

export function NewSessionForm({ config }: { config: Config | null }) {
  const [tab, setTab] = useState<"single" | "recurring">("single");
  const [singleState, singleAction, singlePending] = useActionState(createSessionAction, undefined);
  const [recurringState, recurringAction, recurringPending] = useActionState(createRecurringSessionsAction, undefined);

  const defaultDayOfWeek = config?.day_of_week ?? 3; // Thursday
  const defaultDate = config ? getNextDate(config.day_of_week) : "";
  const defaultTime = config?.start_time ?? "19:00";
  const defaultLoc = config?.location_name ?? "VUB Sports Hall";
  const defaultMaps = config?.location_maps_url ?? "";
  const defaultCourts = config?.courts ?? 3;

  const inputStyle = {
    width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
    padding: "11px 13px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15,
    color: "var(--ink)", background: "var(--surface-2)", outline: "none",
  } as React.CSSProperties;

  const labelStyle = {
    display: "block", fontFamily: "var(--font-body)", fontWeight: 700,
    fontSize: 13, color: "var(--ink)", marginBottom: 6,
  } as React.CSSProperties;

  return (
    <div style={{ minHeight: "100%", background: "var(--bg)", paddingBottom: 32 }}>
      {/* Header */}
      <div style={{ padding: "48px 20px 14px", display: "flex", alignItems: "flex-end", gap: 12 }}>
        <Link href="/sessions" style={{
          width: 38, height: 38, borderRadius: 999, border: "1px solid var(--line)",
          background: "var(--surface)", color: "var(--ink)", display: "flex",
          alignItems: "center", justifyContent: "center", textDecoration: "none", flexShrink: 0,
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7"/>
          </svg>
        </Link>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11,
            letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand)", marginBottom: 3 }}>Admin</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26,
            lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>Add Play Dates</div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Mode Selector Tabs */}
        <div style={{
          display: "flex",
          background: "var(--surface-2)",
          padding: 4,
          borderRadius: "var(--r-md)",
          marginBottom: 14,
          border: "1px solid var(--line)",
        }}>
          <button
            type="button"
            onClick={() => setTab("single")}
            style={{
              flex: 1,
              height: 38,
              borderRadius: "var(--r-sm)",
              border: "none",
              background: tab === "single" ? "var(--surface)" : "transparent",
              color: tab === "single" ? "var(--ink)" : "var(--muted)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: tab === "single" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            Single Session
          </button>
          <button
            type="button"
            onClick={() => setTab("recurring")}
            style={{
              flex: 1,
              height: 38,
              borderRadius: "var(--r-sm)",
              border: "none",
              background: tab === "recurring" ? "var(--surface)" : "transparent",
              color: tab === "recurring" ? "var(--ink)" : "var(--muted)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: tab === "recurring" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            🗓️ Auto-Schedule Season
          </button>
        </div>

        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 20,
          border: "1px solid var(--line)",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.20)",
        }}>
          {config && (
            <div style={{ marginBottom: 16, padding: "10px 13px", borderRadius: "var(--r-sm)",
              background: "color-mix(in srgb, var(--accent) 15%, transparent)",
              border: "1px solid color-mix(in srgb, var(--accent) 40%, transparent)",
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 12.5, color: "var(--accent-ink)",
              display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Pre-filled from weekly club configuration</span>
              <Link href="/admin/config" style={{ color: "var(--brand)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                Edit config →
              </Link>
            </div>
          )}

          {tab === "single" ? (
            /* Single Session Form */
            <form action={singleAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label htmlFor="date" style={labelStyle}>Date <span style={{ color: "var(--out)" }}>*</span></label>
                  <input id="date" name="date" type="date" required
                    defaultValue={defaultDate} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="time" style={labelStyle}>Time <span style={{ color: "var(--out)" }}>*</span></label>
                  <input id="time" name="time" type="time" required
                    defaultValue={defaultTime} style={inputStyle} />
                </div>
              </div>

              <div>
                <label htmlFor="location_name" style={labelStyle}>Location <span style={{ color: "var(--out)" }}>*</span></label>
                <input id="location_name" name="location_name" type="text" required
                  defaultValue={defaultLoc}
                  placeholder="e.g. VUB Sports Hall"
                  style={inputStyle} />
              </div>

              <div>
                <label htmlFor="location_maps_url" style={labelStyle}>
                  Google Maps link <span style={{ fontWeight: 500, color: "var(--faint)" }}>(optional)</span>
                </label>
                <input id="location_maps_url" name="location_maps_url" type="url"
                  defaultValue={defaultMaps}
                  placeholder="https://maps.google.com/…"
                  style={inputStyle} />
              </div>

              <div>
                <label htmlFor="courts_booked" style={labelStyle}>Courts booked <span style={{ color: "var(--out)" }}>*</span></label>
                <select id="courts_booked" name="courts_booked" required
                  defaultValue={defaultCourts}
                  style={{ ...inputStyle, appearance: "none" as const }}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} court{n > 1 ? "s" : ""} · max {n * 4} players</option>
                  ))}
                </select>
              </div>

              {singleState?.error && (
                <div style={{ background: "color-mix(in srgb, var(--out) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                  borderRadius: "var(--r-sm)", padding: "10px 14px",
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--out)" }}>
                  {singleState.error}
                </div>
              )}

              <button type="submit" disabled={singlePending} style={{
                width: "100%", height: 48, marginTop: 4, borderRadius: "var(--r-md)", border: "none",
                background: "var(--brand)", color: "#fff",
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
                cursor: singlePending ? "not-allowed" : "pointer", opacity: singlePending ? 0.7 : 1,
                boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
              }}>
                {singlePending ? "Creating…" : "Create session"}
              </button>
            </form>
          ) : (
            /* Recurring Season Form */
            <form action={recurringAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label htmlFor="day_of_week" style={labelStyle}>Day of the week <span style={{ color: "var(--out)" }}>*</span></label>
                <select id="day_of_week" name="day_of_week" required
                  defaultValue={defaultDayOfWeek}
                  style={{ ...inputStyle, appearance: "none" as const }}>
                  {DAYS.map((d) => (
                    <option key={d.val} value={d.val}>Every {d.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label htmlFor="start_date" style={labelStyle}>Season Start <span style={{ color: "var(--out)" }}>*</span></label>
                  <input id="start_date" name="start_date" type="date" required
                    defaultValue="2026-09-10" style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="end_date" style={labelStyle}>Season End <span style={{ color: "var(--out)" }}>*</span></label>
                  <input id="end_date" name="end_date" type="date" required
                    defaultValue="2027-06-24" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label htmlFor="rec_time" style={labelStyle}>Start Time <span style={{ color: "var(--out)" }}>*</span></label>
                  <input id="rec_time" name="time" type="time" required
                    defaultValue={defaultTime} style={inputStyle} />
                </div>
                <div>
                  <label htmlFor="rec_courts" style={labelStyle}>Courts Booked <span style={{ color: "var(--out)" }}>*</span></label>
                  <select id="rec_courts" name="courts_booked" required
                    defaultValue={defaultCourts}
                    style={{ ...inputStyle, appearance: "none" as const }}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>{n} court{n > 1 ? "s" : ""} · {n * 4} players</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="rec_location" style={labelStyle}>Location <span style={{ color: "var(--out)" }}>*</span></label>
                <input id="rec_location" name="location_name" type="text" required
                  defaultValue={defaultLoc}
                  placeholder="e.g. VUB Sports Hall"
                  style={inputStyle} />
              </div>

              <div>
                <label htmlFor="rec_maps" style={labelStyle}>
                  Google Maps link <span style={{ fontWeight: 500, color: "var(--faint)" }}>(optional)</span>
                </label>
                <input id="rec_maps" name="location_maps_url" type="url"
                  defaultValue={defaultMaps}
                  placeholder="https://maps.google.com/…"
                  style={inputStyle} />
              </div>

              {recurringState?.error && (
                <div style={{ background: "color-mix(in srgb, var(--out) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                  borderRadius: "var(--r-sm)", padding: "10px 14px",
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--out)" }}>
                  {recurringState.error}
                </div>
              )}

              {recurringState?.message && (
                <div style={{ background: "color-mix(in srgb, var(--in) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--in) 35%, transparent)",
                  borderRadius: "var(--r-sm)", padding: "10px 14px",
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--in)" }}>
                  ✓ {recurringState.message}
                </div>
              )}

              <button type="submit" disabled={recurringPending} style={{
                width: "100%", height: 48, marginTop: 4, borderRadius: "var(--r-md)", border: "none",
                background: "var(--brand)", color: "#fff",
                fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
                cursor: recurringPending ? "not-allowed" : "pointer", opacity: recurringPending ? 0.7 : 1,
                boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
              }}>
                {recurringPending ? "Scheduling Season Dates…" : "Auto-Schedule Season Dates"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
