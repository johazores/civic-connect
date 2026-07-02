# Real Stellar Testnet Setup Guide

This guide is written for developers who are new to Stellar. The app uses real Stellar Testnet infrastructure for Proof-of-Payment government service receipts. It does **not** use fake transaction hashes, mocked Horizon responses, or simulated payment verification.

## Simple explanation

The civic platform has two wallet concepts:

1. **Tenant receiving wallet** — the city/LGU/barangay wallet that receives service payments.
2. **Citizen wallet** — the user's own Stellar wallet used to pay the service fee.

The app only manages the **tenant receiving wallet**. It never asks citizens for their secret keys. Citizens use their own Stellar-compatible wallet to approve a payment.

## What the confusing fields mean

### Receiving public key

This is the public payment address for the tenant. It starts with `G`.

Example shape:

```text
GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

For normal setup, you should **not type this manually**. Click **Generate Testnet Wallet** in Admin → Settings. The app will create the Testnet wallet and fill this value automatically.

### Secret key import

This is the private/secret key for a Stellar account. It starts with `S`.

Example shape:

```text
SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

For normal setup, leave this blank. Only use this field if you already created a Testnet wallet somewhere else and want to import it.

Important: never share real Mainnet secret keys. For Testnet, this app encrypts the tenant secret key server-side and never returns it to the browser.

## Official Stellar concepts used

- **SEP-7** — creates a `web+stellar:pay` URI/QR that asks the user's wallet to sign and submit a payment.
- **Testnet** — Stellar's safe development network using test XLM only.
- **Friendbot** — Stellar's Testnet funding service.
- **Horizon** — Stellar's API for reading accounts, payments, transactions, and operations.
- **Network passphrase** — prevents Testnet and Mainnet transactions from being mixed.

Useful official docs:

- SEP-7: https://developers.stellar.org/docs/build/apps/wallet/sep7
- Testnet and Friendbot: https://developers.stellar.org/docs/networks
- Horizon overview: https://developers.stellar.org/docs/data/apis/horizon
- Account payments: https://developers.stellar.org/docs/data/apis/horizon/api-reference/get-payments-by-account-id
- Freighter Testnet setup: https://developers.stellar.org/docs/build/guides/freighter/connect-testnet

## Required environment variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

Use values like this for local Testnet development:

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

### What each variable does

| Variable | Meaning |
| --- | --- |
| `DATABASE_URL` | Your PostgreSQL database connection string. Required for Vercel. |
| `ADMIN_JWT_SECRET` | Used for admin session signing. Make this long and private. |
| `STELLAR_WALLET_ENCRYPTION_KEY` | Used to encrypt tenant Stellar secret keys before saving them. Required before wallet generation/import. |
| `NEXT_PUBLIC_APP_URL` | The base URL used in generated links. Use `http://localhost:3000` locally. |
| `STELLAR_NETWORK` | Use `TESTNET` while developing. |
| `STELLAR_HORIZON_URL` | Testnet Horizon API endpoint. |
| `STELLAR_FRIENDBOT_URL` | Testnet funding service endpoint. |
| `STELLAR_NETWORK_PASSPHRASE` | Must match Testnet when using Testnet. |

## Local app setup

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open the app:

```text
http://localhost:3000/metro-city
```

Admin login:

```text
http://localhost:3000/metro-city/admin/login
admin@metrocity.local
admin12345
```

Citizen login:

```text
http://localhost:3000/metro-city/login
sofia.cruz@metrocity.local
citizen12345
```

## Step 1 — Generate the tenant receiving wallet

1. Log in as admin.
2. Go to **Settings**.
3. Find **Real Stellar Testnet wallet**.
4. Do **not** type anything into `Receiving public key` or `Secret key import`.
5. Click **Generate Testnet Wallet**.
6. Wait for the success message.
7. The `Current receiving public key` section should now show a `G...` address.
8. Click **Check Horizon Status**.
9. If Friendbot funding worked, you should see an XLM balance.

If you see this error on the public payment form:

```text
The receiving Stellar wallet is not configured for this service.
```

It means this step has not been completed yet, or the tenant wallet was not saved.

## Step 2 — Make sure a service requires payment

