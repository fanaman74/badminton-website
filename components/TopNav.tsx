"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/db";
import { AuthModal } from "@/components/AuthModal";

interface Props { user?: Profile | null; }

export function TopNav({ user }: Props) {
  const pathname = usePathname();
  const hash = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("hashchange", onStoreChange);
      return () => window.removeEventListener("hashchange", onStoreChange);
    },
    () => window.location.hash,
    () => "",
  );
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authReturnTo, setAuthReturnTo] = useState(pathname);
  const myGamesHref = pathname === "/you" ? "#my-games" : "/you#my-games";
  const profileHref = pathname === "/you" ? "#profile" : "/you#profile";
  const AccountLink = pathname === "/you" ? "a" : Link;

  const openAuth = (mode: "signin" | "signup", destination = pathname) => {
    setAuthMode(mode);
    setAuthReturnTo(destination);
    setAuthModalOpen(true);
  };
  const isActive = (href: string) => href === "/sessions"
    ? pathname === "/sessions" || pathname.startsWith("/sessions/")
    : pathname.startsWith(href);
  const links = [
    { href: "/sessions", label: "Sessions" },
    { href: "/history", label: "History" },
    { href: "/team", label: "Team" },
    ...(user ? [{ href: "/you", label: "You" }] : []),
  ];

  return (
    <>
      <nav className="topnav" aria-label="Primary navigation">
        <div className="topnav-inner">
          <Link href="/sessions" className="topnav-logo" aria-label="VUB Smashers home">
            <span aria-hidden="true">🏸</span><span>SMASH<span>ERS</span></span>
          </Link>
          <div className="topnav-links">
            {links.map((link) => <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={`topnav-link${isActive(link.href) ? " active" : ""}`}>{link.label}</Link>)}
          </div>
          <div className="topnav-actions">
            {user ? (
              <AccountLink href={profileHref} className="topnav-user-chip" aria-label="Open your profile">
                <span>{user.name.slice(0, 2).toUpperCase()}</span><b>{user.name.split(" ")[0]}</b>
              </AccountLink>
            ) : (
              <>
                <button type="button" className="topnav-signin" onClick={() => openAuth("signin")}>Sign in</button>
                <button type="button" className="topnav-join" onClick={() => openAuth("signup")}>Join</button>
              </>
            )}
            <details className="mobile-more">
              <summary aria-label="More navigation">•••</summary>
              <div className="more-menu"><Link href="/history">History</Link>{user?.role === "ADMIN" && <Link href="/admin/sessions/new">Admin</Link>}</div>
            </details>
            {user?.role === "ADMIN" && <Link className="admin-link" href="/admin/sessions/new">Admin</Link>}
          </div>
        </div>
      </nav>

      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        <Link href="/sessions" aria-current={isActive("/sessions") ? "page" : undefined} className={isActive("/sessions") ? "active" : ""}><span aria-hidden="true">📅</span>Sessions</Link>
        {user ? <AccountLink href={myGamesHref} aria-current={pathname === "/you" && (hash === "#my-games" || hash === "") ? "page" : undefined} className={pathname === "/you" && (hash === "#my-games" || hash === "") ? "active" : ""}><span aria-hidden="true">🏸</span>My games</AccountLink> : <button type="button" onClick={() => openAuth("signin", "/you#my-games")}><span aria-hidden="true">🏸</span>My games</button>}
        <Link href="/team" aria-current={isActive("/team") ? "page" : undefined} className={isActive("/team") ? "active" : ""}><span aria-hidden="true">👥</span>Team</Link>
        {user ? <AccountLink href={profileHref} aria-current={pathname === "/you" && hash === "#profile" ? "page" : undefined} className={pathname === "/you" && hash === "#profile" ? "active" : ""}><span aria-hidden="true">◎</span>Profile</AccountLink> : <button type="button" onClick={() => openAuth("signin", "/you#profile")}><span aria-hidden="true">◎</span>Profile</button>}
      </nav>
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} initialMode={authMode} returnTo={authReturnTo} />

      <style>{`
        .topnav { position: sticky; top: 0; z-index: 50; background: #060c1c; border-bottom: 1px solid rgba(198,240,60,.12); }
        .topnav-inner { width: min(100% - 32px,1180px); height: 60px; margin: auto; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
        .topnav-logo { display: flex; align-items: center; gap: 7px; color: #fff; text-decoration: none; font: 900 17px var(--font-display); letter-spacing: -.03em; }
        .topnav-logo > span:last-child > span { color: var(--accent); }
        .topnav-links { display: flex; align-items: center; gap: 3px; flex: 1; }
        .topnav-link { padding: 8px 12px; border-radius: 8px; color: rgba(255,255,255,.68); font-size: 13px; font-weight: 700; text-decoration: none; }
        .topnav-link:hover, .topnav-link.active { color: var(--accent); background: rgba(255,255,255,.06); }
        .topnav-actions { display: flex; align-items: center; gap: 8px; }
        .topnav-signin, .topnav-join, .admin-link { border: 0; background: none; color: #fff; padding: 8px 10px; font-size: 13px; font-weight: 700; text-decoration: none; }
        .topnav-join { border: 1px solid var(--accent); border-radius: 999px; color: var(--accent); padding: 8px 15px; }
        .topnav-user-chip { display: flex; align-items: center; gap: 7px; text-decoration: none; color: #fff; font-size: 13px; }
        .topnav-user-chip span { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--accent); color: var(--accent-ink); font-size: 10px; font-weight: 900; }
        .mobile-bottom-nav, .mobile-more { display: none; }
        .admin-link { border-left: 1px solid rgba(255,255,255,.15); padding-left: 12px; color: var(--accent); }
        @media (max-width: 767px) {
          .topnav-inner { height: 54px; width: min(100% - 24px,680px); }
          .topnav-links, .topnav-user-chip b, .admin-link { display: none; }
          .topnav-actions { margin-left: auto; }
          .topnav-signin { padding: 7px 5px; }
          .topnav-join { padding: 7px 12px; }
          .mobile-more { display: block; position: relative; }
          .mobile-more summary { list-style: none; color: #fff; cursor: pointer; padding: 5px; }
          .mobile-more summary::-webkit-details-marker { display: none; }
          .more-menu { position: absolute; right: 0; top: 34px; display: grid; min-width: 125px; padding: 6px; background: #fff; border: 1px solid var(--line); border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,.18); }
          .more-menu a { padding: 8px; color: var(--ink); font-size: 13px; text-decoration: none; }
          .mobile-bottom-nav { position: fixed; display: grid; grid-template-columns: repeat(4,1fr); bottom: 0; left: 0; right: 0; z-index: 60; padding: 8px 8px calc(8px + env(safe-area-inset-bottom)); background: rgba(255,255,255,.97); border-top: 1px solid var(--line); box-shadow: 0 -5px 18px rgba(20,18,12,.08); }
          .mobile-bottom-nav a, .mobile-bottom-nav button { display: flex; flex-direction: column; align-items: center; gap: 3px; color: var(--muted); font-size: 10px; font-weight: 800; text-decoration: none; background: none; border: 0; }
          .mobile-bottom-nav a span, .mobile-bottom-nav button span { font-size: 18px; line-height: 1; }
          .mobile-bottom-nav a.active { color: var(--brand); }
        }
      `}</style>
    </>
  );
}
