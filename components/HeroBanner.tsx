"use client";

import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";

function ShuttlecockIcon({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width={32}
      height={32}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        transform: flip ? "scaleX(-1) rotate(12deg)" : "rotate(-12deg)",
        opacity: 0.95,
        flexShrink: 0,
        color: "#C6F03C",
      }}
      aria-hidden="true"
    >
      {/* Cork base */}
      <path d="M24 48 C24 58, 40 58, 40 48 Z" fill="currentColor" opacity={0.25} />
      <path d="M24 48 C24 58, 40 58, 40 48 Z" stroke="#C6F03C" />
      {/* Feathers */}
      <path d="M26 48 L14 16" stroke="#FFFFFF" />
      <path d="M30 48 L25 12" stroke="#FFFFFF" />
      <path d="M34 48 L39 12" stroke="#FFFFFF" />
      <path d="M38 48 L50 16" stroke="#FFFFFF" />
      {/* Feather bands */}
      <path d="M19 25 Q32 30 45 25" stroke="#00E5FF" />
      <path d="M22 37 Q32 42 42 37" stroke="#00E5FF" />
    </svg>
  );
}

export function HeroBanner({
  name,
  memberCount = 0,
  isGuest = false,
}: {
  name: string;
  memberCount?: number;
  isGuest?: boolean;
}) {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <div style={{ position: "relative", marginBottom: 4 }}>
        <style>{`
          .hero-panel-responsive {
            position: relative;
            overflow: hidden;
            min-height: 640px;
          }
          @media (min-width: 768px) {
            .hero-panel-responsive {
              min-height: 820px;
            }
          }
          .hero-text-block {
            position: relative;
            z-index: 2;
            padding: 32px 20px 44px;
            width: 100%;
            box-sizing: border-box;
          }
          @media (min-width: 768px) {
            .hero-text-block {
              padding: 56px 64px 64px;
              max-width: 660px;
            }
          }
          @media (min-width: 1200px) {
            .hero-text-block {
              padding: 64px 96px 72px;
              max-width: 720px;
            }
          }
          .hero-eyebrow {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 12px;
            font-family: var(--font-body);
            font-weight: 700;
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #C6F03C;
          }
          @media (min-width: 768px) {
            .hero-eyebrow {
              font-size: 13px;
              margin-bottom: 16px;
            }
          }
          .hero-title-main {
            font-size: 46px;
          }
          .hero-title-sub {
            font-size: 38px;
          }
          @media (min-width: 768px) {
            .hero-title-main {
              font-size: 72px;
            }
            .hero-title-sub {
              font-size: 60px;
            }
          }
          .hero-squiggle {
            width: 160px;
            height: 10px;
            margin-top: 8px;
          }
          @media (min-width: 768px) {
            .hero-squiggle {
              width: 260px;
              height: 14px;
              margin-top: 12px;
            }
          }
          .hero-subtitle {
            margin-top: 12px;
            font-family: var(--font-body);
            font-weight: 400;
            font-size: 14px;
            color: rgba(255,255,255,0.65);
            line-height: 1.5;
          }
          @media (min-width: 768px) {
            .hero-subtitle {
              font-size: 16px;
              margin-top: 16px;
              max-width: 480px;
            }
          }
          .hero-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 16px;
            padding: 6px 14px;
            border-radius: 999px;
            border: 1px solid rgba(198,240,60,0.3);
            background: rgba(198,240,60,0.08);
            font-family: var(--font-body);
            font-weight: 700;
            font-size: 12px;
            color: rgba(255,255,255,0.85);
          }
          @media (min-width: 768px) {
            .hero-chip {
              font-size: 14px;
              margin-top: 20px;
              padding: 8px 16px;
            }
          }
          .hero-cta-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
            padding: 10px 22px;
            border-radius: 999px;
            border: none;
            background: #C6F03C;
            color: #060C1C;
            font-family: var(--font-display);
            font-weight: 900;
            font-size: 14px;
            letter-spacing: 0.02em;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(198,240,60,0.4);
            transition: all 0.18s ease;
          }
          .hero-cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(198,240,60,0.6);
          }
          .hero-members-card {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 14px;
            width: fit-content;
            padding: 10px 16px;
            border-radius: 10px;
            border: 1px solid rgba(198,240,60,0.20);
            background: rgba(6,12,28,0.60);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          @media (min-width: 768px) {
            .hero-members-card {
              margin-top: 18px;
              padding: 12px 20px;
            }
          }

          /* ── Poster Info Card ── */
          .hero-poster-card {
            margin-top: 22px;
            background: rgba(6, 12, 28, 0.78);
            border: 1px solid rgba(0, 229, 255, 0.35);
            border-radius: 18px;
            padding: 20px 22px;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 24px rgba(0, 229, 255, 0.12);
            max-width: 520px;
          }
          @media (min-width: 768px) {
            .hero-poster-card {
              margin-top: 26px;
              padding: 24px 28px;
            }
          }
          .hero-poster-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            padding-bottom: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.10);
            margin-bottom: 14px;
          }
          .hero-poster-title {
            font-family: var(--font-display);
            font-weight: 900;
            font-size: 20px;
            letter-spacing: -0.02em;
            color: #FFFFFF;
            text-align: center;
            flex: 1;
          }
          @media (min-width: 768px) {
            .hero-poster-title {
              font-size: 23px;
            }
          }
          .hero-poster-items {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 16px;
          }
          .hero-poster-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: var(--font-display);
            font-weight: 800;
            font-size: 15px;
            color: #00E5FF;
            letter-spacing: -0.01em;
          }
          @media (min-width: 768px) {
            .hero-poster-row {
              font-size: 17px;
            }
          }
          .hero-poster-tagline {
            font-family: var(--font-body);
            font-weight: 700;
            font-size: 13.5px;
            color: #C6F03C;
            margin-top: 12px;
            line-height: 1.4;
          }
          .hero-poster-contact {
            margin-top: 8px;
            font-family: var(--font-body);
            font-size: 13px;
            color: rgba(255, 255, 255, 0.75);
            line-height: 1.5;
          }
          .hero-poster-contact a {
            color: #FFFFFF;
            font-weight: 700;
            text-decoration: underline;
            text-underline-offset: 3px;
            transition: color 0.15s ease;
          }
          .hero-poster-contact a:hover {
            color: #00E5FF;
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(100deg, rgba(4,8,20,0.94) 0%, rgba(4,8,20,0.82) 45%, rgba(4,8,20,0.35) 75%, rgba(4,8,20,0.15) 100%)",
            }}
          />

          {/* Top fade */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(180deg, rgba(4,8,20,0.65) 0%, transparent 25%)",
            }}
          />

          {/* ── Text block ── */}
          <div className="hero-text-block">
            {/* Eyebrow */}
            <div className="hero-eyebrow">🏸 VUB Smashers</div>

            {/* Headline */}
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
              }}
            >
              <div className="hero-title-main" style={{ color: "#FFFFFF" }}>
                Play.
              </div>
              <div className="hero-title-main" style={{ color: "#00E5FF" }}>
                Train.
              </div>
              <div className="hero-title-main" style={{ color: "#C6F03C" }}>
                Win.
              </div>
              <div
                className="hero-title-sub"
                style={{ color: "#FFFFFF", marginTop: 4 }}
              >
                Together.
              </div>
            </div>

            {/* Lime squiggle underline */}
            <div className="hero-squiggle">
              <svg viewBox="0 0 152 9" width="100%" height="100%">
                <path
                  d="M2 6.5 Q38 1.5 76 4.5 Q114 7.5 150 3.5"
                  stroke="#C6F03C"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.9"
                />
              </svg>
            </div>

            {/* Subtitle */}
            <div className="hero-subtitle">
              A community of passion, dedication and love for badminton.
            </div>

            {/* ── Poster schedule & invitation card ── */}
            <div className="hero-poster-card">
              <div className="hero-poster-header">
                <ShuttlecockIcon />
                <h3 className="hero-poster-title">Come and play badminton!</h3>
                <ShuttlecockIcon flip />
              </div>

              <div className="hero-poster-items">
                <div className="hero-poster-row">
                  <span>🏟️</span>
                  <span>Three courts at the VUB</span>
                </div>
                <div className="hero-poster-row">
                  <span>⏰</span>
                  <span>Every Thursday 19:00 – 20:00</span>
                </div>
                <div className="hero-poster-row">
                  <span>📅</span>
                  <span>
                    10<sup>th</sup> Sept 2026 to 24<sup>th</sup> June 2027
                  </span>
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", paddingTop: 12 }}>
                <div className="hero-poster-tagline">
                  All abilities welcome for a bit of fitness and fun
                </div>
                <div className="hero-poster-contact">
                  If interested please contact{" "}
                  <a href="mailto:marika.vernon@yahoo.co.uk">
                    marika.vernon@yahoo.co.uk
                  </a>
                </div>
              </div>
            </div>

            {/* Personalized chip or Join CTA */}
            {isGuest || name === "Player" ? (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="hero-cta-btn"
              >
                <span>🏸 Join Team / Sign In</span>
                <span>→</span>
              </button>
            ) : (
              <div className="hero-chip">👋 Hey, {name.split(" ")[0]}!</div>
            )}

            {/* Members card */}
            <div className="hero-members-card">
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: 20,
                  color: "#C6F03C",
                  lineHeight: 1,
                }}
              >
                {memberCount}+
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.70)",
                  letterSpacing: "0.02em",
                }}
              >
                Members
              </span>
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode="signup"
        returnTo="/sessions"
      />
    </>
  );
}
