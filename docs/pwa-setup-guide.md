# PWA Setup Guide

CivicTrust is configured as an installable Progressive Web App for mobile-browser demos and early user testing.

## Implemented PWA Pieces

- `public/manifest.webmanifest`
- PNG app icons for 192px, 512px, maskable 512px, and Apple touch icon
- SVG source icon at `public/icons/icon.svg`
- Theme color through Next.js viewport metadata
- Apple mobile web app metadata
- `viewport-fit=cover` for iOS safe-area support
- Production-only service worker registration
- Offline fallback route at `/offline`
- Service worker fallback at `public/sw.js`

## App Identity

Manifest values:

```text
name: CivicTrust Civic Connect
short_name: CivicTrust
display: standalone
orientation: portrait
theme_color: #1a497b
background_color: #f5f7fb
```

The manifest includes shortcuts for:

- Metro City
- Stellar Playground

## How Installability Works

In production, `components/layout/pwa-register.tsx` registers `/sw.js`.

The service worker:

- Caches the offline page and icons.
- Caches visited navigation pages opportunistically.
- Falls back to `/offline` when a navigation request fails.
- Does not cache POST requests.
- Does not try to run API, Prisma, or Stellar server logic offline.

## Testing On Vercel

1. Deploy to Vercel.
2. Open the deployed URL in Chrome.
3. Open DevTools and check **Application > Manifest**.
4. Confirm the icons load.
5. Confirm the service worker is registered.
6. Use Lighthouse or Chrome install prompt checks if desired.
7. Test the installed app from Android Chrome or iPhone Safari.

## Testing Offline Behavior

1. Open the deployed app once while online.
2. Visit `/offline` once to ensure it is cached.
3. Turn on airplane mode.
4. Open a previously visited route or refresh.
5. The app should show cached content or the offline fallback.

Live data features still need a network connection:

- Login
- Report submission
- Admin tools
- Uploads
- Payment creation
- Horizon verification
- Friendbot funding

## Mobile UX Notes

The app shell already uses:

- Centered phone canvas on desktop.
- Full-height mobile layout on phones.
- Safe-area variables for iOS.
- Bottom tab padding so content is not hidden behind navigation.
- 54px controls for tap targets.
- 16px inputs to avoid iOS input zoom.

Focused flows can use `flow={true}` in `PublicShell` to hide bottom tabs when a form or checkout should not be covered.

## Vercel Requirements

Use HTTPS, which Vercel provides automatically. Service workers and install prompts require a secure context, except on localhost.

Set:

```env
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
NEXT_PUBLIC_AUTH_PROVIDER="custom"
```

Clerk environment variables are not required while `NEXT_PUBLIC_AUTH_PROVIDER` remains `custom`.
