"use client";

import Link from "next/link";

const NAV_ITEMS = [
  {
    href: "/sessions",
    label: "Sessions",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3.5" y="4.5" width="17" height="16" rx="3"/>
        <path d="M3.5 9h17M8 2.5v4M16 2.5v4"/>
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    href: "/team",
    label: "Team",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.4"/>
        <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.2a3.4 3.4 0 0 1 0 6.4M17 14.4a5.5 5.5 0 0 1 3.5 5.1"/>
      </svg>
    ),
  },
  {
    href: "/you",
    label: "You",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M6 20a6 6 0 0 1 12 0"/>
      </svg>
    ),
  },
];

export function NavButtons() {
  return (
    <div style={{ background: "var(--bg)", padding: "20px 16px 8px" }}>
      <style>{`
        .nav-buttons-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          max-width: 480px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .nav-buttons-grid {
            max-width: 600px;
            gap: 16px;
          }
        }
        @media (min-width: 1200px) {
          .nav-buttons-grid {
            max-width: 800px;
          }
        }
        .nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 20px 12px;
          min-height: 96px;
          border-radius: 12px;
          border: 1.5px solid rgba(198,240,60,0.18);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.85);
          text-decoration: none;
          font-family: var(--font-body);
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.02em;
          transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.1s;
        }
        .nav-btn:hover {
          background: rgba(0,229,255,0.10);
          border-color: #00E5FF;
          color: #00E5FF;
          transform: translateY(-2px);
        }
        .nav-btn:active {
          transform: translateY(0);
        }
        @media (min-width: 768px) {
          .nav-btn {
            min-height: 112px;
            font-size: 15px;
            gap: 12px;
          }
        }
      `}</style>
      <div className="nav-buttons-grid">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className="nav-btn">
            {item.icon}
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
