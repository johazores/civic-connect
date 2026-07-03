# Reference App Shell Navigation Fix

This pass fixes the navigation and button issues found after applying the mobile app direction.

## Root cause

The previous menu still behaved like an overlay/dropdown layered on top of the current page. Inside a phone-sized app frame with its own scrollable viewport and fixed bottom navigation, that approach caused clipping, overlapping content, visible scrollbars, and bottom navigation coverage.

The uploaded reference uses a stricter app-shell pattern:

- a fixed/full-height mobile canvas
- a dedicated viewport for screens
- independent scroll containers
- bottom tab navigation
- full pushed screens for secondary views such as profile/settings/menu
- zero-width scrollbars
- safe-area padding for bottom navigation

## Fix implemented

The menu is now treated like a real app screen instead of a floating dropdown.

- Opens as a full-screen app panel.
- Uses the same phone-sized canvas on desktop.
- Has its own top app bar and scroll container.
- No translucent floating card that can be clipped.
- No bottom navigation overlap while the menu is open.
- Body scroll is locked while open.
- Escape key closes the menu.
- Links close the menu after navigation.
- Scrollbars are hidden to match the reference app feel.

## Button safety

A global button safety layer was added so app buttons cannot render as white background with white text.

Standard app button classes:

- `app-btn app-btn-primary`
- `app-btn app-btn-secondary`
- `app-btn app-btn-accent`

Existing project button classes are also normalized:

- `btn-primary`
- `btn-secondary`
- `btn-accent`

The app frame now overrides bad white-on-white combinations to preserve readability.

## Files updated

- `components/layout/mobile-menu.tsx`
- `components/public/hero-section.tsx`
- `app/globals.css`

## Verification

The following checks passed after the fix:

```bash
npm run lint
npm run typecheck
npm run build
```
