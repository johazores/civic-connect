# Mobile Reference UI Redesign

This pass uses the provided high-fidelity mobile app prototype as the main visual reference for CivicTrust.

## Design Direction

The product now follows a mobile-app-first model instead of a wide responsive website model.

### Shell

- Full-screen app on mobile.
- Centered phone-sized app canvas on desktop.
- Scrollable in-app viewport.
- Fixed app-style top bar.
- Bottom tab navigation inside the app frame.
- Center action button for the most important action: reporting an issue.

### Visual System

- Navy primary palette for trust and civic authority.
- Ember accent for high-priority action and active tab emphasis.
- Teal/blue/gold trust gradient for Stellar verification and progress indicators.
- White card surfaces over a soft blue-gray app background.
- Dark presentation background on desktop to make the app feel like a polished product demo.

### Typography

- Display typography uses a Sora-style stack with a safe local fallback.
- Body typography uses an Inter-style stack with system fallback.
- Headings use tighter tracking and stronger hierarchy.
- Labels use uppercase microcopy only where it improves scanning.

### Interaction Patterns

- App-like tap targets.
- Active tab indicator.
- Center floating report tab.
- Menu grouped by user intent: Services, Requests, Civic Trust, Updates.
- Feed-style cards for mobile scanning.
- Subtle transitions and active states.

## Pages Affected

- Root project selector.
- Public tenant landing pages.
- Citizen pages.
- Admin login.
- Admin operations dashboard.
- Shared cards, buttons, forms, stats, badges, menus, and bottom navigation.

## Why This Improves UX

The older layout felt like a generic website/dashboard. This redesign makes the product feel closer to a real mobile civic app:

- Users always know the primary actions: Home, Track, Report, Pay, Me.
- Desktop does not expand into a confusing admin layout; it still previews the product as an app.
- The hero section now feels like a live civic activity feed instead of a static marketing banner.
- The Stellar layer is presented as a trust feature, not as a crypto dashboard.
- The admin area is still functional but visually contained in the same mobile-first product shell.

## Notes

This redesign does not copy the reference app directly. It borrows the product design principles: phone canvas, pulse card, bottom tab navigation, feed cards, grouped menus, rounded app cards, and strong visual hierarchy.
