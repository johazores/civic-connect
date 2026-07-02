# Testing Guide

## Automated Checks

```bash
npm run lint
npm run typecheck
npm run build
npm run verify
```

## Public Portal Checks

Open:

```text
/metro-city
/metro-city/report
/metro-city/track
/metro-city/services
/metro-city/hotlines
/metro-city/news
/metro-city/login
/metro-city/register
/metro-city/dashboard
```

Confirm:

- Layout is responsive on mobile and desktop.
- Hamburger menu opens and closes correctly.
- Buttons have readable contrast.
- Forms are usable on mobile.
- No horizontal overflow appears.

## Citizen Flow

1. Register a citizen account.
2. Submit a report while signed in.
3. Confirm the success screen shows a reference number.
4. Open the dashboard.
5. Confirm the report appears in report history.
6. Open the tracker from the report card.

## Guest Report Flow

1. Sign out.
2. Submit a report.
3. Save the generated reference number.
4. Open the tracker.
5. Confirm the report can be searched by reference number.

## Staff Flow

1. Sign in to the staff portal.
2. Filter reports.
3. Select a report.
4. Assign a department.
5. Change status and priority.
6. Add a public update.
7. Confirm the tracker shows the public update.
8. Add an internal note.
9. Confirm the internal note stays in the staff portal.
10. Export CSV.

## CRUD Flow

For each content type, create, edit, archive, and refresh:

- Services
- Hotlines
- News
- Report categories
- Departments
- Staff users

## Multitenancy Checks

1. Create or edit records in `/metro-city/admin`.
2. Open `/laguna-province/admin`.
3. Confirm the records are isolated by tenant.

## Real Stellar Testnet Payment Test

1. Start the app with a real PostgreSQL database.
2. Log in as staff.
3. Open **Settings**.
4. Click **Generate Testnet Wallet**.
5. Click **Check Horizon Status** and confirm the wallet has an XLM balance.
6. Open **Content → Services** and confirm at least one service requires Stellar payment and has a fee.
7. Open the public `/payments` page.
8. Create a payment intent.
9. Scan the QR code or open the SEP-7 URI in a Stellar wallet configured for Testnet.
10. Submit the wallet transaction.
11. Paste the transaction hash and verify, or click **Scan Horizon by memo**.
12. Confirm the payment changes to `VERIFIED`.
13. Open the receipt page and confirm the hash, ledger, amount, and memo are shown.
14. Try using the same transaction hash on another payment intent and confirm it is blocked.
