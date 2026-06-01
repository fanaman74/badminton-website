"use client";

export function HeroBanner({ name, memberCount = 0 }: { name: string; memberCount?: number }) {
  return (
    <div style={{ position: "relative", marginBottom: 4 }}>
      {/* Main hero panel */}
      <div style={{
        position: "relative",
        background: "#080D1A",
        overflow: "hidden",
        padding: "56px 22px 24px",
        minHeight: 240,
      }}>

        {/* Speed lines — diagonal brush strokes */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <svg viewBox="0 0 390 260" preserveAspectRatio="none"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            {/* Teal brush strokes */}
            <polygon points="220,80 390,30 390,60 240,110" fill="rgba(0,229,255,0.12)"/>
            <polygon points="260,100 390,55 390,72 278,118" fill="rgba(0,229,255,0.07)"/>
            {/* Lime brush strokes */}
            <polygon points="200,140 390,90 390,115 218,165" fill="rgba(198,240,60,0.13)"/>
            <polygon points="240,160 390,115 390,128 255,175" fill="rgba(198,240,60,0.07)"/>
            {/* Faint white speed lines */}
            <line x1="180" y1="200" x2="390" y2="140" stroke="rgba(255,255,255,0.04)" strokeWidth="2"/>
            <line x1="200" y1="215" x2="390" y2="160" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5"/>
          </svg>
        </div>

        {/* Dot grid accent (top right) */}
        <div style={{ position: "absolute", top: 20, right: 18, pointerEvents: "none", opacity: 0.18 }}>
          {[0,1,2,3].map(row => (
            <div key={row} style={{ display: "flex", gap: 7, marginBottom: 7 }}>
              {[0,1,2,3,4].map(col => (
                <div key={col} style={{ width: 3, height: 3, borderRadius: "50%", background: "#00E5FF" }}/>
              ))}
            </div>
          ))}
        </div>

        {/* Glow behind text */}
        <div style={{
          position: "absolute", left: -40, top: 40,
          width: 280, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}/>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            lineHeight: 1.0,
            letterSpacing: "-0.03em",
          }}>
            <div style={{ fontSize: 42, color: "#FFFFFF" }}>Play.</div>
            <div style={{ fontSize: 42, color: "#00E5FF" }}>Train.</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 42, color: "#C6F03C" }}>Win.</span>
              <span style={{ fontSize: 38, color: "#FFFFFF" }}>Together.</span>
            </div>
          </div>

          {/* Lime underline brush stroke */}
          <div style={{ marginTop: 4, marginLeft: 2 }}>
            <svg width="160" height="10" viewBox="0 0 160 10">
              <path d="M2 7 Q40 2 80 5 Q120 8 158 4" stroke="#C6F03C" strokeWidth="3.5"
                fill="none" strokeLinecap="round" opacity="0.85"/>
            </svg>
          </div>

          <div style={{
            marginTop: 10,
            fontFamily: "var(--font-body)", fontWeight: 500, fontSize: 13,
            color: "rgba(255,255,255,0.5)", lineHeight: 1.5,
          }}>
            Hey {name.split(" ")[0]} 👋 — ready to smash?
          </div>
        </div>

        {/* Animated shuttlecock + racket */}
        <div style={{
          position: "absolute", right: 16, bottom: 16,
          width: 90, height: 100, zIndex: 2,
        }}>
          {/* Shuttlecock */}
          <div style={{
            position: "absolute",
            animation: "shuttleArc 1.5s cubic-bezier(0.25,0.46,0.45,0.94) infinite",
            transformOrigin: "center",
          }}>
            <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
              <ellipse cx="10" cy="21" rx="4.5" ry="3.5" fill="#F5D28A"/>
              <ellipse cx="10" cy="19.5" rx="3.5" ry="2.5" fill="#E8B84B"/>
              <line x1="10" y1="18" x2="4" y2="4" stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="10" y1="18" x2="7" y2="2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="10" y1="18" x2="10" y2="1" stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="10" y1="18" x2="13" y2="2" stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" strokeLinecap="round"/>
              <line x1="10" y1="18" x2="16" y2="4" stroke="rgba(255,255,255,0.8)" strokeWidth="1.1" strokeLinecap="round"/>
              <path d="M4 4 Q7 1 10 1 Q13 1 16 4" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"/>
            </svg>
          </div>
          {/* Racket */}
          <div style={{
            position: "absolute", bottom: 0, right: 0,
            animation: "racketSwing 1.5s cubic-bezier(0.25,0.46,0.45,0.94) infinite",
            transformOrigin: "80% 90%",
          }}>
            <svg width="68" height="86" viewBox="0 0 68 86" fill="none">
              <rect x="28" y="55" width="9" height="30" rx="4.5" fill="#8B6914"/>
              <rect x="30" y="59" width="5" height="4" rx="2" fill="#A07820"/>
              <rect x="30" y="65" width="5" height="4" rx="2" fill="#A07820"/>
              <path d="M28 55 L22 40 M37 55 L43 40" stroke="#CC8800" strokeWidth="3" strokeLinecap="round"/>
              <ellipse cx="33" cy="26" rx="20" ry="25" fill="none" stroke="#00E5FF" strokeWidth="3.5"/>
              <line x1="20" y1="6" x2="20" y2="46" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="25" y1="2" x2="25" y2="50" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="30" y1="1" x2="30" y2="51" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="35" y1="1" x2="35" y2="51" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="40" y1="2" x2="40" y2="50" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="45" y1="6" x2="45" y2="46" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="13" y1="14" x2="53" y2="14" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="13" y1="20" x2="53" y2="20" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="13" y1="26" x2="53" y2="26" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="13" y1="32" x2="53" y2="32" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="14" y1="38" x2="52" y2="38" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
              <line x1="15" y1="44" x2="51" y2="44" stroke="rgba(198,240,60,0.65)" strokeWidth="1"/>
            </svg>
          </div>
          {/* Impact flash */}
          <div style={{
            position: "absolute", top: 12, right: 16,
            width: 26, height: 26, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,229,255,0.95) 0%, rgba(198,240,60,0.5) 50%, transparent 75%)",
            animation: "impactFlash 1.5s ease-out infinite",
            pointerEvents: "none",
          }}/>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        background: "#0F1628",
        borderTop: "1px solid rgba(0,229,255,0.12)",
      }}>
        {[
          { icon: "👥", value: `${memberCount || "18"}+`, label: "Members" },
          { icon: "🏆", value: "Weekly", label: "Sessions" },
          { icon: "🏸", value: "4v4", label: "Per Court" },
          { icon: "⚡", value: "Fun.", label: "Guaranteed" },
        ].map((s, i) => (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "12px 6px",
            borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}>
            <div style={{ fontSize: 16, marginBottom: 3 }}>{s.icon}</div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
              color: i % 2 === 0 ? "#00E5FF" : "#C6F03C",
              lineHeight: 1,
            }}>{s.value}</div>
            <div style={{
              fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 10,
              color: "rgba(255,255,255,0.4)", marginTop: 3, textAlign: "center",
              letterSpacing: "0.04em",
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes shuttleArc {
          0%   { transform: translate(58px,58px) rotate(180deg) scale(0.7); opacity: 0; }
          8%   { opacity: 1; }
          30%  { transform: translate(18px,-8px) rotate(140deg) scale(1); opacity: 1; }
          60%  { transform: translate(-8px,28px) rotate(90deg) scale(0.9); opacity: 0.9; }
          85%  { transform: translate(28px,66px) rotate(40deg) scale(0.75); opacity: 0.4; }
          100% { transform: translate(58px,58px) rotate(180deg) scale(0.7); opacity: 0; }
        }
        @keyframes racketSwing {
          0%   { transform: rotate(18deg); }
          12%  { transform: rotate(-24deg); }
          30%  { transform: rotate(5deg); }
          100% { transform: rotate(18deg); }
        }
        @keyframes impactFlash {
          0%   { opacity: 0; transform: scale(0.3); }
          10%  { opacity: 1; transform: scale(1.3); }
          22%  { opacity: 0; transform: scale(0.6); }
          100% { opacity: 0; transform: scale(0.3); }
        }
      `}</style>
    </div>
  );
}
