# Stellar Playground Guide

The Stellar Playground lives at:

```text
/stellar-playground
```

It is a Testnet-only learning tool for the CivicTrust app. It is not a production wallet, does not support Mainnet funds, and must never be used with real wallet recovery phrases or real private keys.

## What the playground does

The playground teaches the payment flow used by the civic product:

1. Create or import a disposable Stellar Testnet learning wallet.
2. Optionally save the Testnet secret key in browser storage encrypted with a local password.
3. Fund the Testnet account with Friendbot.
4. Generate a SEP-7 `web+stellar:pay` payment request.
5. Open or copy the payment request for a wallet such as Freighter.
6. Verify a real transaction hash through Horizon Testnet.

No mock transaction hashes are used. Verification depends on Horizon finding a real Testnet transaction.

## Playground wallet vs Freighter

The playground wallet is for education only. It helps beginners see what a `G...` public key and `S...` secret key look like.

Freighter is still recommended for real signing tests because it keeps the payer wallet inside a dedicated wallet extension. The civic app should create payment requests and verify transaction hashes, not custody a user's wallet.

In the production civic flow, the tenant wallet is the receiving wallet. The resident or payer uses their own wallet, usually Freighter, to sign and submit payment.

## Required environment variables

Use Testnet values:

```env
STELLAR_NETWORK="TESTNET"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
STELLAR_FRIENDBOT_URL="https://friendbot.stellar.org"
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

## Backend APIs

The playground uses these endpoints:

```text
POST /api/stellar-playground/wallet/fund
GET  /api/stellar-playground/account/[publicKey]
POST /api/stellar-playground/verify-transaction
POST /api/stellar-playground/sep7
GET  /api/stellar-playground/qr?uri=...
```

The backend receives public keys, payment request fields, and transaction hashes. It does not receive the playground secret key.

## How to generate a Testnet learning wallet

1. Open `/stellar-playground`.
2. Choose **Create new Testnet learning wallet**.
3. Review the practice recovery phrase.
4. Confirm the requested words.
5. The browser creates a Stellar Testnet keypair.
6. Copy the public key if you need it.
7. Reveal the secret key only after typing the Testnet confirmation phrase.

Current implementation note: the UI is structured like mnemonic onboarding, but the Stellar keypair is generated with `Keypair.random()` after phrase confirmation. Full mnemonic derivation can be added later without changing the beginner flow.

## How to save locally

1. Create or import a Testnet learning wallet.
2. Go to the wallet tab.
3. Enter a local password with at least 8 characters.
4. Click **Save locally**.

The secret key is encrypted with Web Crypto using PBKDF2 and AES-GCM before being stored in browser `localStorage`. The password is not stored. The encrypted wallet is Testnet-only and can be cleared from the same screen.

## How to fund with Friendbot

1. Create or import a Testnet learning wallet.
2. Go to the wallet tab.
3. Click **Fund with Friendbot**.
4. The backend calls Stellar Friendbot using the public key.
5. The app refreshes the balance through Horizon Testnet.

Friendbot works only on Testnet. Testnet XLM has no real value.

## How to create a SEP-7 payment URI

1. Go to the pay tab.
2. Enter a destination public key. For a learning test, use the playground wallet public key.
3. Enter an amount, memo/reference, and optional message.
4. Keep asset type as XLM.
5. Click **Generate SEP-7 URI**.

The app creates a `web+stellar:pay` URI and QR code. SEP-7 does not send payment by itself. It asks a wallet to review, sign, and submit the transaction.

## How to pay using Freighter

1. Install the Freighter browser extension.
2. Create or unlock a Freighter wallet.
3. Switch Freighter to Testnet.
4. Fund the Freighter Testnet account.
5. Return to the playground.
6. Generate a SEP-7 URI.
7. Click **Open wallet** or copy the URI into a compatible wallet flow.
8. Review the payment in Freighter and submit it.
9. Copy the resulting transaction hash.

The playground still shows the QR code and URI if Freighter is not installed.

## How to verify a transaction hash

1. Go to the verify tab.
2. Paste the real Stellar Testnet transaction hash.
3. Enter the expected destination public key.
4. Enter the expected amount.
5. Enter the expected memo.
6. Click **Verify with Horizon**.

The backend checks:

- Transaction exists on Horizon Testnet.
- Transaction succeeded.
- Destination matches.
- Amount matches.
- Memo matches.
- Asset is native XLM.

The result shows the transaction hash, ledger number, created date, source account, destination account, amount, memo, and a Stellar Expert Testnet link.

## Common errors and fixes

**Freighter is on Mainnet**

Switch Freighter to Testnet before opening or signing the SEP-7 request.

**Friendbot says the account already exists**

Use **Refresh** to read the current account balance. Friendbot may refuse repeat funding for an already funded account.

**Horizon cannot find the account**

Fund the public key with Friendbot, confirm the key starts with `G`, and make sure all Stellar environment variables point to Testnet.

**Verification fails**

Check the hash, destination public key, amount, memo, and network. A Mainnet transaction cannot verify against Horizon Testnet.

**QR code does not open a wallet**

Not every browser handles `web+stellar:` links the same way. Copy the URI manually or use Freighter/Testnet-compatible tooling.
