# Top Nav Bar + Hero Members Card Design

## Goal

Replace the 2×2 grid navigation buttons with a minimal top navigation bar on every page, and move the Active Members card inside the hero banner panel (below the text block, overlaid on the hero image).

## Changes From Previous Design

The previous navigation redesign added a 2×2 grid of NavButtons after the hero and an ActiveMembersCTA card below. This design replaces that approach:

- **Remove:** NavButtons grid component
- **Remove:** ActiveMembersCTA component (standalone card below hero)
- **Add:** TopNav bar — minimal text links at the top of every page
- **Add:** Members card inside the hero panel — below the text block, overlaid on the hero image

---

## Design

### Top Navigation Bar

**Placement:** Fixed to the top of every page, above the hero banner and all content. Rendered in `app/(main)/layout.tsx` above `<main>`.

**Content:** 4 navigation links — Sessions, History, Team, You

**Styling:**
- Dark background: `#060C1C` (matches app theme)
- Full-width, height: ~48px
- Links displayed as minimal text (not buttons/tabs)
- Font: `var(--font-body)`, weight 600, size 13px, letter-spacing 0.04em
- Default link color: `rgba(255,255,255,0.5)` (quiet, muted)
- **Active page:** lime `#C6F03C` color + slightly heavier weight (700)
- Links separated by padding (not borders or dividers)
- Layout: horizontal flex row, centered or left-aligned with padding

**Active state detection:** Use `usePathname()` from Next.js — compare pathname to each link's href.

**Responsive:** Same layout on mobile and desktop (links fit on one line at all sizes).

**Component:** `components/TopNav.tsx` — `"use client"` (needs `usePathname`).

---

### Hero Panel Members Card

**Placement:** Inside `hero-panel-responsive` div in `HeroBanner.tsx`, below the `.hero-text-block` div. Positioned at the bottom of the hero panel, overlaid on the background image.

**Content:**
- Member count (e.g., "17+ Members")
- Subtext: "Join VUB Smashers"

**Styling:**
- Position: `absolute`, `bottom: 16px`, `left: 16px` (or `left: 0, right: 0` for full width)
- Full-width horizontal bar at the bottom of the hero
- Background: `rgba(6,12,28,0.75)` with backdrop-blur or solid dark strip
- Text: white/lime
- Height: compact (~56-64px)
- z-index: 2 (above overlays, same level as text block)
- Border-top: subtle `1px solid rgba(198,240,60,0.12)`

**Data:** `memberCount` prop passed into `HeroBanner` (restored from previous removal).

**What it replaces:** The standalone `ActiveMembersCTA` card that previously sat below the hero. No separate "View Team" button — just the stat display integrated into the hero.

---

### Removed Components

- `components/NavButtons.tsx` — deleted
- `components/ActiveMembersCTA.tsx` — deleted

### Pages: Remove "← Home" Links

The "← Home" links added to history, team, and you pages are no longer needed — the TopNav provides navigation on every page. Remove from:
- `app/(main)/history/page.tsx`
- `app/(main)/team/page.tsx`
- `app/(main)/you/page.tsx`

### Sessions Page Cleanup

Remove from `app/(main)/sessions/page.tsx`:
- `<NavButtons />` component and its import
- `<ActiveMembersCTA />` component and its import
- Restore `memberCount` prop to `<HeroBanner />` call

---

## File Changes Summary

| File | Action |
|------|--------|
| `components/TopNav.tsx` | **Create** — minimal text links nav bar |
| `components/HeroBanner.tsx` | **Modify** — restore `memberCount` prop, add members card inside hero panel |
| `app/(main)/layout.tsx` | **Modify** — add `<TopNav />` above `<main>` |
| `app/(main)/sessions/page.tsx` | **Modify** — remove NavButtons + ActiveMembersCTA, restore memberCount to HeroBanner |
| `app/(main)/history/page.tsx` | **Modify** — remove "← Home" link |
| `app/(main)/team/page.tsx` | **Modify** — remove "← Home" link |
| `app/(main)/you/page.tsx` | **Modify** — remove "← Home" link |
| `components/NavButtons.tsx` | **Delete** |
| `components/ActiveMembersCTA.tsx` | **Delete** |

---

## Responsive Behaviour

**Mobile (<768px):**
- TopNav: Full-width, links fit on one row with equal spacing
- Hero members card: Full-width strip at bottom of hero

**Tablet + Desktop (≥768px):**
- TopNav: Same layout, slightly larger font (14px)
- Hero members card: Same, with adjusted padding

---

## Testing Checklist

- [ ] TopNav appears at the top of every page (sessions, history, team, you)
- [ ] Active page link is highlighted lime (#C6F03C)
- [ ] Inactive links are muted (rgba white 50%)
- [ ] Clicking each link navigates to correct page
- [ ] Members card appears inside hero panel at bottom, overlaid on image
- [ ] Members card shows correct count + "Join VUB Smashers"
- [ ] NavButtons grid is gone from sessions page
- [ ] ActiveMembersCTA standalone card is gone
- [ ] "← Home" links removed from history, team, you pages
- [ ] Mobile (375px): TopNav fits on one row, hero card readable
- [ ] TypeScript builds with no errors (`npx tsc --noEmit`)

---

## Visual Summary

```
┌─────────────────────────────────────────┐
│  TOP NAV  Sessions · History · Team · You│  ← TopNav (all pages)
├─────────────────────────────────────────┤
│                                         │
│   HERO BANNER (background image)        │
│                                         │
│   🏸 VUB Smashers                       │
│   Play.                                 │
│   Train.                                │
│   Win.                                  │
│   Together.                             │
│   👋 Hey, Fred!                         │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 17+ Members  ·  Join VUB Smashers   │ │  ← Members card (inside hero)
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

         Sessions list content below...
```

---

## Success Criteria

1. ✅ TopNav is visible and functional on all pages
2. ✅ Active page is clearly indicated with lime colour
3. ✅ Members card is visually integrated into the hero (not a separate card below)
4. ✅ No NavButtons grid anywhere
5. ✅ No standalone ActiveMembersCTA card
6. ✅ No "← Home" links on content pages
7. ✅ TypeScript builds clean
8. ✅ Responsive on mobile and desktop
