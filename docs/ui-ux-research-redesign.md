# UI/UX Research-Led Redesign

## Design direction

The application now follows a stronger product direction: **CivicTrust OS** — a mobile-first civic SaaS interface that combines the clarity expected from government services with the engagement patterns of modern social and productivity apps.

The goal is not to look like a generic city website or a crypto dashboard. The platform should feel like a polished citizen-service operating system where residents can report, track, pay, verify, and participate.

## Research inputs used

### Navigation

- Desktop navigation should remain visible when there is enough screen space. Hiding everything behind a hamburger on desktop removes context and makes the product harder to understand.
- Mobile navigation should prioritize content and keep common actions discoverable without taking too much screen space.
- A bottom tab bar works well for a small number of high-frequency mobile destinations.

Applied decisions:

- Desktop keeps visible top-level categories: Home, Services, Requests, Civic Trust, Updates.
- Larger groups use compact dropdown panels instead of showing every route in the header.
- Mobile keeps five bottom tabs: Home, Report, Track, Pay, Me.
- The hamburger menu is used only for secondary navigation and deeper routes.

### Civic trust and government usability

Government services need trust, clarity, accessibility, and plain language. Users should immediately understand what service they are using, what action is available, and what happens next.

Applied decisions:

- The tenant identity is visible on every public page.
- Primary actions use plain verbs: Report, Track, Pay, Verify, Search.
- Cards separate civic actions, payments, receipts, transparency, and updates.
- Empty/error states use human-readable messages instead of technical language.

### Modern SaaS visual system

Modern SaaS interfaces rely on strong spacing, layered surfaces, readable type hierarchy, purposeful color, clear cards, and controlled motion.

Applied decisions:

- Replaced the old flat/generic palette with blue + teal civic trust colors, slate text, soft gradients, and restrained accent colors.
- Replaced plain cards with elevated, layered cards.
- Added `brand-panel`, `feed-card`, `surface-card`, status pills, and consistent form inputs.
- Added subtle motion classes: `animate-rise`, `animate-scale`, and hover transitions.
- Removed harsh black/violet combinations and low-contrast color treatments.

## Design system

### Color roles

| Role | Purpose |
| --- | --- |
| Civic blue | Primary actions, navigation, service identity |
| Teal | Trust, verification, success, Stellar proof layer |
| Slate | Text hierarchy and neutral UI |
| Amber | Warnings and review states |
| Rose | Emergency and destructive states |
| White / blue-tinted surfaces | Cards, panels, menus, and app shell |

### Typography

The typography stack now prioritizes modern UI fonts:

```css
Inter, Aptos, Segoe UI Variable, Segoe UI, system-ui, sans-serif
```

Display headings use tighter tracking and heavier weight to create a premium SaaS hierarchy without relying on decorative fonts.

### Components updated

- Public shell
- Desktop grouped navigation
- Mobile hamburger menu
- Mobile bottom tab bar
- Hero section
- Civic trust panel
- Community feed preview
- Quick action cards
- Buttons
- Inputs
- Textareas
- Selects
- Cards
- Stat cards
- Hotline cards
- Home quick links
- Stellar trust section

## Mobile-first behavior

Mobile now behaves more like an app:

- Sticky bottom tab bar for primary actions.
- Floating, rounded bottom navigation with icons and labels.
- Menu sheet uses grouped sections and quick actions.
- Main layout has safe bottom spacing so content is not hidden behind the fixed nav.
- Cards use social-style feed patterns, compact metadata, badges, and clear action buttons.

## Accessibility improvements

- Better text contrast across navigation, cards, forms, and badges.
- No light text on light panels.
- Clear focus rings on form controls and buttons.
- Larger mobile tap targets.
- Reduced-motion support preserved.
- Navigation labels remain visible with icons.

## What changed technically

Updated files include:

```text
app/globals.css
app/[tenant]/page.tsx
components/layout/public-shell.tsx
components/layout/mobile-menu.tsx
components/public/hero-section.tsx
components/public/hotlines-section.tsx
components/ui/button.tsx
components/ui/card.tsx
components/ui/input.tsx
components/ui/select.tsx
components/ui/stat-card.tsx
prisma/seed.ts
```

## Validation

The redesign was checked with:

```bash
npm run lint
npm run typecheck
npm run build
```

All three passed in this environment.
