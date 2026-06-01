# Navigation Redesign: Grid Buttons + Home-Focused Navigation

## Goal

Replace the fixed bottom navigation menu with a prominent grid button section on the home page, simplifying the navigation model and improving visual hierarchy. Create a home-centric navigation paradigm where users enter through the grid buttons and navigate content pages with minimal navigation chrome.

## Problem

The current BottomNav is:
- Fixed on every page (mobile and desktop)
- Takes valuable screen space on mobile
- Not visually prominent or engaging
- Feels like a tab bar rather than a purposeful navigation entry point

## Solution: Home-Focused Grid Navigation

Move navigation to the **home page as a visual gateway**, with clean content-focused pages that link back to home. Remove the bottom navigation bar entirely.

---

## Design

### Architecture: Navigation Model

**Home Page (`/`):**
- Hero Banner (unchanged: "Play. Train. Win. Together.")
- **Grid Button Section (NEW)** — 2×2 grid with 4 navigation buttons
- **Active Members CTA Card (REPLACES stats bar)** — Single prominent member count card

**Content Pages (`/sessions`, `/history`, `/team`, `/you`):**
- Clean content area (focused on page purpose)
- Minimal navigation: "← Back to Home" link or breadcrumb
- No fixed bottom nav, no replicated grid buttons

**Navigation Flow:**
```
Home (grid buttons) → Sessions/History/Team/You (content) → Back to Home
```

### Grid Button Section

**Layout:**
- Appears immediately after hero banner on home page
- 2×2 grid layout on desktop and tablet
- Responsive on mobile (remains 2×2 or stacks based on viewport)
- Full-width with padding, subtle background or gradient

**Button Design:**

Each button contains:
- **Icon** (emoji or SVG): 📅 (Sessions), 📊 (History), 👥 (Team), 👤 (You)
- **Label text** below icon (Sessions, History, Team, You)
- **Border/outline** styling with rounded corners (8-12px radius)

