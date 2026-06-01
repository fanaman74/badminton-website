import type { Session } from "@/types/database";

interface Props {
  session: Pick<Session, "courts_booked" | "max_capacity">;
  confirmedCount: number;
  compact?: boolean;
}

export function CourtMeter({ session, confirmedCount, compact }: Props) {
  const courts = session.courts_booked;
  const cw = compact ? 38 : 52;
  const ch = compact ? 30 : 40;

  return (
    <div style={{ display: "flex", gap: compact ? 6 : 9, flexWrap: "wrap" }}>
      {Array.from({ length: courts }).map((_, ci) => {
        const start = ci * 4;
        const filled = Math.max(0, Math.min(4, confirmedCount - start));
        const active = filled > 0;
        return (
          <div key={ci} style={{
            width: cw, height: ch, borderRadius: compact ? 5 : 7,
            position: "relative",
            background: active
              ? "color-mix(in srgb, var(--accent) 24%, var(--surface))"
              : "var(--surface-2)",
            border: `1.5px solid ${active
              ? "color-mix(in srgb, var(--accent) 60%, var(--line))"
              : "var(--line)"}`,
            boxSizing: "border-box",
            transition: "all .35s ease",
          }}>
            {/* net line */}
            <div style={{
              position: "absolute", left: "50%", top: 3, bottom: 3, width: 0,
              borderLeft: `1.5px dashed ${active
                ? "color-mix(in srgb, var(--accent-ink) 35%, transparent)"
                : "var(--line)"}`,
            }} />
            {/* 4 player dots */}
            {[0, 1, 2, 3].map((di) => {
              const on = di < filled;
              const left = di < 2 ? "27%" : "73%";
              const top = di % 2 === 0 ? "32%" : "68%";
              const d = compact ? 6 : 8;
              return (
                <div key={di} style={{
                  position: "absolute", left, top,
                  width: d, height: d, borderRadius: "50%",
                  transform: "translate(-50%,-50%)",
                  transition: "all .35s ease",
                  background: on ? "var(--brand)" : "transparent",
                  border: on ? "none" : "1.5px solid var(--line)",
                }} />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
