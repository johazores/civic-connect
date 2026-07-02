# UI and Navigation Redesign Notes

This pass focuses on reducing navigation overload and making the public portal feel closer to a polished civic SaaS and mobile citizen app.

## Desktop Header

The desktop header no longer lists every page as a flat row of links. That created too much visual noise and made the product feel unfinished.

The header now uses a smaller top-level structure:

- Home
- Services
- Requests
- Civic Trust
- Updates
- Sign in
- Report issue

Each top-level category opens a focused submenu with short descriptions. This keeps the header clean while still giving access to every important feature.

## Desktop Navigation Groups

### Services

Includes:

- Service directory
- Service payments
- Tax receipts

### Requests

Includes:

- Report an issue
- Track request
- My account

### Civic Trust

Includes:

- Civic rewards
- Budget transparency

### Updates

Includes:

- News
- Hotlines

## Mobile Experience

The mobile experience now behaves more like an app instead of a compressed website.

Changes include:

- A proper hamburger menu with grouped navigation
- A mobile bottom tab bar for the most common actions
- Quick access to Home, Report, Track, Pay, and Account
- Rounded app-style cards
- Community-feed style announcement cards
- More thumb-friendly spacing and tap targets

## Landing Page Improvements

The landing page has been restructured to feel more engaging and product-led.

Added sections:

- Stronger hero layout
- Quick action cards
- Community feed preview
- Stellar trust layer panel
- Most requested services
- Tap-to-call hotlines
- Official update feed

The goal is to make the app feel like a civic operating system, not a static government website.

## Design Direction

The current direction uses:

- Clean white surfaces
- Slate text
- Blue/cyan primary actions
- Emerald trust accents
- Minimal dark panels only for Stellar/trust highlights
- Rounded SaaS-style cards
- Soft shadows
- Larger mobile tap targets

Avoid:

- Long flat nav bars
- Violet backgrounds
- Black primary buttons
- Overcrowded headers
- Generic admin-dashboard visuals on public pages
- Low contrast combinations

## Build Status

The redesign was checked with:

```bash
npm run lint
npm run typecheck
npm run build
```
