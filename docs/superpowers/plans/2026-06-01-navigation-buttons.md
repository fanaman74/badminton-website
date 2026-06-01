# Navigation Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed bottom navigation bar with a 2×2 grid of navigation buttons on the sessions/home page, and a single Active Members CTA card replacing the 4-card stats bar.

**Architecture:** The "home" page is `/sessions` (app/page.tsx redirects there), which renders HeroBanner then the session list. We'll insert NavButtons and ActiveMembersCTA between the hero and sessions list. BottomNav is removed from the main layout entirely. Other content pages get a simple "← Back to Home" link.

**Tech Stack:** Next.js 16 App Router, TypeScript, inline `<style>` tags (matching HeroBanner pattern), Supabase for memberCount data.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `components/NavButtons.tsx` | **Create** | 2×2 grid navigation buttons |
| `components/ActiveMembersCTA.tsx` | **Create** | Single active members card with "View Team" CTA |
| `components/HeroBanner.tsx` | **Modify** | Remove the 4-card stats bar (lines 197–273) |
| `app/(main)/layout.tsx` | **Modify** | Remove BottomNav, remove paddingBottom: 65 |
| `app/(main)/sessions/page.tsx` | **Modify** | Add NavButtons + ActiveMembersCTA after HeroBanner |
| `app/(main)/history/page.tsx` | **Modify** | Add "← Back to Home" link at top |
| `app/(main)/team/page.tsx` | **Modify** | Add "← Back to Home" link at top |
| `app/(main)/you/page.tsx` | **Modify** | Add "← Back to Home" link at top |
| `components/BottomNav.tsx` | **Delete** | No longer used |

---

## Task 1: Create NavButtons component

**Files:**
- Create: `components/NavButtons.tsx`

The NavButtons component renders a 2×2 grid of navigation buttons matching the app's dark design system.

- [ ] **Step 1: Create `components/NavButtons.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/NavButtons.tsx
git commit -m "feat: add NavButtons 2x2 grid navigation component"
```

---

## Task 2: Create ActiveMembersCTA component

**Files:**
- Create: `components/ActiveMembersCTA.tsx`

Replaces the 4-card stats bar. Shows member count + "View Team" CTA.

- [ ] **Step 1: Create `components/ActiveMembersCTA.tsx`**

```tsx
import Link from "next/link";

interface ActiveMembersCTAProps {
  memberCount: number;
}

export function ActiveMembersCTA({ memberCount }: ActiveMembersCTAProps) {
  return (
    <div style={{ padding: "8px 16px 24px" }}>
      <div style={{
        background: "linear-gradient(110deg, #060C1C 0%, #0a1628 60%, #060C1C 100%)",
        border: "1px solid rgba(198,240,60,0.15)",
        borderRadius: 14,
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 28,
            color: "#C6F03C",
            lineHeight: 1,
            marginBottom: 6,
          }}>
            {memberCount}+ Members
          </div>
          <div style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: 14,
            color: "rgba(255,255,255,0.55)",
          }}>
            Join VUB Smashers
          </div>
        </div>
        <Link
          href="/team"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
            borderRadius: 999,
            background: "#C6F03C",
            color: "#060C1C",
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          View Team →
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/ActiveMembersCTA.tsx
git commit -m "feat: add ActiveMembersCTA component replacing 4-card stats bar"
```

---

## Task 3: Remove stats bar from HeroBanner

**Files:**
- Modify: `components/HeroBanner.tsx`

The `HeroBanner` component currently accepts `memberCount` as a prop and renders a 4-card stats bar at the bottom (lines 197–273). Remove the entire stats bar section and the `memberCount` prop — `memberCount` will now be consumed by `ActiveMembersCTA` instead.

- [ ] **Step 1: Update `components/HeroBanner.tsx`**

Change the component signature from:
```tsx
export function HeroBanner({ name, memberCount = 0 }: { name: string; memberCount?: number }) {
```
To:
```tsx
export function HeroBanner({ name }: { name: string }) {
```

Then remove the entire stats bar `<div>` at the bottom (the section that starts with `{/* ── Stats bar ── */}` and contains the 4-column grid). The component should end after `</div>` that closes the main hero panel `div.hero-panel-responsive`, before the final outer closing `</div>`.

