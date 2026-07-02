# UI Redesign Notes

This pass replaces the previous harsh/neon visual direction with a cleaner premium civic SaaS design system.

## Design direction

The product should feel trustworthy, modern, mobile-first, and polished enough for a customer or investor demo.

The updated visual system uses:

- White and glass-like cards over a soft blue civic background
- A blue/cyan primary accent instead of violet/black combinations
- High-contrast slate text for readability
- Softer shadows and cleaner rounded cards
- More consistent spacing across public and admin screens
- A proper hamburger menu for mobile navigation
- A more premium system font stack using Aptos / Segoe UI Variable fallbacks

## Color rules

Avoid:

- Violet backgrounds with black buttons
- Light text on light backgrounds
- Neon accents as the main visual language
- Overly dark hero/card panels on citizen-facing pages
- Low-contrast secondary text

Use:

- Primary action: blue to cyan gradient
- Secondary action: white surface with slate text
- Status colors only where meaningful: blue, amber, emerald, rose
- White surfaces with subtle blue/cyan highlights

## Mobile UX

The public header now uses a hamburger menu on mobile instead of horizontal scrolling navigation.

Mobile priorities:

1. Keep header compact.
2. Avoid overflow.
3. Make buttons full-width where helpful.
4. Keep report forms readable.
5. Keep cards stacked with enough spacing.
6. Avoid hover-only interactions.

## Typography

The previous typography felt generic. The app now uses a more polished font stack:

```css
Aptos, Segoe UI Variable, Segoe UI, Inter, system-ui
```

No font files are bundled. This keeps the project deploy-safe and avoids licensing issues.

## Verified checks

The following passed after the redesign:

```bash
npm run lint
npm run typecheck
npm run build
npm run verify
```
