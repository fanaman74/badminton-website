"use client";

export function HeroBanner({ name }: { name: string }) {
  return (
    <div style={{ position: "relative", marginBottom: 4 }}>
      <style>{`
        .hero-panel-responsive {
          position: relative;
          overflow: hidden;
          height: 65vh;
        }
        @media (min-width: 768px) {
          .hero-panel-responsive {
            height: 100vh;
          }
        }
        .hero-text-block {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 2;
          padding: 32px 24px;
          width: 100%;
          box-sizing: border-box;
        }
        @media (min-width: 768px) {
          .hero-text-block {
            padding: 48px 80px;
            max-width: 60%;
          }
        }
        @media (min-width: 1200px) {
          .hero-text-block {
            padding: 48px 140px;
            max-width: 50%;
          }
        }
        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C6F03C;
        }
        @media (min-width: 768px) {
          .hero-eyebrow {
            font-size: 13px;
            margin-bottom: 20px;
          }
        }
        .hero-title-main {
          font-size: 56px;
        }
        .hero-title-sub {
          font-size: 46px;
        }
        @media (min-width: 768px) {
          .hero-title-main {
            font-size: 88px;
          }
          .hero-title-sub {
            font-size: 72px;
          }
        }
        .hero-squiggle {
          width: 160px;
          height: 10px;
          margin-top: 8px;
        }
        @media (min-width: 768px) {
          .hero-squiggle {
            width: 280px;
            height: 16px;
            margin-top: 14px;
          }
        }
        .hero-subtitle {
          margin-top: 14px;
          font-family: var(--font-body);
          font-weight: 400;
          font-size: 14px;
          color: rgba(255,255,255,0.55);
          line-height: 1.5;
        }
        @media (min-width: 768px) {
          .hero-subtitle {
            font-size: 18px;
            margin-top: 24px;
            max-width: 480px;
          }
        }
        .hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 18px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid rgba(198,240,60,0.3);
          background: rgba(198,240,60,0.08);
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 12px;
          color: rgba(255,255,255,0.75);
        }
        @media (min-width: 768px) {
          .hero-chip {
            font-size: 15px;
            margin-top: 28px;
            padding: 8px 18px;
          }
        }
      `}</style>

      {/* ── Main hero panel ── */}
      <div className="hero-panel-responsive">

        {/* Full-bleed background photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-player.png"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            pointerEvents: "none",
          }}
        />

        {/* Dark overlay — heavy on left where text sits, lighter on right */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(100deg, rgba(4,8,20,0.92) 0%, rgba(4,8,20,0.75) 40%, rgba(4,8,20,0.25) 70%, rgba(4,8,20,0.10) 100%)",
        }}/>

        {/* Top fade */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(4,8,20,0.65) 0%, transparent 25%)",
        }}/>

        {/* ── Text block ── */}
        <div className="hero-text-block">

          {/* Eyebrow */}
          <div className="hero-eyebrow">
            🏸 VUB Smashers
          </div>

          {/* Headline */}
          <div style={{
            fontFamily: "var(--font-display)", fontWeight: 900,
            lineHeight: 1.0, letterSpacing: "-0.03em",
          }}>
            <div className="hero-title-main" style={{ color: "#FFFFFF" }}>Play.</div>
            <div className="hero-title-main" style={{ color: "#00E5FF" }}>Train.</div>
            <div className="hero-title-main" style={{ color: "#C6F03C" }}>Win.</div>
            <div className="hero-title-sub" style={{ color: "#FFFFFF", marginTop: 4 }}>Together.</div>
          </div>

          {/* Lime squiggle underline */}
          <div className="hero-squiggle">
            <svg viewBox="0 0 152 9" width="100%" height="100%">
              <path d="M2 6.5 Q38 1.5 76 4.5 Q114 7.5 150 3.5"
                stroke="#C6F03C" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.9"/>
            </svg>
          </div>

          {/* Subtitle */}
          <div className="hero-subtitle">
            A community of passion, dedication and love for badminton.
          </div>

          {/* Personalised chip */}
          <div className="hero-chip">
            👋 Hey, {name.split(" ")[0]}!
          </div>
        </div>
      </div>

    </div>
  );
}
