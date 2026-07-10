# Demo Guide — CivicTrust

Use this script for tomorrow's demo. **Total time: ~5 minutes.**

## The one-liner

> CivicTrust lets citizens pay government fees from their own Stellar wallet and get a **permanent public receipt** anyone can verify — no trusting a private database.

## Before you start

1. **Validate Stellar works:** `npm run validate:stellar` (must show 7/7 passed)
2. Run the app: `npm run dev`
2. Open **Metro City**: http://localhost:3000/metro-city
3. Have **Freighter** installed (testnet) OR use the practice wallet at `/metro-city/wallet`
4. Staff login: `/metro-city/admin/login` (seed credentials in `prisma/seed.ts`)

---

## Act 1 — Explain the two wallets (30 seconds)

On the tenant home page, point to **"How Stellar fits in"**:

| Wallet | Who controls it | What it does |
|--------|-----------------|--------------|
| **City wallet** | LGU staff (server) | Receives service fees, sends rewards |
| **Your wallet** | Citizen (Freighter, etc.) | Pays fees, receives rewards |

**Key line:** *"The app never asks for your private key. You sign in your own wallet."*

---

## Act 2 — Pay a service fee (2 minutes)

1. Go to **Pay a fee** → `/metro-city/payments`
2. Select a paid service (e.g. business permit fee)
3. Enter payer name → **Create payment**
4. On checkout page:
   - Show the **QR code** / SEP-7 link
   - Open in Freighter → approve payment
5. Click **Verify payment**
6. Show the **receipt** with transaction hash
7. Open **Stellar Expert** link — *"This proof lives on the public ledger forever"*

**Key line:** *"The reference code is the memo. Horizon confirms amount, destination, and memo match."*

---

## Act 3 — Public ledger (1 minute)

1. Go to **Public ledger** → `/metro-city/ledger`
2. Show the payment you just made in the unified list
3. Explain: payments, rewards, and disbursements all appear here when verified on-chain

**Key line:** *"This is our transparency layer — not a separate blockchain product, just verifiable civic records."*

---

## Act 4 — Staff side (1 minute, optional)

1. `/metro-city/admin` → **Payments** tab — same payment appears
2. **Settings** → show city wallet (public key only, secret never exposed)
3. **Stellar programs** → briefly mention rewards and budget disbursements (outbound from city wallet)

**Key line:** *"Staff approve civic actions, then the city wallet sends the reward. Citizens claim from their own wallet."*

---

## What's on-chain vs off-chain

| On-chain | Off-chain |
|----------|-----------|
| Citizen payment (signed in wallet) | Report submission, status updates |
| City reward / disbursement (server signs) | Staff approval workflow |
| Transaction hash as permanent proof | User accounts, CMS content |

**Do not claim:** withdrawals, in-app claiming, Soroban smart contracts, or live chain sync — these are not implemented.

---

## FAQ for the team

**Why Stellar?**  
Immutable receipts, sub-cent fees, SEP-7 standard for wallet payments, no custody of citizen keys.

**Why not a card processor?**  
Card receipts stay in private systems. Stellar gives a **public, portable proof**.

**Is this mainnet?**  
Demo uses **testnet**. Same flows work on mainnet with real XLM/USDC.

**What if verification fails?**  
Payment may still be pending on Horizon. Wait a few seconds and retry, or paste the transaction hash.

---

## Quick links

- Product explainer: `/about`
- Demo city: `/metro-city`
- Practice wallet: `/metro-city/wallet`
- Architecture details: `docs/stellar-architecture.md`
