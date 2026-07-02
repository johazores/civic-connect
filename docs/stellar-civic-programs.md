# Stellar Civic Programs Guide

This module expands the civic platform beyond proof-of-payment by adding four StellarX-aligned civic workflows:

1. Civic Participation Rewards — verified attendance or civic action can trigger a small reward.
2. Environmental Cleanup Rewards — cleanup submissions can be reviewed and rewarded.
3. Municipal Budget Transparency — public allocations and disbursements can be tracked with Stellar transaction hashes.
4. Digital Property Tax Receipts — issued tax receipts can include a permanent Stellar transaction hash.

The product is still a civic services platform. Stellar is used as the trust layer for payment proof, reward payout proof, public fund traceability, and receipt verification.

## Official Stellar concepts used

- SEP-7 Pay URI: used for citizen-paid government services. The app generates `web+stellar:pay` links and QR codes so the citizen signs with their own wallet. The app never asks for the citizen secret key.
- Horizon: used to verify transactions, payments, memos, ledgers, and transaction hashes.
- Testnet: used for real end-to-end testing without mainnet value.
- Native XLM: used by default because XLM does not require an issuer or trustline.
- Custom assets / USDC-style rewards: supported by asset code + issuer public key, but recipients need the proper trustline before receiving non-XLM assets.

Official references:

- Stellar SEP-7: https://developers.stellar.org/docs/build/apps/wallet/sep7
- Stellar payment app tutorial: https://developers.stellar.org/docs/build/apps/example-application-tutorial
- Stellar Testnet and Friendbot: https://developers.stellar.org/docs/networks
- Stellar assets and trustlines: https://developers.stellar.org/docs/tokens/how-to-issue-an-asset
- Stellar Horizon: https://developers.stellar.org/docs/data/apis/horizon

## Environment setup

Use the same environment settings from the existing Stellar payment module:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
ADMIN_JWT_SECRET="replace-this-with-a-long-secure-random-value"
STELLAR_WALLET_ENCRYPTION_KEY="replace-this-with-another-long-secure-random-value"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STELLAR_NETWORK="TESTNET"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
STELLAR_FRIENDBOT_URL="https://friendbot.stellar.org"
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

## Required first step: configure tenant wallet

Before rewards or public disbursements can be paid, configure the tenant Stellar Testnet wallet.

1. Login as staff.
2. Open `Admin → Settings`.
3. Go to `Real Stellar Testnet wallet`.
4. Click `Generate New Testnet Wallet`.
5. Confirm the screen shows a `G...` receiving public key.
6. Confirm Friendbot funding completed.
7. Click `Check Horizon Status`.

The tenant wallet is used as:

- the receiving wallet for government service payments;
- the source wallet for civic reward payouts;
- the source wallet for public disbursement records.

The encrypted `S...` secret key is stored server-side only. It is never exposed to the browser.

## Public routes

```text
/[tenant]/civic-actions
/[tenant]/transparency
/[tenant]/tax-receipts
/[tenant]/tax-receipts/[referenceCode]
```

## Admin route

```text
/[tenant]/admin → Stellar Programs
```

Inside `Stellar Programs`, staff can manage:

- Civic Rewards
- Transparency Ledger
- Tax Receipts

## Civic Participation Rewards

### Citizen flow

1. Citizen opens `/[tenant]/civic-actions`.
2. Citizen chooses `Civic participation / attendance`.
3. Citizen enters title, description, location, contact details, and optional proof URL.
4. Citizen enters their Stellar Testnet public key that starts with `G...`.
5. App creates a pending civic action record with a short Stellar memo reference.

### Staff flow

1. Staff opens `Admin → Stellar Programs → Civic Rewards`.
2. Staff reviews the action.
3. Staff adds a verification note.
4. Staff confirms the reward amount and asset.
5. Staff clicks `Approve`.
6. Staff clicks `Send reward`.
7. App signs a real Stellar Testnet payment from the tenant wallet to the citizen wallet.
8. App stores the transaction hash, ledger, paid date, and reward status.

### Stellar usage

- Uses tenant encrypted secret key to sign reward payout.
- Uses Horizon-compatible transaction submission through the Stellar SDK.
- Stores transaction hash permanently on the civic action.
- Prevents duplicate payout by refusing to pay if a reward transaction already exists.

## Environmental Cleanup Rewards

Cleanup rewards use the same civic action model with `type = CLEANUP`.

### Citizen flow

1. Citizen opens `/[tenant]/civic-actions`.
2. Citizen chooses `Environmental cleanup`.
3. Citizen provides cleanup description, location, optional photo/proof URL, and reward wallet.
4. Staff reviews evidence before approval.

### Staff flow

