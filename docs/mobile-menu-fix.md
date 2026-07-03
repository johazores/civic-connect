# Mobile Menu Fix

## Problem

The navigation menu was rendered from inside the header using an absolutely positioned dropdown panel. Because it lived inside the app header/stacking context, the main scroll viewport could visually overlap it. On mobile-sized screens this made the menu look clipped and caused the fixed bottom tab bar to cover the bottom of the menu.

## Fix

The menu is now implemented as a full app overlay using the same mobile-app shell direction as the HTML reference:

- fixed overlay above the full app canvas
- independent scroll region inside the menu
- no dependency on the header height or page scroll container
- higher z-index than the app viewport and bottom tab bar
- safe-area-aware spacing
- app-style top bar and close button
- smooth backdrop and panel animations
- escape key support
- body scroll lock while the menu is open

## Updated files

- `components/layout/mobile-menu.tsx`
- `app/globals.css`

## Behavior

On phones, the menu covers the full app viewport. On desktop, it is centered over the same phone-sized app canvas so it matches the product's mobile-first presentation style.
