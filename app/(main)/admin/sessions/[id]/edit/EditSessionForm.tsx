"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updateSessionAction } from "@/lib/actions/sessions";
import type { Session } from "@/types/database";

export function EditSessionForm({ session }: { session: Session }) {
  const updateWithId = updateSessionAction.bind(null, session.id);
  const [state, action, pending] = useActionState(updateWithId, undefined);

  const dateObj = new Date(session.date);
  const defaultDate = dateObj.toISOString().split("T")[0];
  const defaultTime = dateObj.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
  const defaultLoc = session.location_name;
  const defaultMaps = session.location_maps_url ?? "";
  const defaultCourts = session.courts_booked;

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
        <Link href={`/sessions/${session.id}`} style={{
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
            lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>Edit Session</div>
        </div>
      </div>

      <div style={{ padding: "0 20px" }}>
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 20,
          border: "1px solid var(--line)",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.20)",
        }}>
          <form action={action} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
                placeholder="e.g. Eastside Sports Hall"
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

            {state?.error && (
              <div style={{ background: "color-mix(in srgb, var(--out) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                borderRadius: "var(--r-sm)", padding: "10px 14px",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--out)" }}>
                {state.error}
              </div>
            )}
            {state?.success && (
              <div style={{ background: "color-mix(in srgb, var(--in) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--in) 30%, transparent)",
                borderRadius: "var(--r-sm)", padding: "10px 14px",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--in)" }}>
                ✓ Session updated successfully!
              </div>
            )}

            <button type="submit" disabled={pending} style={{
              width: "100%", height: 48, marginTop: 4, borderRadius: "var(--r-md)", border: "none",
              background: "var(--brand)", color: "#fff",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
              cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.7 : 1,
              boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
            }}>
              {pending ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