The final structure should be:
```tsx
export function HeroBanner({ name }: { name: string }) {
  return (
    <div style={{ position: "relative", marginBottom: 4 }}>
      <style>{`
        /* ... all existing CSS classes unchanged ... */
      `}</style>

      {/* ── Main hero panel ── */}
      <div className="hero-panel-responsive">
        {/* Full-bleed background photo */}
        {/* ... img, overlays, text block — all unchanged ... */}
      </div>
      {/* Stats bar removed */}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: May error on `memberCount` prop usage in `sessions/page.tsx` — fix in next step.

- [ ] **Step 3: Commit**

```bash
git add components/HeroBanner.tsx
git commit -m "feat: remove 4-card stats bar from HeroBanner"
```

---

## Task 4: Wire up NavButtons and ActiveMembersCTA on sessions page

**Files:**
- Modify: `app/(main)/sessions/page.tsx`

The sessions page renders `<HeroBanner name={...} memberCount={...} />`. Update it to:
1. Remove `memberCount` from HeroBanner props
2. Add `<NavButtons />` directly after `<HeroBanner />`
3. Add `<ActiveMembersCTA memberCount={memberCount ?? 0} />` directly after `<NavButtons />`

- [ ] **Step 1: Update imports in `app/(main)/sessions/page.tsx`**

Change the imports block to include the new components:
```tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/auth";
import { SessionCard } from "@/components/SessionCard";
import { HeroBanner } from "@/components/HeroBanner";
import { NavButtons } from "@/components/NavButtons";
import { ActiveMembersCTA } from "@/components/ActiveMembersCTA";
import type { RsvpStatus } from "@/types/database";
```

- [ ] **Step 2: Update the JSX in `app/(main)/sessions/page.tsx`**

Replace:
```tsx
{/* Hero banner */}
<HeroBanner name={profile?.name ?? "Player"} memberCount={memberCount ?? 0} />
```

With:
```tsx
{/* Hero banner */}
<HeroBanner name={profile?.name ?? "Player"} />

{/* Navigation grid */}
<NavButtons />

{/* Active members CTA */}
<ActiveMembersCTA memberCount={memberCount ?? 0} />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(main\)/sessions/page.tsx
git commit -m "feat: wire up NavButtons and ActiveMembersCTA on sessions page"
```

---

## Task 5: Remove BottomNav from layout

**Files:**
- Modify: `app/(main)/layout.tsx`
- Delete: `components/BottomNav.tsx`

The layout currently imports BottomNav and adds `paddingBottom: 65` to the container to prevent content being hidden behind the fixed bar.

- [ ] **Step 1: Update `app/(main)/layout.tsx`**

Replace the entire file with:
```tsx
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <main>{children}</main>
    </div>
  );
}
```

Note: `paddingBottom: 65` is removed (no more fixed bottom bar), and the BottomNav import and usage are removed.

- [ ] **Step 2: Delete `components/BottomNav.tsx`**

```bash
rm /Users/fred/Documents/VibeCoding/claudecode/badminton-website/components/BottomNav.tsx
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(main\)/layout.tsx
git rm components/BottomNav.tsx
git commit -m "feat: remove BottomNav from layout, delete component"
```

---

## Task 6: Add "Back to Home" links to content pages

**Files:**
- Modify: `app/(main)/history/page.tsx`
- Modify: `app/(main)/team/page.tsx`
- Modify: `app/(main)/you/page.tsx`

Each content page gets a simple "← Back to Home" link at the top, styled as a quiet text link. "Home" is `/sessions`.

- [ ] **Step 1: Update `app/(main)/history/page.tsx`**

Add `import Link from "next/link";` to the imports (it may already be present — check first).

Then in the JSX, add this block as the **first child** inside the outermost `<div>` (before the `{/* Header */}` comment):

```tsx
{/* Back to home */}
<div style={{ padding: "14px 16px 0" }}>
  <Link href="/sessions" style={{
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 13,
    color: "var(--faint)",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  }}>
    ← Home
  </Link>
</div>
```

- [ ] **Step 2: Update `app/(main)/team/page.tsx`**

Apply the same "Back to home" block as the **first child** inside the outermost `<div>` of the page return:

```tsx
{/* Back to home */}
<div style={{ padding: "14px 16px 0" }}>
  <Link href="/sessions" style={{
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 13,
    color: "var(--faint)",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  }}>
    ← Home
  </Link>
</div>
```

Ensure `import Link from "next/link";` is present in the imports.

- [ ] **Step 3: Update `app/(main)/you/page.tsx`**

Apply the same "Back to home" block as the **first child** inside the outermost `<div>` of the page return:

```tsx
{/* Back to home */}
<div style={{ padding: "14px 16px 0" }}>
  <Link href="/sessions" style={{
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: 13,
    color: "var(--faint)",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
  }}>
    ← Home
  </Link>
</div>
```

Ensure `import Link from "next/link";` is present in the imports.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add app/\(main\)/history/page.tsx app/\(main\)/team/page.tsx app/\(main\)/you/page.tsx
git commit -m "feat: add Back to Home link on history, team, and you pages"
```

---

## Task 7: Final verification

**Files:** None (verification only)

- [ ] **Step 1: Run TypeScript build**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Verify dev server is running and check visually**

```bash
curl -s http://localhost:3000/ -o /dev/null -w "%{http_code}"
```

Expected: `200` (or redirect to `/sessions`).

- [ ] **Step 3: Spot-check checklist**

Manually verify in the browser:
- [ ] `/sessions` page: Hero → NavButtons (2×2) → ActiveMembersCTA → Sessions list
- [ ] NavButtons: Sessions, History, Team, You — all link to correct pages
- [ ] ActiveMembersCTA: Shows member count + "View Team →" button
- [ ] BottomNav: Completely gone (no fixed bar at bottom of any page)
- [ ] `/history`: "← Home" link visible at top
- [ ] `/team`: "← Home" link visible at top
- [ ] `/you`: "← Home" link visible at top
- [ ] Mobile (375px): Grid buttons fill width, are tappable (≥56px height)
- [ ] No console errors

- [ ] **Step 4: Push to origin**

```bash
git push origin main
```
