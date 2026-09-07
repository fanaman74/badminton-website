"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/db";
import { AuthModal } from "@/components/AuthModal";

interface Props {
  user?: Profile | null;
}

export function TopNav({ user }: Props) {
  const pathname = usePathname();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signup");

  const navLinks = [
    { href: "/sessions", label: "Sessions" },
    { href: "/history",  label: "History"  },
    { href: "/team",     label: "Team"     },
    ...(user ? [{ href: "/you", label: "You" }] : []),
  ];

  return (
    <>
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
            justify-content: space-between;
            padding: 0 16px;
            height: 52px;
            max-width: 1200px;
            margin: 0 auto;
          }
          .topnav-left {
            display: flex;
            align-items: center;
            gap: 4px;
          }
          .topnav-logo {
            display: flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;
            margin-right: 12px;
          }
          .topnav-logo-badge {
            font-size: 18px;
            line-height: 1;
          }
          .topnav-logo-text {
            font-family: var(--font-display);
            font-weight: 900;
            font-size: 16px;
            letter-spacing: -0.02em;
            color: #FFFFFF;
          }
          .topnav-logo-text span {
            color: #C6F03C;
          }
          .topnav-link {
            padding: 6px 12px;
            border-radius: 6px;
            font-family: var(--font-body);
            font-weight: 600;
            font-size: 13px;
            letter-spacing: 0.04em;
            text-decoration: none;
            color: rgba(255,255,255,0.55);
            transition: color 0.15s, background 0.15s;
          }
          .topnav-link:hover {
            color: rgba(255,255,255,0.9);
            background: rgba(255,255,255,0.04);
          }
          .topnav-link.active {
            color: #C6F03C;
            font-weight: 700;
          }
          .topnav-auth-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 14px;
            border-radius: 999px;
            font-family: var(--font-display);
            font-weight: 800;
            font-size: 12.5px;
            border: 1px solid rgba(198,240,60,0.35);
            background: rgba(198,240,60,0.12);
            color: #C6F03C;
            cursor: pointer;
            transition: all 0.15s ease;
            text-decoration: none;
          }
          .topnav-auth-btn:hover {
            background: #C6F03C;
            color: #060C1C;
            box-shadow: 0 0 16px rgba(198,240,60,0.35);
          }
          .topnav-user-chip {
            display: flex;
            align-items: center;
            gap: 8px;
            text-decoration: none;
            padding: 4px 10px 4px 4px;
            border-radius: 999px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.10);
            transition: background 0.15s;
          }
          .topnav-user-chip:hover {
            background: rgba(255,255,255,0.12);
          }
          @media (min-width: 768px) {
            .topnav-link {
              font-size: 14px;
              padding: 6px 16px;
            }
            .topnav-auth-btn {
              font-size: 13.5px;
              padding: 7px 18px;
            }
          }
        `}</style>
        <div className="topnav-inner">
          <div className="topnav-left">
            <Link href="/sessions" className="topnav-logo">
              <span className="topnav-logo-badge">🏸</span>
              <span className="topnav-logo-text">SMASH<span>ERS</span></span>
            </Link>

            {navLinks.map((link) => {
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

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {user ? (
              <Link href="/you" className="topnav-user-chip" title={user.name}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "#C6F03C", color: "#060C1C",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 11,
                }}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <span style={{
                  fontFamily: "var(--font-body)", fontWeight: 600, fontSize: 13,
                  color: "#FFFFFF", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                }}>
                  {user.name.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setAuthModalOpen(true);
                }}
                className="topnav-auth-btn"
              >
                <span>Sign In / Join</span>
                <span>→</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        returnTo={pathname}
      />
    </>
  );
}

