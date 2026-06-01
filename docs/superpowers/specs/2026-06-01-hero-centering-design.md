# Hero Section Centering Design

## Goal

Improve visual balance in the hero section by repositioning text to be center-biased in the viewport rather than left-aligned, creating better harmony between the headline and the badminton player background image.

## Problem

Current hero layout pushes text to the left edge with large padding, leaving the right side (where the badminton player image is visible) feeling empty. This creates an unbalanced, "split-screen" composition where text and image compete rather than complement.

## Solution: Center-Biased Positioning

Increase left padding and reduce text block width so the headline becomes the visual anchor in the center-left area, with the background image visible and breathing on the right side.

## Design

### Layout Changes

**Desktop (≥768px):**
- Increase `.hero-text-block` left padding from `80px` to `140px`
- Reduce max-width from `60%` to `50%`
- Result: Text block positioned toward viewport center with tighter text column

**Tablet (768px):**
- Keep `.hero-text-block` padding at `80px` (no change)
- Keep max-width at `60%` (no change)

**Mobile (<768px):**
- Keep `.hero-text-block` padding at `24px` (no change)
- Keep width at `100%` (no change)

### CSS Implementation

Modify the `.hero-text-block` media query for desktop (≥768px):

```css
@media (min-width: 768px) {
  .hero-text-block {
    padding: 48px 140px;  /* Changed from: 48px 80px */
    max-width: 50%;       /* Changed from: 60% */
  }
}
```

### What Stays Unchanged

- Hero panel height responsiveness (100vh desktop, 60vh mobile)
- Vertical centering of text block (`top: 50%`, `transform: translateY(-50%)`)
- Background image positioning and scaling
- Overlay gradients (dark fade on left, lighter on right)
- All text styling (eyebrow, headline colors, squiggle, subtitle)
- Stats bar below hero

### Visual Result

- **Before:** Text hugs left edge, image feels ignored on right
- **After:** Text is center-anchored, image gets equal visual weight, composition feels balanced and intentional

## Testing Checklist

- [ ] Desktop (1280px): Text positioned center-left, image visible and balanced on right
- [ ] Tablet (768px): Text uses 60% width with comfortable padding
- [ ] Mobile (375px): Full-width text with mobile padding, no changes visible
- [ ] No overlap between text and image on any viewport
- [ ] Headline remains readable with adequate contrast against background

## Files Modified

- `components/HeroBanner.tsx` — Update `.hero-text-block` media query for desktop
