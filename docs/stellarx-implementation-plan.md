# StellarX Implementation Plan

## Goal

Extend CivicTrust into a Stellar-powered civic trust platform without rebuilding the core app.

## Phase 1: Service Fees

Add fee fields to services:

- Fee amount
- Asset code
- Payment required flag
- Receiving wallet public key

## Phase 2: Payment Intents

Create a payment intent when a citizen chooses a paid service.

Fields:

- Tenant ID
- Citizen ID
- Service ID
- Amount
- Asset code
- Destination public key
- Memo
- Status

## Phase 3: SEP-7 Payment QR

Generate a SEP-7 payment URI and QR code for wallet signing.

The app should not handle private keys.

## Phase 4: Transaction Verification

Use Stellar Horizon on Testnet to verify:

- Destination account
- Amount
- Asset
- Memo
- Successful ledger inclusion

## Phase 5: Public Receipt

Create a public receipt page showing:

- Receipt number
- Service
- Amount
- Status
- Stellar transaction hash
- Ledger timestamp

## Phase 6: Staff Payment Dashboard

Add a staff workspace for:

- Paid services
- Pending payments
- Verified receipts
- Failed verification
- CSV export

## Later Enhancements

- Civic participation rewards
- Environmental cleanup incentives
- Municipal budget transparency
- Digital property tax receipt records
