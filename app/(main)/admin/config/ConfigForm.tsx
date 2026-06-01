"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveTeamConfigAction, createNextSessionAction } from "@/lib/actions/config";

const DAYS = [
  { value: 0, label: "Monday" },
  { value: 1, label: "Tuesday" },
  { value: 2, label: "Wednesday" },
  { value: 3, label: "Thursday" },
  { value: 4, label: "Friday" },
  { value: 5, label: "Saturday" },
  { value: 6, label: "Sunday" },
];

interface Config {
  day_of_week: number;
  courts: number;
  start_time: string;
  location_name: string;
  location_maps_url: string | null;
}

export function ConfigForm({ config }: { config: Config | null }) {
  const router = useRouter();
  const [saveState, saveAction, isSaving] = useActionState(saveTeamConfigAction, undefined);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ error?: string; ok?: string } | null>(null);

  async function handleCreateNext() {
    setCreating(true);
    setCreateMsg(null);
    const result = await createNextSessionAction();
    if (result.error) {
      setCreateMsg({ error: result.error });
    } else {
      setCreateMsg({ ok: "Session created!" });
      setTimeout(() => router.push(`/sessions/${result.id}`), 800);
    }
    setCreating(false);
  }

  const defaults = config ?? { day_of_week: 3, courts: 3, start_time: "20:00", location_name: "", location_maps_url: null };

  // Compute next date label
  const nextDate = (() => {
    const jsDay = (defaults.day_of_week + 1) % 7;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayJs = today.getDay();
    let daysAhead = (jsDay - todayJs + 7) % 7;
    if (daysAhead === 0) daysAhead = 7;
    const d = new Date(today); d.setDate(today.getDate() + daysAhead);
    return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  })();

  const input = {
    width: "100%", borderRadius: "var(--r-sm)", border: "1.5px solid var(--line)",
    padding: "11px 13px", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 15,
    color: "var(--ink)", background: "var(--surface-2)", outline: "none",
  } as React.CSSProperties;

  const label = {
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
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7"/>
          </svg>
        </Link>
        <div>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11, letterSpacing: "0.14em",
            textTransform: "uppercase", color: "var(--brand)", marginBottom: 3 }}>Admin</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26,
            lineHeight: 1, letterSpacing: "-0.02em", color: "var(--ink)" }}>Court Config</div>
        </div>
      </div>

      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Create next session card */}
        <div style={{
          background: "var(--ink)", borderRadius: "var(--r-lg)", padding: "18px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11,
              letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", marginBottom: 4 }}>
              Next session
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
              color: "var(--bg)", lineHeight: 1.2 }}>{nextDate}</div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
              color: "rgba(241,239,230,0.6)", marginTop: 3 }}>
              {defaults.courts} court{defaults.courts > 1 ? "s" : ""} · {defaults.start_time} · {defaults.location_name || "No location set"}
            </div>
          </div>
          <button
            onClick={handleCreateNext}
            disabled={creating || !defaults.location_name}
            style={{
              flexShrink: 0, height: 42, padding: "0 16px", borderRadius: "var(--r-md)", border: "none",
              background: "var(--accent)", color: "var(--accent-ink)",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 14,
              cursor: creating || !defaults.location_name ? "not-allowed" : "pointer",
              opacity: creating || !defaults.location_name ? 0.5 : 1,
              whiteSpace: "nowrap",
            }}>
            {creating ? "…" : "Create →"}
          </button>
        </div>

        {createMsg?.error && (
          <div style={{ background: "color-mix(in srgb, var(--out) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
            borderRadius: "var(--r-sm)", padding: "10px 14px",
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--out)" }}>
            {createMsg.error}
          </div>
        )}
        {createMsg?.ok && (
          <div style={{ background: "color-mix(in srgb, var(--in) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--in) 30%, transparent)",
            borderRadius: "var(--r-sm)", padding: "10px 14px",
            fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--in)" }}>
            ✓ {createMsg.ok} Redirecting…
          </div>
        )}

        {/* Config form */}
        <div style={{
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: 20,
          border: "1px solid var(--line)",
          boxShadow: "0 1px 2px rgba(20,18,12,.04), 0 8px 22px -16px rgba(20,18,12,.20)",
        }}>
          <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
            letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--faint)", marginBottom: 16 }}>
            Default weekly schedule
          </div>

          <form action={saveAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Day + Courts */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label htmlFor="day_of_week" style={label}>Day of week</label>
                <select id="day_of_week" name="day_of_week" defaultValue={defaults.day_of_week} style={{ ...input, appearance: "none" }}>
                  {DAYS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="courts" style={label}>Courts</label>
                <select id="courts" name="courts" defaultValue={defaults.courts} style={{ ...input, appearance: "none" }}>
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} court{n > 1 ? "s" : ""} · {n * 4} max</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time */}
            <div>
              <label htmlFor="start_time" style={label}>Start time</label>
              <input id="start_time" name="start_time" type="time" defaultValue={defaults.start_time} required style={input} />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location_name" style={label}>Default location</label>
              <input id="location_name" name="location_name" type="text"
                defaultValue={defaults.location_name}
                placeholder="e.g. Eastside Sports Hall"
                style={input} />
            </div>

            <div>
              <label htmlFor="location_maps_url" style={label}>
                Google Maps link <span style={{ fontWeight: 500, color: "var(--faint)" }}>(optional)</span>
              </label>
              <input id="location_maps_url" name="location_maps_url" type="url"
                defaultValue={defaults.location_maps_url ?? ""}
                placeholder="https://maps.google.com/…"
                style={input} />
            </div>

            {saveState?.error && (
              <div style={{ background: "color-mix(in srgb, var(--out) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--out) 30%, transparent)",
                borderRadius: "var(--r-sm)", padding: "10px 14px",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--out)" }}>
                {saveState.error}
              </div>
            )}
            {saveState?.success && (
              <div style={{ background: "color-mix(in srgb, var(--in) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--in) 30%, transparent)",
                borderRadius: "var(--r-sm)", padding: "10px 14px",
                fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13, color: "var(--in)" }}>
                ✓ Configuration saved
              </div>
            )}

            <button type="submit" disabled={isSaving} style={{
              width: "100%", height: 48, borderRadius: "var(--r-md)", border: "none",
              background: "var(--brand)", color: "#fff",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 16,
              cursor: isSaving ? "not-allowed" : "pointer", opacity: isSaving ? 0.7 : 1,
              boxShadow: "0 6px 18px -6px color-mix(in srgb, var(--brand) 60%, transparent)",
            }}>
              {isSaving ? "Saving…" : "Save configuration"}
            </button>
          </form>
        </div>

        {/* Quick link to create custom session */}
        <Link href="/admin/sessions/new" style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "var(--surface)", borderRadius: "var(--r-lg)", padding: "14px 16px",
          border: "1px solid var(--line)", textDecoration: "none",
          boxShadow: "0 1px 2px rgba(20,18,12,.04)",
        }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, color: "var(--ink)" }}>
            Create custom session
          </span>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>
    </div>
  );
}