1. Go to **Admin → Content**.
2. Open the **Services** content type.
3. Create or edit a service.
4. Set a realistic service fee.
5. Enable Stellar payment for that service.
6. For first testing, use:
   - Asset code: `XLM`
   - Asset issuer: leave blank
7. Save the service.

## Step 3 — Create a citizen payment request

1. Open:

```text
http://localhost:3000/metro-city/payments
```

2. Select a paid service.
3. Enter citizen details.
4. Submit the form.
5. The app creates a payment intent and shows a payment page with:
   - amount
   - destination `G...` receiving wallet
   - memo/reference code
   - SEP-7 payment URI
   - QR code

## Step 4 — Set up the citizen wallet

Use a Stellar-compatible wallet that supports Testnet. Freighter is the easiest browser wallet to test with.

1. Install Freighter.
2. Create or import a wallet.
3. Switch the wallet network to **Testnet**.
4. Fund the wallet on Testnet. Freighter can prompt for Friendbot funding, or you can use Stellar Lab.

Important: the citizen wallet must be on **Testnet**, not Mainnet.

## Step 5 — Pay using SEP-7

1. On the payment page, click **Open wallet payment** or scan the QR code.
2. Your wallet should show the destination, amount, asset, and memo.
3. Do not change the memo. The memo must match the payment reference code.
4. Confirm and submit the transaction from the wallet.
5. Copy the transaction hash from the wallet.

## Step 6 — Verify the payment

After the wallet submits the transaction:

1. Return to the Civic Connect payment page.
2. Paste the transaction hash.
3. Click **Verify by transaction hash**.
4. The app asks Horizon for the transaction and its payment operations.
5. If everything matches, the app stores the transaction hash permanently and marks the payment as verified.
6. Open the receipt page.

You can also click **Scan Horizon by memo** if the payment was submitted but you do not have the hash yet.

## What verification checks

A payment becomes verified only when Horizon confirms all of these:

- The transaction exists on the configured Stellar network.
- The transaction succeeded.
- The transaction memo matches the payment reference code.
- The transaction contains a payment operation.
- The destination matches the tenant receiving public key.
- The amount matches the service fee.
- The asset matches the expected asset.
- The transaction hash has not already been used by another payment intent.

## Payment statuses

| Status | Meaning |
| --- | --- |
| `PENDING` | Payment request was created and is waiting for a matching Stellar transaction. |
| `VERIFIED` | Horizon verified the transaction and the permanent receipt was created. |
| `FAILED` | Horizon found a failed transaction or verification failed. |
| `EXPIRED` | The payment request expired before successful verification. |
| `CANCELLED` | Reserved for future admin cancellation workflows. |

## Troubleshooting

### The receiving Stellar wallet is not configured for this service

Go to **Admin → Settings → Real Stellar Testnet wallet** and click **Generate Testnet Wallet**. You should see a `G...` public key after generation.

### Receiving public key is blank

That is normal before wallet setup. Click **Generate Testnet Wallet**. Do not manually type random values.

### Secret key import is blank

That is normal. Leave it blank unless importing an existing Testnet wallet.

### Generate wallet fails with encryption key error

Set this in `.env` and restart the app:

```env
STELLAR_WALLET_ENCRYPTION_KEY="replace-this-with-a-long-random-secret"
```

### Friendbot funding failed

Friendbot can rate limit requests. Wait and try again, or fund the account using Stellar Lab.

### Wallet does not open

Make sure your wallet supports SEP-7 and is set to Testnet.

### Transaction not found

Confirm the wallet submitted to Testnet. The app's Horizon URL and the wallet network must both be Testnet.

### Memo mismatch

Do not edit the memo in the wallet. The memo must exactly match the payment reference code.

### Amount mismatch

The paid amount must exactly match the service fee shown on the payment page.

### Duplicate transaction

A transaction hash can verify only one payment intent. Reusing the same hash is blocked.

## Mainnet migration checklist

The current implementation is Testnet-first but structured for Mainnet later. Before Mainnet:

- Change tenant network to `MAINNET`.
- Use `https://horizon.stellar.org` or a production Horizon provider.
- Use Mainnet passphrase: `Public Global Stellar Network ; September 2015`.
- Remove Friendbot usage.
- Use production-grade secret management.
- Add strict admin approval controls for wallet changes.
- Add audit logs for wallet and payment setting changes.
- Review government accounting, compliance, and legal requirements.

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
