# StellarX Payment Implementation

## Positioning

CivicTrust remains a multitenant civic services platform. Stellar is used only as a trust layer for government service payments, receipt verification, and future civic reward/transparency modules.

This implementation aligns with **Idea #76: Proof-of-Payment for Government Services**.

## What is implemented

- Service fee fields on public services
- Tenant-level Stellar Testnet payment settings
- Tenant receiving wallet public key
- Payment intent records
- SEP-7 payment URI generation
- QR code generation for the SEP-7 URI
- Stellar Horizon transaction verification
- Permanent transaction hash storage
- Public receipt pages
- Staff payment management dashboard
- CSV export for payment records

## What the app does not do

The app does **not**:

- Store private keys
- Sign transactions
- Submit transactions for the citizen
- Act as a wallet
- Act as a generic crypto payment platform
- Support donations, crowdfunding, DAO/voting, escrow, or NFTs

Citizens complete payments with their own Stellar-compatible wallet. The platform only creates the payment request and verifies the resulting transaction.

## Data model

### Tenant

Each tenant can configure:

- `stellarReceivingPublicKey`
- `stellarNetwork`
- `stellarHorizonUrl`
- `stellarDefaultAssetCode`
- `stellarDefaultAssetIssuer`

### Service

Each service can configure:

- `paymentRequired`
- `feeAmount`
- `feeAssetCode`
- `feeAssetIssuer`
- `receivingPublicKey`

If a service does not define its own receiving wallet, it uses the tenant receiving wallet.

### PaymentIntent

Each payment request stores:

- tenant
- citizen, when signed in
- service
- payer details
- amount and asset
- destination wallet
- memo/reference
- SEP-7 URI
- transaction hash
- payer public key
- ledger
- paid/verified timestamps
- status

## User flow

1. Citizen opens `/[tenant]/payments`.
2. Citizen selects a paid service.
3. App creates a payment intent with a unique reference code and memo.
4. Citizen scans the QR code or opens the SEP-7 URI.
5. Citizen pays from their Stellar-compatible Testnet wallet.
6. Citizen pastes the transaction hash.
7. App verifies the payment through Horizon.
8. App stores the transaction hash and ledger details.
9. Citizen can open `/[tenant]/receipts/[referenceCode]` as a public receipt.

## Staff flow

1. Staff opens the admin dashboard.
2. Staff selects the **Payments** tab.
3. Staff can search/filter Stellar payment records.
4. Staff can open payment pages or public receipts.
5. Staff can export payment records to CSV.
6. Staff can configure Stellar settings under **Settings**.
7. Staff can configure service fees under **Content → Services**.

## Testnet setup

For local or Vercel testing:

1. Create or choose a Stellar Testnet receiving account.
2. Fund it using the Stellar Testnet Friendbot or Stellar Lab.
3. Add the public key to tenant settings.
4. Keep the network as `TESTNET`.
5. Keep the Horizon URL as `https://horizon-testnet.stellar.org`.

## Verification rules

A payment verifies only when Horizon confirms:

- transaction exists
- transaction is successful
- memo matches the payment reference
- a payment operation exists
- destination matches the configured receiving wallet
- amount matches the service fee
- asset matches the expected asset

## Future-ready modules

The payment module is isolated so later StellarX ideas can reuse the same tenant-aware trust infrastructure:

- Civic Participation Rewards
- Environmental Cleanup Rewards
- Municipal Budget Transparency
- Digital Property Tax Receipts
