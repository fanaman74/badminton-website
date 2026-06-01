"use client";

export function HeroBanner({ name }: { name: string }) {
  return (
    <div style={{
      position: "relative",
      margin: "0 0 4px",
      borderRadius: "0 0 var(--r-lg) var(--r-lg)",
      background: "var(--ink)",
      overflow: "hidden",
      padding: "52px 22px 28px",
      minHeight: 170,
    }}>
      {/* Animated glow blobs */}
      <div style={{
        position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute", width: 260, height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,90,31,0.35) 0%, transparent 70%)",
          top: -80, right: -60,
          animation: "blobPulse 4s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 200, height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(198,240,60,0.2) 0%, transparent 70%)",
          bottom: -60, left: -40,
          animation: "blobPulse 5s ease-in-out 1.2s infinite",
        }} />
      </div>

      {/* Court line decoration */}
      <div style={{
        position: "absolute", right: 16, bottom: 0, top: 0,
        width: 140, opacity: 0.06, pointerEvents: "none",
        display: "flex", alignItems: "stretch",
      }}>
        <svg viewBox="0 0 140 170" preserveAspectRatio="none" width="140" height="100%">
          <rect x="4" y="4" width="132" height="162" rx="4" fill="none" stroke="white" strokeWidth="2.5"/>
          <line x1="4" y1="85" x2="136" y2="85" stroke="white" strokeWidth="1.5"/>
          <line x1="70" y1="4" x2="70" y2="85" stroke="white" strokeWidth="1"/>
          <line x1="70" y1="85" x2="70" y2="166" stroke="white" strokeWidth="1"/>
        </svg>
      </div>

      {/* Text content */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{
          fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 10.5,
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "var(--accent)", marginBottom: 6,
        }}>
          VUB Smashers
        </div>
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30,
          letterSpacing: "-0.025em", lineHeight: 1, color: "#F1EFE6",
        }}>
          Hey, {name.split(" ")[0]} 👋
        </div>
        <div style={{
          marginTop: 8,
          fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
          color: "rgba(241,239,230,0.55)",
        }}>
          Ready to smash some shuttles?
        </div>
      </div>

      {/* Animated racket + shuttlecock */}
      <div style={{
        position: "absolute",
        right: 22, bottom: 14,
        width: 100, height: 100,
        zIndex: 2,
      }}>
        {/* Shuttlecock — arcs up then falls */}
        <div style={{
          position: "absolute",
          animation: "shuttleArc 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
          transformOrigin: "center",
          zIndex: 3,
        }}>
          <svg width="22" height="28" viewBox="0 0 22 28" fill="none">
            {/* Cork base */}
            <ellipse cx="11" cy="23" rx="5" ry="4" fill="#F5D28A"/>
            <ellipse cx="11" cy="21" rx="4" ry="3" fill="#E8B84B"/>
            {/* Feathers */}
            <line x1="11" y1="20" x2="4" y2="4" stroke="rgba(241,239,230,0.85)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="11" y1="20" x2="7" y2="2" stroke="rgba(241,239,230,0.85)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="11" y1="20" x2="11" y2="1" stroke="rgba(241,239,230,0.85)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="11" y1="20" x2="15" y2="2" stroke="rgba(241,239,230,0.85)" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="11" y1="20" x2="18" y2="4" stroke="rgba(241,239,230,0.85)" strokeWidth="1.2" strokeLinecap="round"/>
            {/* Feather tips arc */}
            <path d="M4 4 Q7.5 0.5 11 1 Q14.5 0.5 18 4" stroke="rgba(241,239,230,0.5)" strokeWidth="1" fill="none"/>
          </svg>
        </div>

        {/* Racket — swings up on impact */}
        <div style={{
          position: "absolute",
          bottom: 0, right: 0,
          animation: "racketSwing 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite",
          transformOrigin: "80% 90%",
        }}>
          <svg width="72" height="90" viewBox="0 0 72 90" fill="none">
            {/* Handle */}
            <rect x="30" y="58" width="10" height="32" rx="5" fill="#8B6914"/>
            <rect x="32" y="62" width="6" height="4" rx="2" fill="#A07820"/>
            <rect x="32" y="68" width="6" height="4" rx="2" fill="#A07820"/>
            <rect x="32" y="74" width="6" height="4" rx="2" fill="#A07820"/>
            {/* Throat */}
            <path d="M30 58 L24 42 M40 58 L46 42" stroke="#CC8800" strokeWidth="3.5" strokeLinecap="round"/>
            {/* Frame */}
            <ellipse cx="35" cy="28" rx="22" ry="27" fill="none" stroke="#FF5A1F" strokeWidth="4"/>
            {/* Strings vertical */}
            <line x1="22" y1="6" x2="22" y2="50" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="27" y1="2" x2="27" y2="54" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="32" y1="1" x2="32" y2="55" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="37" y1="1" x2="37" y2="55" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="42" y1="2" x2="42" y2="54" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="47" y1="6" x2="47" y2="50" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            {/* Strings horizontal */}
            <line x1="13" y1="14" x2="57" y2="14" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="13" y1="20" x2="57" y2="20" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="13" y1="26" x2="57" y2="26" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="13" y1="32" x2="57" y2="32" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="13" y1="38" x2="57" y2="38" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
            <line x1="14" y1="44" x2="56" y2="44" stroke="rgba(198,240,60,0.7)" strokeWidth="1"/>
          </svg>
        </div>

        {/* Impact flash */}
        <div style={{
          position: "absolute",
          top: 14, right: 18,
          width: 28, height: 28,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,90,31,0.6) 50%, transparent 75%)",
          animation: "impactFlash 1.4s ease-out infinite",
          pointerEvents: "none",
        }} />
      </div>

      <style>{`
        @keyframes shuttleArc {
          0%   { transform: translate(62px, 62px) rotate(180deg) scale(0.7); opacity: 0; }
          8%   { opacity: 1; }
          30%  { transform: translate(20px, -10px) rotate(140deg) scale(1); opacity: 1; }
          60%  { transform: translate(-10px, 30px) rotate(90deg) scale(0.9); opacity: 0.9; }
          85%  { transform: translate(30px, 70px) rotate(40deg) scale(0.75); opacity: 0.4; }
          100% { transform: translate(62px, 62px) rotate(180deg) scale(0.7); opacity: 0; }
        }
        @keyframes racketSwing {
          0%   { transform: rotate(18deg); }
          12%  { transform: rotate(-22deg); }
          30%  { transform: rotate(5deg); }
          100% { transform: rotate(18deg); }
        }
        @keyframes impactFlash {
          0%   { opacity: 0; transform: scale(0.3); }
          10%  { opacity: 1; transform: scale(1.2); }
          22%  { opacity: 0; transform: scale(0.6); }
          100% { opacity: 0; transform: scale(0.3); }
        }
        @keyframes blobPulse {
          0%, 100% { transform: scale(1) translateY(0); opacity: 1; }
          50%       { transform: scale(1.12) translateY(-8px); opacity: 0.75; }
        }
      `}</style>
    </div>
  );
}
