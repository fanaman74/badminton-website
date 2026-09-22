"use client";

import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";

interface Props { name: string; memberCount?: number; isGuest?: boolean; }

export function HeroBanner({ name, memberCount = 0, isGuest = false }: Props) {
  const [authOpen, setAuthOpen] = useState(false);
  const firstName = name && name !== "Player" ? name.split(" ")[0] : "there";

  if (!isGuest && name !== "Player") {
    return (
      <section className="member-greeting page-shell" aria-labelledby="welcome-heading">
        <div>
          <p className="eyebrow">VUB Smashers</p>
          <h1 id="welcome-heading">Welcome back, {firstName}.</h1>
          <p className="greeting-copy">Your next session is ready when you are.</p>
        </div>
        <div className="member-count" aria-label={`${memberCount} members`}>
          <strong>{memberCount}</strong><span>members</span>
        </div>
        <style>{`
          .member-greeting { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:28px 0 22px; }
          .eyebrow { margin:0 0 5px; color:var(--brand); font-size:11px; font-weight:800; letter-spacing:.16em; text-transform:uppercase; }
          .member-greeting h1 { margin:0; font:800 clamp(28px,4vw,40px)/1.05 var(--font-display); letter-spacing:-.03em; color:var(--ink); }
          .greeting-copy { margin:8px 0 0; color:var(--muted); font-size:15px; }
          .member-count { display:flex; flex-direction:column; align-items:flex-end; color:var(--muted); font-size:12px; font-weight:700; }
          .member-count strong { color:var(--brand); font:900 28px/1 var(--font-display); }
          @media(max-width:600px) { .member-greeting { padding:22px 0 16px; } .member-count { display:none; } }
        `}</style>
      </section>
    );
  }

  return (
    <section className="guest-hero" aria-labelledby="guest-heading">
      <div className="guest-hero-image" aria-hidden="true" />
      <div className="guest-hero-content page-shell">
        <p className="eyebrow">🏸 VUB Smashers</p>
        <h1 id="guest-heading">Play badminton.<br /><span>Meet your team.</span></h1>
        <p className="guest-copy">A welcoming community for all abilities, with weekly games at the VUB.</p>
        <div className="facts" aria-label="Club facts">
          <span>🏟️ Three courts at the VUB</span>
          <span>⏰ Thursdays, 19:00–20:00</span>
          <span>📅 10 Sept 2026–24 June 2027</span>
        </div>
        <div className="guest-actions">
          <button type="button" onClick={() => setAuthOpen(true)} className="join-button">Join the club <span aria-hidden="true">→</span></button>
          <a href="mailto:marika.vernon@yahoo.co.uk" className="contact-link">Questions? Contact Marika</a>
        </div>
      </div>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode="signup" returnTo="/sessions" />
      <style>{`
        .guest-hero { position:relative; overflow:hidden; min-height:320px; color:#fff; background:#060c1c; }
        .guest-hero-image { position:absolute; inset:0; background:linear-gradient(90deg,rgba(4,8,20,.95) 0%,rgba(4,8,20,.77) 50%,rgba(4,8,20,.35) 100%),url('/hero-player.png') center 35%/cover; }
        .guest-hero-content { position:relative; padding-top:34px; padding-bottom:34px; }
        .guest-hero .eyebrow { color:var(--accent); }
        .guest-hero h1 { margin:0; font:900 clamp(40px,7vw,60px)/.98 var(--font-display); letter-spacing:-.05em; }
        .guest-hero h1 span { color:var(--accent); }
        .guest-copy { max-width:470px; margin:12px 0 14px; color:rgba(255,255,255,.8); font-size:15px; line-height:1.45; }
        .facts { display:flex; flex-wrap:wrap; gap:8px 16px; color:rgba(255,255,255,.82); font-size:13px; font-weight:700; }
        .guest-actions { display:flex; align-items:center; flex-wrap:wrap; gap:14px; margin-top:18px; }
        .join-button { border:0; border-radius:999px; background:var(--accent); color:var(--accent-ink); padding:11px 20px; font:800 14px var(--font-display); }
        .contact-link { color:#fff; font-size:13px; font-weight:700; text-underline-offset:3px; }
        @media(max-width:600px) { .guest-hero { min-height:350px; } .guest-hero-content { padding-top:26px; padding-bottom:30px; } .facts { flex-direction:column; gap:7px; } }
      `}</style>
    </section>
  );
}
