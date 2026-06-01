"use client";

export function HeroBanner({ name, memberCount = 0 }: { name: string; memberCount?: number }) {
  return (
    <div style={{ position: "relative", marginBottom: 4 }}>

      {/* ── Main hero panel ── */}
      <div style={{
        position: "relative",
        background: "#060A14",
        overflow: "hidden",
        minHeight: 310,
      }}>

        {/* Player photo — right side, bottom-anchored */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=520&q=85&fit=crop&crop=top"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            right: -10,
            bottom: 0,
            height: "105%",
            width: "62%",
            objectFit: "cover",
            objectPosition: "top center",
            pointerEvents: "none",
          }}
        />

        {/* Hard left-to-right gradient: kills image on left so text reads clean */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(95deg, #060A14 32%, rgba(6,10,20,0.82) 50%, rgba(6,10,20,0.35) 68%, transparent 85%)",
        }}/>

        {/* Top vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(6,10,20,0.7) 0%, transparent 28%)",
        }}/>

        {/* Bottom vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(0deg, #060A14 0%, transparent 30%)",
        }}/>

        {/* Teal + lime diagonal speed strokes */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <svg viewBox="0 0 390 310" preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <polygon points="155,75  390,5  390,38  178,108"  fill="rgba(0,229,255,0.11)"/>
            <polygon points="175,100 390,38 390,56  196,122"  fill="rgba(0,229,255,0.06)"/>
            <polygon points="145,145 390,78 390,106 168,173"  fill="rgba(198,240,60,0.10)"/>
            <polygon points="168,168 390,106 390,122 188,185" fill="rgba(198,240,60,0.05)"/>
          </svg>
        </div>

        {/* Dot grid — top right */}
        <div style={{
          position: "absolute", top: 22, right: 16,
          display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6,
          opacity: 0.20, pointerEvents: "none",
        }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "#00E5FF" }}/>
          ))}
        </div>

        {/* Shuttlecock watermark top-right */}
        <div style={{
          position: "absolute", top: 14, right: "40%",
          opacity: 0.55, pointerEvents: "none",
          animation: "floatShuttle 3s ease-in-out infinite",
        }}>
          <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
            <ellipse cx="14" cy="28" rx="6" ry="5" fill="#F5D28A"/>
            <ellipse cx="14" cy="26" rx="5" ry="3.5" fill="#E8B84B"/>
            <line x1="14" y1="24" x2="5"  y2="5"  stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="14" y1="24" x2="9"  y2="2"  stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="14" y1="24" x2="14" y2="1"  stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="14" y1="24" x2="19" y2="2"  stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            <line x1="14" y1="24" x2="23" y2="5"  stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M5 5 Q9.5 1 14 1 Q18.5 1 23 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none"/>
          </svg>
        </div>

        {/* ── Text block ── */}
        <div style={{ position: "relative", zIndex: 2, padding: "52px 20px 28px", maxWidth: "58%" }}>

          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginBottom: 12,
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10,
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#00E5FF",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="17" rx="5" ry="4"/>
              <line x1="12" y1="13" x2="5"  y2="2"/>
              <line x1="12" y1="13" x2="8"  y2="1"/>
              <line x1="12" y1="13" x2="12" y2="0.5"/>
              <line x1="12" y1="13" x2="16" y2="1"/>
              <line x1="12" y1="13" x2="19" y2="2"/>
            </svg>
            VUB Smashers
          </div>

          {/* Headline */}
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 900,
            lineHeight: 1.0, letterSpacing: "-0.03em",
          }}>
            <div style={{ fontSize: 40, color: "#FFFFFF" }}>Play.</div>
            <div style={{ fontSize: 40, color: "#00E5FF" }}>Train.</div>
            <div style={{ fontSize: 40, color: "#C6F03C" }}>Win.</div>
            <div style={{ fontSize: 34, color: "#FFFFFF", marginTop: 2 }}>Together.</div>
          </div>

          {/* Lime squiggle underline */}
          <div style={{ marginTop: 8 }}>
            <svg width="148" height="9" viewBox="0 0 148 9">
              <path d="M2 6.5 Q37 1.5 74 4.5 Q111 7.5 146 3.5"
                stroke="#C6F03C" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9"/>
            </svg>
          </div>

          {/* Subtitle */}
          <div style={{
            marginTop: 10,
            fontFamily: "var(--font-body)", fontWeight: 400, fontSize: 12.5,
            color: "rgba(255,255,255,0.48)", lineHeight: 1.5,
          }}>
            A community of passion, dedication<br/>and love for badminton.
          </div>

          {/* Personalised chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            marginTop: 14, padding: "6px 12px",
            borderRadius: 999, border: "1px solid rgba(0,229,255,0.25)",
            background: "rgba(0,229,255,0.07)",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 11.5,
            color: "rgba(255,255,255,0.7)",
          }}>
            👋 Hey, {name.split(" ")[0]}!
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr",
        background: "#0B1020",
        borderTop: "1px solid rgba(0,229,255,0.10)",
      }}>
        {[
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="7" r="3.5"/><path d="M3 21a6 6 0 0 1 12 0"/>
                <path d="M16 3.5a3.5 3.5 0 0 1 0 7"/><path d="M21 21a4 4 0 0 0-4.5-4"/>
              </svg>
            ),
            value: `${memberCount || 18}+`, label: "Active Members", color: "#00E5FF",
          },
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6F03C" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 0 0 5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 1 0 5H18"/>
                <path d="M6 9a6 6 0 0 1 12 0v6a6 6 0 0 1-12 0V9z"/><path d="M12 17v4"/><path d="M8 21h8"/>
              </svg>
            ),
            value: "25+", label: "Tournaments", color: "#C6F03C",
          },
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00E5FF" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <ellipse cx="12" cy="18" rx="5" ry="4"/>
                <line x1="12" y1="14" x2="5"  y2="3"/>
                <line x1="12" y1="14" x2="8"  y2="1.5"/>
                <line x1="12" y1="14" x2="12" y2="1"/>
                <line x1="12" y1="14" x2="16" y2="1.5"/>
                <line x1="12" y1="14" x2="19" y2="3"/>
                <path d="M5 3 Q8.5 0 12 0.5 Q15.5 0 19 3" stroke="#00E5FF" strokeWidth="1.2" fill="none"/>
              </svg>
            ),
            value: "Weekly", label: "Training Sessions", color: "#00E5FF",
          },
          {
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C6F03C" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="17" rx="2"/>
                <path d="M3 9h18M8 2v4M16 2v4M7 14h2M11 14h2M15 14h2M7 18h2M11 18h2"/>
              </svg>
            ),
            value: "Fun. Fitness.", label: "Friendship.", color: "#C6F03C",
          },
        ].map((s, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "11px 4px",
            borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
          }}>
            <div style={{ marginBottom: 4, lineHeight: 1 }}>{s.icon}</div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13,
              color: s.color, lineHeight: 1, textAlign: "center",
            }}>{s.value}</div>
            <div style={{
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 9,
              color: "rgba(255,255,255,0.38)", marginTop: 3, textAlign: "center",
              letterSpacing: "0.03em", lineHeight: 1.3,
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes floatShuttle {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50%       { transform: translateY(-7px) rotate(5deg); }
        }
      `}</style>
    </div>
  );
}
