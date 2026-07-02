# Stellar Beginner Wallet Guide

This guide explains the payment setup without assuming crypto experience.

## The short version

For normal testing, you only need to do this:

1. Set the Stellar environment variables in `.env`.
2. Run the app.
3. Log in as admin.
4. Go to **Settings**.
5. Click **Generate Testnet Wallet**.
6. Confirm a `G...` public key appears.
7. Click **Check Horizon Status**.
8. Go to `/metro-city/payments` and create a payment request.
9. Pay with a Testnet wallet.
10. Verify the transaction hash.

You do **not** need to manually enter a receiving public key or secret key for the normal setup.

## What is a public key?

A public key is like a bank account number. It is safe to show publicly because people need it to send payments to the tenant.

In Stellar, public keys start with `G`.

The app stores this as the tenant's receiving address.

## What is a secret key?

A secret key is like the password/private key for a wallet. It starts with `S`.

Do not share secret keys. The app only asks for this when importing an existing Testnet wallet. If you click **Generate Testnet Wallet**, the app creates it on the server and stores it encrypted.

## What is Friendbot?

Friendbot is Stellar's Testnet faucet. It gives fake Testnet XLM to Testnet accounts so developers can test payments without real money.

Friendbot is only for Testnet. It does not exist for Mainnet payments.

## What is Horizon?

Horizon is Stellar's API. The app uses Horizon to check whether a transaction really happened and whether it matches the payment request.

## What is SEP-7?

SEP-7 is a standard Stellar wallet handoff format. The app creates a `web+stellar:pay` payment request, then the user's wallet opens it for signing. This keeps private keys inside the user's wallet instead of inside the civic app.

## Normal setup flow

### Admin side

The admin creates the receiving wallet:

```text
Admin → Settings → Generate Testnet Wallet
```

After this, the app should show:

```text
Current receiving public key: G...
Stored secret: Encrypted
Network: TESTNET
```

### Citizen side

The citizen pays using their own Testnet wallet:

```text
/metro-city/payments → choose service → create payment → open wallet/scan QR → submit transaction
```

### Verification side

The app verifies the transaction through Horizon:

```text
paste transaction hash → verify → permanent receipt
```

## When to use the manual key fields

Use `Existing public key import` and `Existing secret key import` only when:

- you already created a Stellar Testnet account outside the app, and
- you want that account to become the tenant receiving wallet.

For most testing, ignore those fields.
