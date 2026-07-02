# Stellar Payment Implementation

The app implements the StellarX direction as a civic proof-of-payment module, not as a generic crypto payment product.

## Product position

CivicTrust helps LGUs, barangays, and communities digitize services while using Stellar for verifiable payment receipts, public records, and future civic incentive programs.

The current implemented Stellar scope is **Idea #76: Proof-of-Payment for Government Services**.

## Implemented capabilities

- Tenant-specific Stellar wallet configuration
- Real Testnet wallet generation using `@stellar/stellar-sdk`
- Friendbot account funding for Testnet
- Server-side encrypted tenant secret storage
- Service fee fields on services
- Payment intent creation
- SEP-7 payment URI and QR code generation
- Horizon transaction verification
- Permanent receipt page
- Duplicate transaction prevention
- Payment admin dashboard
- Payment CSV export

## Why SEP-7

SEP-7 allows this app to generate a payment request that the citizen opens in their own wallet. The app does not custody citizen funds and does not handle citizen private keys.

## Verification flow

1. Citizen selects a payable civic service.
2. The app creates a payment intent with a unique reference code.
3. The reference code is used as the Stellar memo.
4. The app generates a SEP-7 `web+stellar:pay` URI.
5. The citizen signs and submits the payment in their own wallet.
6. The app verifies the transaction through Horizon.
7. If the destination, memo, amount, asset, and transaction status match, the payment becomes verified.
8. The transaction hash is stored as the permanent receipt identifier.

## Security decisions

- Citizen private keys are never handled.
- Tenant secret keys are never returned by APIs.
- Tenant secret keys are encrypted with `STELLAR_WALLET_ENCRYPTION_KEY`.
- Public APIs do not return encrypted tenant secrets.
- Transaction hashes are unique to prevent duplicate processing.
- Payment verification is based on Horizon records, not client-provided claims.

## Files added

```text
lib/stellar/config.ts
lib/stellar/keys.ts
lib/stellar/secure-secret.ts
lib/stellar/sep7.ts
lib/stellar/horizon.ts
lib/stellar/verification.ts
services/stellar-wallet-service.ts
pages/api/tenant/[tenantSlug]/stellar/wallet/index.ts
pages/api/tenant/[tenantSlug]/stellar/wallet/generate.ts
pages/api/tenant/[tenantSlug]/stellar/wallet/fund.ts
pages/api/tenant/[tenantSlug]/stellar/wallet/check.ts
```

## Files updated

```text
prisma/schema.prisma
prisma/seed.ts
services/payment-service.ts
components/admin/admin-dashboard.tsx
components/public/payment-checkout.tsx
.env.example
README.md
```

## Future Stellar extensions

The module is separated so the app can later support:

- Civic participation rewards
- Environmental cleanup rewards
- Municipal budget transparency
- Digital property tax receipts

These should be added as civic workflows, not generic crypto features.
