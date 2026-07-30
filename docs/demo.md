# Demo Guide

This guide is for local or isolated demonstration environments only. Replace all seeded credentials before any shared or real deployment.

## Local routes

```text
http://localhost:3000/metro-city
http://localhost:3000/laguna-province
```

## Seeded staff accounts

### Metro City

```text
Route: /metro-city/admin/login
Email: admin@metrocity.local
Password: admin12345
```

### Laguna Province

```text
Route: /laguna-province/admin/login
Email: admin@laguna.local
Password: admin12345
```

## Seeded citizen accounts

### Metro City

```text
Route: /metro-city/login
Email: sofia.cruz@metrocity.local
Password: citizen12345
```

### Laguna Province

```text
Route: /laguna-province/login
Email: ana.reyes@laguna.local
Password: citizen12345
```

## Suggested demo flow

1. Open the tenant landing page on a mobile-sized viewport.
2. Browse services, news, and emergency hotlines.
3. Submit a citizen report with a safe sample image.
4. Copy the generated reference number and use the public tracker.
5. Sign in as the seeded citizen and show report history.
6. Sign in as staff and review the report queue.
7. Assign a department, update priority and status, and add public and internal notes.
8. Open service fees and the Stellar testnet payment flow.
9. Generate or fund a tenant testnet wallet when required.
10. Create a payment intent, show the SEP-7 QR, verify a testnet transaction, and open the public receipt.

## PWA demo

Use the deployed test environment on iPhone Safari or Android Chrome and add it to the home screen. Show the mobile app shell, safe-area handling, bottom navigation, and offline fallback.

## Important statements

- Seeded credentials are development-only.
- Stellar modules use testnet.
- Testnet assets have no real monetary value.
- Public receipts demonstrate verifiable transaction records, not production government payment approval.
- Production deployment requires security, privacy, accessibility, operational, and legal review.
