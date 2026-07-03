# Stellar Playground Guide

The project includes a small beginner-friendly Stellar Testnet playground at:

```text
/stellar-playground
```

This playground is separate from the civic product. It is only for learning and testing how Stellar accounts, SEP-7 payment links, QR codes, Horizon verification, and transaction hashes work.

## Why this exists

The production civic flow can feel confusing if you are new to Stellar. The playground lets a developer test each moving part without logging in as a tenant admin or creating a service payment first.

It shows the same basic concepts used by the main app:

1. A receiving wallet has a public key that starts with `G...`.
2. A secret key starts with `S...` and signs transactions.
3. The app can create a SEP-7 `web+stellar:pay` payment request.
4. A Stellar-compatible wallet signs and submits the transaction.
5. Horizon confirms whether the transaction exists and succeeded.
6. The transaction hash becomes the permanent receipt reference.

## Important safety note

The playground is **Testnet only**.

It intentionally displays the generated secret key so you can understand how Stellar accounts work. This is only acceptable for a learning sandbox.

Do not use the playground for Mainnet wallets. Do not paste real secret keys into the browser.

## Required environment variables

Use Testnet values:

```env
STELLAR_NETWORK="TESTNET"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
STELLAR_FRIENDBOT_URL="https://friendbot.stellar.org"
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

The playground does not require a database because it does not store payment intents. The main civic payment module still requires PostgreSQL.

## Step-by-step playground test

### 1. Start the app

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000/stellar-playground
```

### 2. Generate a Testnet wallet

Click **Generate Testnet wallet**.

The backend creates a real Stellar keypair:

- `G...` public key: safe to share, used as the receiving address.
- `S...` secret key: must stay private in real applications.

### 3. Fund the wallet

Click **Fund**.

The backend calls Friendbot, which funds the Testnet account with fake XLM.

### 4. Check wallet status

Click **Check**.

The backend reads the account through Horizon and returns balances.

### 5. Generate a SEP-7 QR code

Enter:

```text
Amount: 1
Memo: PLAY-12345
```

Click **Create SEP-7 QR**.

The backend creates a real URI like:

```text
web+stellar:pay?destination=G...&amount=1&memo=PLAY-12345&memo_type=MEMO_TEXT&msg=CivicTrust%20Testnet%20payment&network_passphrase=Test%20SDF%20Network%20%3B%20September%202015
```

The QR code contains this URI.

### 6. Pay with a wallet

Use a Stellar-compatible wallet that supports Testnet and SEP-7 links.

Make sure the wallet is switched to **Testnet**.

Scan the QR code or copy the URI if the wallet supports opening SEP-7 links.

After the payment is submitted, the wallet should show a transaction hash.

### 7. Verify the transaction

Paste the transaction hash in the playground and click **Verify with Horizon**.

The backend checks:

- Transaction hash exists.
- Transaction succeeded.
- Memo matches the expected memo.
- Destination public key matches the receiving wallet.
- Amount matches the requested amount.
- Asset is native XLM.

If all checks pass, the result returns:

```json
{
  "verified": true,
  "transactionHash": "...",
  "ledger": 123456,
  "paidAt": "..."
}
```

## How this maps to the civic payment module

The main civic app adds database records around the same flow:

| Playground concept | Civic app equivalent |
| --- | --- |
| Receiving public key | Tenant Stellar receiving wallet |
| SEP-7 URI | Service payment request |
| Memo | Payment intent reference code |
| Horizon verification | Payment verification endpoint |
| Transaction hash | Permanent public receipt |

## How Stellar smart contracts fit later

The current civic product does not need smart contracts for simple government service receipts. A normal Stellar payment plus Horizon verification is enough for proof-of-payment.

Smart contracts on Stellar are built with Soroban. They become useful later if the app needs programmable rules, such as:

- Reward claim windows
- Budget release conditions
- Multi-step civic incentive programs
- Automated disbursement rules

For smart contract development, start with the official Stellar smart contract quickstart:

```text
https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world
```

## Official Stellar docs

Use these as the source of truth:

```text
SEP-7 delegated signing:
https://developers.stellar.org/docs/build/apps/wallet/sep7

Networks, Testnet, and Friendbot:
https://developers.stellar.org/docs/networks

Build a payment app with the JS SDK:
https://developers.stellar.org/docs/build/apps/example-application-tutorial

Horizon API:
https://developers.stellar.org/docs/data/apis/horizon

Smart contracts / Soroban:
https://developers.stellar.org/docs/build/smart-contracts
```

## Troubleshooting

### Friendbot says the account already exists

That is okay. Friendbot usually funds new accounts. If the account already exists, use **Check** to inspect the balance.

### Horizon cannot find the account

The account has not been funded yet, or the wallet is on the wrong network.

Make sure you are using Testnet values.

### Payment verification fails

Check all of these:

- The wallet submitted on Testnet, not Mainnet.
- The transaction hash is from the payment transaction.
- The memo is exactly the same as the SEP-7 request.
- The destination public key matches the receiver.
- The amount matches.

### QR code opens nothing

Not every wallet/browser handles `web+stellar:` links the same way. Copy the URI manually or use a wallet that supports SEP-7 payment links.
