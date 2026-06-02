# Top Nav + Hero Members Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal top navigation bar to every page and move the members count card inside the hero panel, while removing the NavButtons grid and ActiveMembersCTA standalone card.

**Architecture:** A new `TopNav` client component (needs `usePathname`) is rendered in `app/(main)/layout.tsx` above `<main>`. `HeroBanner` gets its `memberCount` prop back and renders a compact members strip absolutely positioned at the bottom of the hero panel. The `NavButtons` and `ActiveMembersCTA` components are deleted.

**Tech Stack:** Next.js 16 App Router, TypeScript, inline `<style>` tags (matching existing HeroBanner pattern), `usePathname` from `next/navigation`.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `components/TopNav.tsx` | **Create** | Minimal text-link nav bar, active state via `usePathname` |
| `components/HeroBanner.tsx` | **Modify** | Restore `memberCount` prop; add members strip inside hero panel |
| `app/(main)/layout.tsx` | **Modify** | Add `<TopNav />` above `<main>` |
| `app/(main)/sessions/page.tsx` | **Modify** | Remove NavButtons + ActiveMembersCTA; restore `memberCount` to HeroBanner |
| `app/(main)/history/page.tsx` | **Modify** | Remove "← Home" link |
| `app/(main)/team/page.tsx` | **Modify** | Remove "← Home" link |
| `app/(main)/you/page.tsx` | **Modify** | Remove "← Home" link |
| `components/NavButtons.tsx` | **Delete** | No longer needed |
| `components/ActiveMembersCTA.tsx` | **Delete** | No longer needed |

---

## Task 1: Create TopNav component

**Files:**
- Create: `components/TopNav.tsx`

- [ ] **Step 1: Create `components/TopNav.tsx`** with this exact content:

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/TopNav.tsx
git commit -m "feat: add TopNav minimal text-link navigation bar"
```

---

## Task 2: Add TopNav to layout

**Files:**
- Modify: `app/(main)/layout.tsx`

Current file content:
```tsx
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <main>{children}</main>
    </div>
  );
}
```

- [ ] **Step 1: Replace `app/(main)/layout.tsx`** with:

```tsx
import { TopNav } from "@/components/TopNav";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />
      <main>{children}</main>
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
git add "app/(main)/layout.tsx"
git commit -m "feat: add TopNav to main layout above content"
```

---

## Task 3: Add members strip inside HeroBanner

**Files:**
- Modify: `components/HeroBanner.tsx`

Two changes:
1. Restore `memberCount` prop to the component signature
2. Add a compact members strip absolutely positioned at the bottom of `hero-panel-responsive`, inside the hero image area

- [ ] **Step 1: Update component signature** — change line 3 from:

```tsx
export function HeroBanner({ name }: { name: string }) {
```

to:

```tsx
export function HeroBanner({ name, memberCount = 0 }: { name: string; memberCount?: number }) {
```

- [ ] **Step 2: Add `.hero-members-strip` CSS** — inside the `<style>` tag, after the `.hero-chip` media query block (after line 117, before the closing backtick), add:

```css
        .hero-members-strip {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          background: rgba(6,12,28,0.80);
          border-top: 1px solid rgba(198,240,60,0.12);
        }
        @media (min-width: 768px) {
          .hero-members-strip {
            padding: 14px 80px;
          }
        }
        @media (min-width: 1200px) {
          .hero-members-strip {
            padding: 14px 140px;
          }
        }
```

- [ ] **Step 3: Add members strip JSX** — inside `<div className="hero-panel-responsive">`, after the closing `</div>` of `.hero-text-block` (after line 188) and before the closing `</div>` of `hero-panel-responsive` (line 189), add:

```tsx
        {/* ── Members strip ── */}
        <div className="hero-members-strip">
          <span style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: 20,
            color: "#C6F03C",
            lineHeight: 1,
          }}>
            {memberCount}+
          </span>
          <span style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: 13,
            color: "rgba(255,255,255,0.70)",
            letterSpacing: "0.02em",
          }}>
            Members · Join VUB Smashers
          </span>
        </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: May warn about `memberCount` not passed in sessions/page.tsx — fixed in Task 4.

