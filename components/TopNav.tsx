"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/sessions", label: "Sessions" },
  { href: "/history",  label: "History"  },
  { href: "/team",     label: "Team"     },
  { href: "/you",      label: "You"      },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      background: "#060C1C",
      borderBottom: "1px solid rgba(198,240,60,0.10)",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <style>{`
        .topnav-inner {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 16px;
          height: 48px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .topnav-link {
          padding: 6px 12px;
          border-radius: 6px;
          font-family: var(--font-body);
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.04em;
          text-decoration: none;
          color: rgba(255,255,255,0.50);
          transition: color 0.15s;
        }
        .topnav-link:hover {
          color: rgba(255,255,255,0.85);
        }
        .topnav-link.active {
          color: #C6F03C;
          font-weight: 700;
        }
        @media (min-width: 768px) {
          .topnav-link {
            font-size: 14px;
            padding: 6px 16px;
          }
        }
      `}</style>
      <div className="topnav-inner">
        {NAV_LINKS.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`topnav-link${isActive ? " active" : ""}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
