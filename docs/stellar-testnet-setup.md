# Real Stellar Testnet Setup Guide

This project uses real Stellar Testnet infrastructure for Proof-of-Payment government service receipts. It does not use fake transaction hashes, mocked Horizon responses, or simulated payment verification.

## What the module does

The Stellar payment module supports:

- Tenant-specific receiving wallets
- Real Stellar Testnet account generation
- Friendbot funding for Testnet accounts
- SEP-7 payment URI generation
- QR code generation for wallet handoff
- Horizon transaction lookup and operation verification
- Permanent transaction hash storage
- Duplicate transaction prevention
- Pending, failed, expired, and verified payment states

The application never asks citizens for private keys. Citizens pay using their own Stellar-compatible wallet. Tenant secret keys are only used for tenant wallet management and are encrypted before storage.

## Official Stellar concepts used

- SEP-7 `web+stellar:pay` URI for wallet handoff
- Stellar Testnet for safe development and testing
- Friendbot for funding Testnet accounts
- Horizon API for reading accounts, transactions, and operations
- Stellar network passphrase for Testnet/Mainnet separation

Useful official links:

- SEP-7: https://developers.stellar.org/docs/build/apps/wallet/sep7
- Networks, Testnet, Friendbot, passphrases: https://developers.stellar.org/docs/networks
- Horizon payments: https://developers.stellar.org/docs/data/apis/horizon/api-reference/list-all-payments
- Account transactions: https://developers.stellar.org/docs/data/apis/horizon/api-reference/get-transactions-by-account-id
- Freighter Testnet guide: https://developers.stellar.org/docs/build/guides/freighter/connect-testnet

## Environment variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Required values:

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

`STELLAR_WALLET_ENCRYPTION_KEY` is required before storing tenant secret keys. Use a long random value. In production, set it in Vercel environment variables and do not commit it.

## Local setup

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000/metro-city
```

Admin:

```text
http://localhost:3000/metro-city/admin/login
admin@metrocity.local
admin12345
```

Citizen:

```text
http://localhost:3000/metro-city/login
sofia.cruz@metrocity.local
citizen12345
```

## Create a tenant receiving wallet

1. Log in to the admin portal.
2. Go to **Settings**.
3. Find **Real Stellar Testnet wallet**.
4. Click **Generate Testnet Wallet**.
5. The server generates a real Stellar keypair using the Stellar SDK.
6. The secret key is encrypted and stored server-side.
7. The public key is saved as the tenant receiving wallet.
8. The app requests Testnet XLM from Friendbot.
9. Click **Check Horizon Status** to confirm the account exists and has balance.

The API never returns the encrypted secret or plain secret key to the browser.

## Import an existing Testnet wallet

1. Go to **Admin → Settings → Real Stellar Testnet wallet**.
2. Enter a valid `G...` public key.
3. Optionally enter the matching `S...` secret key.
4. Click **Save Wallet Config**.
5. If a secret key is provided, the server derives the public key from the secret and stores the secret encrypted.
6. Click **Check Horizon Status**.

For Mainnet, use an externally controlled treasury process and avoid keeping high-value operational secrets inside the app.

## Complete a real end-to-end payment

1. Configure and fund a tenant receiving Testnet wallet.
2. Make sure at least one service has:
   - `Require Stellar payment` enabled
   - a fee amount greater than zero
   - `XLM` as the asset code for the first test
3. Go to:

```text
http://localhost:3000/metro-city/payments
```

4. Create a payment request.
5. Open the generated payment page.
6. Scan the QR code or click **Open wallet payment**.
7. Use a Stellar-compatible wallet set to Testnet.
8. Confirm the destination, amount, asset, and memo.
9. Submit the transaction from the wallet.
10. Copy the transaction hash from the wallet or explorer.
11. Paste the hash into the payment page and click **Verify by transaction hash**.
12. Alternatively, click **Scan Horizon by memo** after the wallet submits the payment.
13. The app verifies the transaction using Horizon and stores the transaction hash permanently.
14. Open the receipt page.

## What verification checks

A payment is only marked as verified when Horizon confirms all of these:

- The transaction exists on the configured Stellar network.
- The transaction was successful.
- The transaction memo matches the payment intent reference code.
- A payment operation exists in the transaction.
- The payment operation destination matches the tenant receiving public key.
- The amount matches the service fee.
- The asset matches the expected asset.
- The transaction hash has not already been used by another payment intent.

## Payment statuses

- `PENDING` — payment intent created, waiting for a matching transaction.
- `VERIFIED` — Horizon confirmed the transaction and the hash is stored.
- `FAILED` — Horizon found a submitted transaction that was not successful.
- `EXPIRED` — the payment request expired before verification.
- `CANCELLED` — reserved for future admin cancellation workflows.

A bad or unrelated transaction hash does not automatically mark the intent as permanently failed. The payment remains pending and records the latest verification issue.

## Troubleshooting

### Friendbot rate limit

Friendbot can rate limit requests. Wait and try again, or fund the account using Stellar Lab.

### Wallet does not open from SEP-7 URI

Make sure the wallet supports SEP-7 and is configured for Testnet. Freighter requires switching to Testnet before submitting Testnet transactions.

### Transaction not found

Confirm that the transaction was submitted to Testnet and not Mainnet. The Horizon URL and wallet network must match.

### Memo mismatch

The memo must exactly match the payment reference code. Do not edit the memo in the wallet.

### Amount mismatch

The amount must match the service fee. Create a new payment request if the service fee changed.

### Duplicate transaction

A Stellar transaction hash can only verify one payment intent. Reusing the same transaction hash for another payment is blocked.

## Mainnet migration checklist

The current implementation is Testnet-first but Mainnet-ready in structure. Before Mainnet:

- Change the tenant network to `MAINNET`.
- Use `https://horizon.stellar.org` or a production Horizon provider.
- Use the Mainnet passphrase: `Public Global Stellar Network ; September 2015`.
- Remove Friendbot usage.
- Use production-grade secret management.
- Add admin approval controls for wallet changes.
- Add audit logs for every wallet and payment setting change.
- Review compliance, accounting, and government policy requirements.

## Module structure

```text
lib/stellar/config.ts              Network, Horizon, Friendbot, passphrase configuration
lib/stellar/keys.ts                Keypair generation and key validation
lib/stellar/secure-secret.ts       Server-side secret encryption/decryption
lib/stellar/sep7.ts                SEP-7 payment URI generation
lib/stellar/horizon.ts             Horizon account, transaction, and operation reads
lib/stellar/verification.ts        Transaction verification rules
services/stellar-wallet-service.ts Tenant wallet management
services/payment-service.ts        Payment intents and receipt verification
```