Button states:
- **Default:** Light background or outlined with brand color border
- **Hover:** Highlighted with cyan (#00E5FF) or lime (#C6F03C) accent
- **Active** (if on home): Filled with brand color background

Sizing:
- Minimum tap target: 56-64px (mobile accessibility)
- Padding: 16-20px
- Gap between buttons: 12-16px

**Styling approach:**
- Use inline `<style>` tags in React component (match HeroBanner pattern)
- Use design tokens: `--brand`, `--ink`, `--faint`, brand colors
- Responsive: media queries for mobile/tablet/desktop

**Behavior:**
- Clicking a button navigates to: `/sessions`, `/history`, `/team`, `/you`
- No active state on home (all buttons equal, user hasn't selected yet)

### Active Members CTA Card

Replaces the current 4-card stats bar (Active Members, Courts Booked, Training Sessions, Fun. Fitness. Friendship).

**Content:**
- **Primary stat:** Member count (e.g., "18+ Active Members")
- **Subtext:** "Join VUB Smashers" or "Be part of the community"
- **Optional CTA button:** "Learn More" or "View Team" (links to `/team`)

**Styling:**
- Full-width card with padding (24px vertical, 16-24px horizontal)
- Background: Brand gradient or solid dark color
- Text: White/light color (#FFFFFF or #FFFFFF 85% opacity)
- Border-radius: 12-16px
- Height: ~120-150px (prominent but not overwhelming)
- Shadow: Subtle (0 2px 8px rgba(0,0,0,0.2))

**Data source:**
- Fetches `memberCount` from database or props
- Displays dynamically (updates as members join)

**Placement:**
- Directly below grid button section
- On home page only

### Other Pages Navigation

**Content pages** (`/sessions`, `/history`, `/team`, `/you`):
- Include a minimal navigation link/breadcrumb at **top or bottom** of page
- Examples:
  - "← Back to Home" link (simple, clean)
  - Breadcrumb: "Home / Sessions" (more explicit)
- Styling: Simple link, no fixed bars, no replicated grid buttons
- Purpose: Let users return to home, avoid being stranded on a content page

### Removed Components

**BottomNav:**
- Remove `components/BottomNav.tsx` from `app/(main)/layout.tsx`
- Component file can be deleted or archived

**Stats Bar:**
- Remove the 4-card grid from `components/HeroBanner.tsx`
- Replace with single Active Members card below grid buttons

### What Stays Unchanged

- Hero banner design (heights, text, overlays, responsive behavior)
- Page content (Sessions detail, History list, Team page, Profile page)
- Auth flow, RSVP logic, database schema
- All existing functionality (sessions, RSVPs, history, team view)
- Design tokens and color palette
- Font sizes, spacing system

---

## Implementation Plan

### File Changes Summary

**Create:**
- `components/NavButtons.tsx` — Grid button component with 4 navigation options
- `components/ActiveMembersCTA.tsx` — Active members card component (optional, could inline)

**Modify:**
- `components/HeroBanner.tsx` — Remove 4-card stats bar, add Active Members card
- `components/BottomNav.tsx` — Remove or hide (no longer used)
- `app/(main)/layout.tsx` — Remove BottomNav import/rendering
- `app/page.tsx` (home page) — Import and render NavButtons and ActiveMembersCTA
- Content pages (`/sessions`, `/history`, `/team`, `/you`) — Add "Back to Home" link if needed

**Delete (optional):**
- `components/BottomNav.tsx` — No longer needed

### Responsive Behavior

**Mobile (<768px):**
- Grid buttons: 2×2 layout, full-width with padding
- Active Members card: Full-width, adjusted padding

**Tablet (768px-1199px):**
- Grid buttons: 2×2 layout, padded container (max-width: ~600px, centered)
- Active Members card: Padded container

**Desktop (≥1200px):**
- Grid buttons: 2×2 layout, padded container (max-width: ~800px, centered)
- Active Members card: Padded container

### Testing Checklist

- [ ] Home page displays: Hero → Grid buttons → Active Members card
- [ ] Grid buttons (Sessions, History, Team, You) link to correct pages
- [ ] Clicking buttons navigates and page loads correctly
- [ ] Active Members card displays member count correctly
- [ ] BottomNav is removed from all pages
- [ ] Content pages have "Back to Home" link visible
- [ ] Mobile (375px): Grid buttons are tappable (56+ px), layout is responsive
- [ ] Tablet (768px): Grid buttons and cards display correctly
- [ ] Desktop (1280px+): Grid buttons and cards display correctly
- [ ] No console errors
- [ ] TypeScript builds successfully (`npx tsc --noEmit`)

---

## Visual Summary

```
┌─────────────────────────────────────┐
│         HERO BANNER                 │
│    Play. Train. Win. Together.      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   GRID BUTTON SECTION (NEW)         │
│  ┌──────────────┬──────────────┐   │
│  │ 📅 Sessions  │ 📊 History   │   │
│  ├──────────────┼──────────────┤   │
│  │ 👥 Team      │ 👤 You       │   │
│  └──────────────┴──────────────┘   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   ACTIVE MEMBERS CTA (REPLACES BAR)  │
│   18+ Active Members                │
│   Join VUB Smashers                 │
│        [View Team] (optional)       │
└─────────────────────────────────────┘

         (Page content below)
```

---

## Success Criteria

1. ✅ Grid buttons are visually prominent and engaging
2. ✅ Navigation is intuitive: home page is the entry point
3. ✅ All content pages are clutter-free (no bottom nav)
4. ✅ Users can easily return to home from any page
5. ✅ Active Members CTA replaces the 4-card stats bar
6. ✅ Design is responsive and touch-friendly on mobile
7. ✅ No breaking changes to existing features (sessions, RSVPs, team view)
8. ✅ TypeScript builds with no errors

