# Mobile Demo Guide

This guide assumes the app is already deployed to Vercel. Use it to run a clean phone-browser demo without changing the backend architecture.

## Required Environment Variables

Set these in Vercel:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
ADMIN_JWT_SECRET="replace-this-with-a-long-secure-random-value"
STELLAR_WALLET_ENCRYPTION_KEY="replace-this-with-another-long-secure-random-value"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
NEXT_PUBLIC_AUTH_PROVIDER="custom"
STELLAR_NETWORK="TESTNET"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
STELLAR_FRIENDBOT_URL="https://friendbot.stellar.org"
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

The current production-ready demo uses the custom cookie/JWT auth. Clerk is documented as a migration path, not required.

## Open On Mobile

1. Deploy to Vercel.
2. Open the Vercel production or preview URL on the phone.
3. Start with `/metro-city`.
4. Use Safari on iPhone or Chrome on Android.
5. Keep the phone in portrait orientation for the best app-shell feel.

Good demo routes:

```text
/metro-city
/metro-city/login
/metro-city/dashboard
/metro-city/report
/metro-city/track
/metro-city/payments
/metro-city/civic-actions
/metro-city/transparency
/metro-city/admin/login
/stellar-playground
```

## Add To Home Screen

### iPhone Safari

1. Open the deployed URL in Safari.
2. Tap Share.
3. Tap **Add to Home Screen**.
4. Confirm the name **CivicTrust**.
5. Open the new home-screen icon.

### Android Chrome

1. Open the deployed URL in Chrome.
2. Tap the browser menu.
3. Tap **Install app** or **Add to Home screen**.
4. Confirm installation.
5. Open CivicTrust from the launcher.

## Citizen Demo Flow

Use the seeded Metro City account:

```text
sofia.cruz@metrocity.local
citizen12345
```

Demo path:

1. Open `/metro-city`.
2. Sign in from the top-right account icon.
3. Open **Me** from the bottom tab.
4. Submit a report from the center **Report** tab.
5. Track the generated reference code.
6. Open service payments and create a payment request.
7. Open civic actions and submit a participation or cleanup action.

## Admin Demo Flow

Use the seeded Metro City staff account:

```text
admin@metrocity.local
admin12345
```

Demo path:

1. Open `/metro-city/admin/login`.
2. Sign in.
3. Review reports and filters.
4. Update a report status.
5. Review payments.
6. Open settings and check the Stellar Testnet wallet panel.
7. Review Stellar Programs for rewards, transparency, and tax receipts.

## Stellar Payment Demo Flow

Recommended flow:

1. Configure the tenant Testnet receiving wallet in admin settings.
2. Create a payment request from `/metro-city/payments`.
3. Use desktop Chrome with Freighter on Testnet for the first successful signing demo.
4. Copy the transaction hash from Freighter.
5. Paste it into the payment verification screen.
6. Open the public receipt page.

## Mobile Wallet Limitations

Mobile browsers do not always hand off `web+stellar:pay` links consistently. QR scanning and SEP-7 opening can vary by wallet, browser, and operating system.

For the most reliable demo:

1. Use desktop Chrome plus Freighter first.
2. Confirm the payment and receipt flow.
3. Use the phone demo for the civic app experience, PWA install, report flow, dashboards, and receipt viewing.

## Architecture Reminder

The mobile browser and installed PWA are still the Next.js frontend:

```text
Mobile browser / PWA
Next.js frontend
pages/api backend routes
Prisma / PostgreSQL
Stellar Horizon / Friendbot APIs
```

Do not move Prisma, Stellar signing services, or server-only code into a native shell for the demo.