1. Staff verifies proof, photo, and location.
2. Staff approves or rejects the cleanup submission.
3. Approved cleanup records can be rewarded with Stellar.

### USDC note

The system supports `assetCode` and `assetIssuer`, so a USDC-like Testnet asset can be configured later. For the safest beginner setup, use XLM first. For non-XLM assets, the recipient wallet must trust the issuer asset before receiving funds.

## Municipal Budget Transparency

### Public flow

Citizens open `/[tenant]/transparency` to see:

- budget allocations;
- public disbursements;
- procurement records;
- grants;
- operating expenses;
- Stellar transaction hashes when attached.

### Staff flow

1. Staff opens `Admin → Stellar Programs → Transparency Ledger`.
2. Staff creates a public transparency record.
3. If this is only an informational record, staff can publish it without a transaction hash.
4. If this is a real disbursement, staff enters a recipient Stellar public key.
5. Staff clicks `Send Stellar disbursement`.
6. App signs and submits a real Stellar Testnet payment.
7. App stores the transaction hash and ledger.
8. Public page marks the record as `Verified on Stellar`.

### Stellar usage

- Public record uses a short reference code as the memo.
- Transaction hash is displayed publicly.
- Horizon can be used independently to verify the transaction.

## Digital Property Tax Receipts

### Staff flow

1. Staff opens `Admin → Stellar Programs → Tax Receipts`.
2. Staff creates a property tax receipt record.
3. Staff enters taxpayer name, property index number, property address, tax year, amount, and optional transaction hash.
4. Staff saves the receipt.

### Public flow

1. Citizen opens `/[tenant]/tax-receipts`.
2. Citizen searches by reference code, taxpayer, email, or property index number.
3. Citizen opens the public receipt.
4. If the receipt has a Stellar transaction hash, the page displays it as permanent proof.

### Stellar usage

The current implementation supports attaching verified transaction hashes to property tax receipts. The next enhancement can automatically create a property-tax-specific SEP-7 payment intent, then issue the receipt after Horizon verification.

## Data model summary

New models:

- `CivicAction`
- `TransparencyEntry`
- `PropertyTaxReceipt`

New enums:

- `CivicActionType`
- `CivicActionStatus`
- `TransparencyEntryType`
- `TransparencyEntryStatus`
- `PropertyTaxReceiptStatus`

## API summary

```text
GET  /api/tenant/[tenantSlug]/civic-actions
POST /api/tenant/[tenantSlug]/civic-actions
PATCH /api/tenant/[tenantSlug]/civic-actions/[id]
POST /api/tenant/[tenantSlug]/civic-actions/[id]

GET  /api/tenant/[tenantSlug]/transparency
POST /api/tenant/[tenantSlug]/transparency
PATCH /api/tenant/[tenantSlug]/transparency/[id]
POST /api/tenant/[tenantSlug]/transparency/[id]
DELETE /api/tenant/[tenantSlug]/transparency/[id]

GET  /api/tenant/[tenantSlug]/tax-receipts
POST /api/tenant/[tenantSlug]/tax-receipts
PATCH /api/tenant/[tenantSlug]/tax-receipts/[id]
DELETE /api/tenant/[tenantSlug]/tax-receipts/[id]
```

## Testing complete flow

### Reward payout test

1. Start the app.
2. Login as staff.
3. Generate/fund tenant Testnet wallet.
4. Create another Testnet wallet in a Stellar-compatible wallet or Stellar Lab.
5. Submit a civic action from `/[tenant]/civic-actions` using that recipient `G...` public key.
6. Open admin `Stellar Programs → Civic Rewards`.
7. Approve the action.
8. Click `Send reward`.
9. Copy the transaction hash.
10. Verify it in Horizon or Stellar Expert Testnet.

### Transparency disbursement test

1. Open admin `Stellar Programs → Transparency Ledger`.
2. Create a public disbursement with a recipient `G...` public key.
3. Click `Send Stellar disbursement`.
4. Open `/[tenant]/transparency`.
5. Confirm the transaction hash is visible.

### Tax receipt test

1. Open admin `Stellar Programs → Tax Receipts`.
2. Create a receipt.
3. Add a transaction hash when available.
4. Open `/[tenant]/tax-receipts`.
5. Search for the receipt reference.
6. Open the public receipt page.

## Production notes

- Keep using Testnet until the entire flow is tested.
- Do not expose tenant secret keys to the browser.
- Use a strong `STELLAR_WALLET_ENCRYPTION_KEY`.
- Use XLM for the first complete test because it does not require issuer/trustline setup.
- For USDC or custom assets, configure asset code, issuer, distribution funding, and recipient trustlines first.
- For Mainnet migration, switch network passphrase, Horizon URL, and operational wallet funding carefully.
