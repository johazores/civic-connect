# Stellar Beginner Wallet Guide

This guide explains the Stellar Playground for people who are new to wallets.

The most important rule:

```text
Use this only for Stellar Testnet learning. Never use real funds, real recovery phrases, or real private keys here.
```

## The short version

1. Open `/stellar-playground`.
2. Choose **Create new Testnet learning wallet**.
3. Confirm the requested practice recovery words.
4. Copy the `G...` public key if you need it.
5. Fund the wallet with Friendbot.
6. Create a SEP-7 payment request.
7. Use Freighter on Testnet to pay the request, or copy/scan the URI with a compatible Testnet wallet.
8. Paste the real transaction hash into the verify tab.

## What is a Stellar account?

A Stellar account is a place on Stellar that can hold XLM and receive payments. In this playground, the account is only on Testnet.

## What is a public key?

A public key is like an account number. It starts with `G`.

It is safe to share because people need it to send a payment to the account.

## What is a secret key?

A secret key starts with `S`. It controls the account.

Do not share it. Do not paste a real secret key into the playground. The only acceptable secret key here is a disposable Stellar Testnet learning key.

## What is a recovery phrase?

A recovery phrase is a group of words that many wallets use as a backup. Real recovery phrases control real wallets.

The playground shows a practice phrase only to teach the flow. Do not reuse that phrase anywhere else, and never paste a real wallet phrase into the playground.

## What is Testnet?

Testnet is a practice version of Stellar. Testnet XLM is not real money.

The playground is built for Testnet only.

## What is Friendbot?

Friendbot gives free Testnet XLM to Testnet accounts. It is useful for learning because it lets you test payments without real money.

## What is SEP-7?

SEP-7 is a payment request link. It starts with:

```text
web+stellar:pay
```

The link does not send money by itself. A wallet opens the request, shows the details, and asks the payer to approve.

## What is Horizon?

Horizon is the Stellar API. The playground uses Horizon Testnet to read account balances and verify transaction hashes.

## What is a transaction hash?

A transaction hash is the receipt ID for a Stellar transaction. It is long and made of letters and numbers.

The playground uses the hash to confirm that a payment really happened and matches the expected amount, destination, memo, and XLM asset.

## Why does the civic app use Stellar?

The civic app uses Stellar so payments can have public proof. A payment can be checked later without depending only on an internal record.

For example, a verified civic payment can show:

- Destination wallet
- Amount
- Memo/reference
- Ledger number
- Transaction hash
- Created date

## Playground wallet vs Freighter

The playground wallet helps you learn. It shows the parts of a wallet and can receive Testnet XLM.

Freighter is the recommended payer wallet. It is better for signing Testnet payments because it keeps signing inside the wallet extension.

In the real civic app:

- The tenant wallet receives the payment.
- The resident or payer uses their own wallet.
- The civic app verifies the transaction hash through Horizon.

## Common errors

**I cannot fund the wallet**

Make sure the public key starts with `G` and the app is using Stellar Testnet environment variables.

**Freighter shows the wrong network**

Switch Freighter to Testnet before signing the payment.

**Verification fails**

Check that the transaction hash is from Testnet and that destination, amount, and memo exactly match the request.

**The QR code does not open Freighter**

Copy the SEP-7 URI and open it through a compatible Testnet wallet flow. Browser support for `web+stellar:` links can vary.