- [ ] **Step 5: Commit**

```bash
git add components/HeroBanner.tsx
git commit -m "feat: add members strip inside hero panel, restore memberCount prop"
```

---

## Task 4: Update sessions page

**Files:**
- Modify: `app/(main)/sessions/page.tsx`

Three changes:
1. Remove `NavButtons` import and JSX
2. Remove `ActiveMembersCTA` import and JSX
3. Restore `memberCount` prop to `<HeroBanner />`

- [ ] **Step 1: Remove the two imports** from the top of the file:

Remove these two lines:
```tsx
import { NavButtons } from "@/components/NavButtons";
import { ActiveMembersCTA } from "@/components/ActiveMembersCTA";
```

- [ ] **Step 2: Update the HeroBanner call** — change:

```tsx
<HeroBanner name={profile?.name ?? "Player"} />

{/* Navigation grid */}
<NavButtons />

{/* Active members CTA */}
<ActiveMembersCTA memberCount={memberCount ?? 0} />
```

to:

```tsx
<HeroBanner name={profile?.name ?? "Player"} memberCount={memberCount ?? 0} />
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(main)/sessions/page.tsx"
git commit -m "feat: remove NavButtons/ActiveMembersCTA from sessions page, restore memberCount to HeroBanner"
```

---

## Task 5: Delete NavButtons and ActiveMembersCTA components

**Files:**
- Delete: `components/NavButtons.tsx`
- Delete: `components/ActiveMembersCTA.tsx`

- [ ] **Step 1: Delete both files**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website
rm components/NavButtons.tsx components/ActiveMembersCTA.tsx
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No errors (imports were already removed in Task 4).

- [ ] **Step 3: Commit**

```bash
git rm components/NavButtons.tsx components/ActiveMembersCTA.tsx
git commit -m "feat: delete NavButtons and ActiveMembersCTA components"
```

---

## Task 6: Remove "← Home" links from content pages

**Files:**
- Modify: `app/(main)/history/page.tsx`
- Modify: `app/(main)/team/page.tsx`
- Modify: `app/(main)/you/page.tsx`

In each file, remove the "Back to home" `<div>` block that was added previously. It looks like this in each file:

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

Also remove `import Link from "next/link";` if it was only added for this block (check if Link is used elsewhere in the file first — if it is, keep the import).

- [ ] **Step 1: Remove back-link block from `app/(main)/history/page.tsx`**

Read the file, find the "Back to home" div block, remove it entirely. Keep `import Link from "next/link"` only if Link is used elsewhere in history/page.tsx (it is not — remove it).

- [ ] **Step 2: Remove back-link block from `app/(main)/team/page.tsx`**

Read the file, find the "Back to home" div block, remove it entirely. Check if Link import is used elsewhere in team/page.tsx before removing.

- [ ] **Step 3: Remove back-link block from `app/(main)/you/page.tsx`**

Read the file, find the "Back to home" div block, remove it entirely. Check if Link import is used elsewhere in you/page.tsx before removing.

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(main)/history/page.tsx" "app/(main)/team/page.tsx" "app/(main)/you/page.tsx"
git commit -m "feat: remove Back to Home links from content pages (TopNav replaces them)"
```

---

## Task 7: Final verification

**Files:** None (verification only)

- [ ] **Step 1: TypeScript build**

```bash
cd /Users/fred/Documents/VibeCoding/claudecode/badminton-website && npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 2: Confirm deleted files are gone**

```bash
ls components/NavButtons.tsx components/ActiveMembersCTA.tsx 2>&1
```

Expected: "No such file or directory" for both.

- [ ] **Step 3: Confirm new files exist**

```bash
ls components/TopNav.tsx
```

Expected: File listed.

- [ ] **Step 4: Check dev server**

```bash
curl -s http://localhost:3000/ -o /dev/null -w "%{http_code}"
```

Expected: `200` or `307`.

- [ ] **Step 5: Git log sanity check**

```bash
git log --oneline -8
```

Expected: Commits for TopNav creation, layout update, HeroBanner members strip, sessions page cleanup, component deletion, back-link removal.

- [ ] **Step 6: Push to origin**

```bash
git push origin main
```
