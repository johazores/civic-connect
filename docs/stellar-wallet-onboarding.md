# Stellar Wallet Onboarding

This document describes the beginner-friendly wallet flow used by the Stellar Playground. The flow is inspired by wallet onboarding patterns, but it is only for Stellar Testnet learning.

## Non-negotiable safety rules

- Do not position the playground as a production wallet.
- Do not support Mainnet funds in the playground.
- Do not ask for real recovery phrases.
- Do not ask for real private keys.
- Do not send playground secret keys to the backend.
- Do not log playground secret keys.

## Step 1: Choose wallet setup

The first screen gives three choices:

1. **Create new Testnet learning wallet**
   - Recommended for first-time learners.
   - Shows a practice recovery phrase prompt.
   - Creates a Stellar Testnet keypair in the browser after word confirmation.

2. **Connect/use Freighter wallet**
   - Recommended payer wallet for signing real Testnet payment requests.
   - Keeps signing inside a wallet extension.
   - The playground still works by showing the SEP-7 URI and QR code if Freighter is missing.

3. **Import existing Testnet secret key for learning only**
   - Accepts only disposable Testnet `S...` keys.
   - Parses the key in the browser.
   - Does not send the secret key to the backend.

The screen also explains the role split:

- Freighter is the recommended payer wallet.
- The playground wallet is only for learning.
- The tenant wallet is the receiving wallet in the real civic app.

## Create new Testnet learning wallet

When a learner chooses the create flow:

1. The browser generates a practice recovery phrase.
2. The phrase is shown in a secure-looking card.
3. The learner confirms three requested words.
4. After confirmation, the browser generates a Stellar keypair with `Keypair.random()`.
5. The UI shows the public key and keeps the secret key hidden until explicit confirmation.

Current implementation note: the practice phrase is not yet used to derive the Stellar keypair. It prepares the UI and mental model for mnemonic support later while avoiding a new dependency until derivation is intentionally added.

## Local wallet storage

The playground can save a generated or imported Testnet wallet locally.

Storage behavior:

- Uses browser `localStorage`.
- Stores only Testnet learning wallets.
- Encrypts the secret key with Web Crypto before storage.
- Uses PBKDF2 plus AES-GCM.
- Requires the same local password to unlock.
- Allows clearing the local encrypted wallet.

The backend never receives the secret key.

## Secret key reveal behavior

Secret keys are hidden by default. To reveal the secret key, the learner must type:

```text
TESTNET ONLY
```

This extra step is meant to slow down accidental exposure and reinforce that real wallet secrets do not belong in the playground.

## Friendbot funding

The wallet tab includes **Fund with Friendbot**.

The request sends only the public key to:

```text
POST /api/stellar-playground/wallet/fund
```

The backend calls Friendbot and then refreshes the account through Horizon Testnet. The UI shows loading, success, error, balance, wallet status, and a Stellar Expert Testnet account link.

## SEP-7 payment request

The pay tab creates a SEP-7 request with:

- Destination public key
- Amount
- Memo/reference
- Asset type, currently XLM only
- Optional message/label

The result includes:

- `web+stellar:pay` URI
- QR code
- Copy URI button
- Open wallet button

The UI explains that SEP-7 creates a payment request only. A wallet such as Freighter signs and submits the actual transaction.

## Freighter helper

The Freighter section:

- Detects whether a browser Freighter provider is present when possible.
- Lets the learner connect and read the payer public key.
- Reads the reported network when possible.
- Warns if the reported network does not look like Testnet.
- Keeps the QR/URI fallback available.

If Freighter is missing, the UI tells the learner to install Freighter, create a wallet, switch to Testnet, fund the Testnet account, and return to the playground.

## Transaction verification

The verify tab asks for:

- Transaction hash
- Expected destination
- Expected amount
- Expected memo

It sends those fields to:

```text
POST /api/stellar-playground/verify-transaction
```

The backend checks Horizon Testnet for a real transaction and verifies success, destination, amount, memo, and native XLM asset. The UI displays a verified or failed result with ledger details and explorer links.
