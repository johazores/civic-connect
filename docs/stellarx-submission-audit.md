# StellarX Submission Audit

## Purpose

This document evaluates CivicTrust against the StellarX Wishlist and recommends the next improvements that would increase the chance of approval without changing the product into a generic crypto app.

## Current Product Positioning

CivicTrust is a multi-tenant civic services platform for LGUs, barangays, municipalities, and community organizations. Its core value is not crypto trading or wallet management. Stellar is used to make civic records verifiable:

- service fee proof-of-payment receipts
- civic participation rewards
- cleanup and environmental reward payouts
- public budget transparency records
- digital property tax receipts

This matches the strongest current direction: **Proof-of-Payment for Government Services**.

## Current StellarX Alignment

### Already covered strongly

| Wishlist idea | Status | Current implementation |
| --- | --- | --- |
| #76 Proof-of-Payment for Government Services | Strong | Service fees, SEP-7 payment URI/QR, Horizon verification, transaction hash receipts |
| #228 Civic Participation Reward | Good | Civic action submission, staff review, reward payout transaction hash |
| #231 Environmental Cleanup Reward | Good | Cleanup action type, photo/GPS fields, reward payout flow |
| #243 Municipal Budget Transparency | Good | Public transparency ledger and admin records with Stellar transaction references |
| #165 Digital Property Tax Receipt | Partial-to-good | Public receipt search and receipt pages; needs stronger on-chain credential or proof hash anchoring |

### Current technical strengths

- PostgreSQL-first Prisma schema.
- Tenant-aware wallet configuration.
- Tenant-aware payment intents and receipts.
- Real Stellar Testnet integration using Horizon and SEP-7.
- Transaction hash uniqueness prevents duplicate receipt reuse.
- Separate services for payments, wallet management, and civic Stellar programs.
- Public verification pages exist for receipts and transparency.

## Key Acceptance Risks

### 1. Stellar usage may still look like a payment add-on

The product now has Stellar features, but the submission must show that Stellar is central to the civic trust layer, not just a payment option. The demo should center the story around verifiable receipts, public disbursement records, and civic proof history.

### 2. Rewards and public spending need stronger public proof

Civic action and cleanup rewards currently store photos/GPS in the app database and then pay rewards. To strengthen trust, each approved civic action should compute a proof digest, such as:

```text
sha256(action type + participant + timestamp + location + GPS + photo URL/hash + reviewer)
```

That proof digest should be anchored to the Stellar transaction memo or a dedicated proof registry record.

### 3. Public treasury flows need multi-signature controls

Government or barangay fund disbursement should not feel like one admin can spend funds alone. Add a multi-sig or approval workflow to align better with civic accountability.

### 4. Citizen wallet onboarding is still too crypto-heavy

The current system expects users to already understand a Stellar-compatible wallet. Add guided wallet onboarding, testnet instructions, and ideally sponsored-reserve support for new accounts later.

### 5. USDC reward support is incomplete unless trustlines are handled clearly

The wishlist mentions USDC rewards for civic and cleanup incentives. The app supports asset code/issuer fields, but the UX must explain that non-XLM assets require the recipient wallet to have the correct trustline.

### 6. Digital property tax receipts need stronger Stellar-native proof

The current model can store a transaction hash, but #165 describes a clearance as an asset or credential attached to a property token. A lighter version is acceptable for now: anchor a tax receipt digest to Stellar and provide a public verification page. A later version can issue a credential-style asset.

## Recommended Additional Wishlist Alignments

### Priority 1 — Unified Civic Ledger Explorer

**Ideas strengthened:** #76, #228, #231, #243, #165

Build one public page per tenant that displays all Stellar-backed civic records:

- service payment receipts
- reward payouts
- cleanup reward payouts
- budget disbursements
- tax receipts
- verification status
- transaction hash
- ledger number
- external Stellar explorer link

This is the most important product-story improvement because it makes Stellar visible and understandable.

### Priority 2 — On-chain Proof Digest for Civic Actions and Documents

**Ideas strengthened:** #228, #231, #240, #241, #287, #165

Add a reusable `proofDigest` field to civic actions, transparency entries, and tax receipts. Generate a SHA-256 hash from the important record metadata and anchor it to the Stellar transaction memo where possible, or store it in a ledger event table tied to the transaction hash.

This makes photos/GPS/documents verifiable without exposing private data publicly.

### Priority 3 — Multi-Sig Treasury Approval

**Wishlist fit:** #40 Barangay Emergency Fund Manager, #243 Municipal Budget Transparency

Add an approval workflow for budget disbursements and reward payouts:

- draft disbursement
- reviewer approvals
- ready to pay
- submitted to Stellar
- verified on ledger

For the MVP, approvals can be off-chain in the app. Later, map this to Stellar multi-sig or Soroban authorization.

### Priority 4 — Sponsored Reserve / Citizen Wallet Onboarding

**Wishlist fit:** #31 Sponsored Reserve Onboarding Kit

Add an onboarding mode that helps citizens create or connect wallets. Later, support sponsoring reserves so new users can start with less friction.

For now, add:

- wallet setup checklist
- Testnet wallet generator for learning only
- explanation of public key vs secret key
- recipient wallet validation
- trustline readiness checks for USDC/custom assets

### Priority 5 — Verified Volunteer / Residency Credentials

**Wishlist fit:** #240 Verified Volunteer Records, #287 Proof of Residency on Stellar

Extend the existing service directory and citizen account module with verifiable civic credentials:

- volunteer certificate
- attendance certificate
- proof of residency / barangay clearance
- document hash and Stellar verification record

This stays within the civic services vision and should not become an NFT or generic identity app.

### Priority 6 — Disaster Cash-for-Work Mode

**Wishlist fit:** #24 Disaster Cash-for-Work Ledger, #238 Disaster Relief Coordination Tool

Extend civic actions with a `programType` such as disaster response. Staff can verify hours worked and issue same-day Testnet reward payouts.

This is a natural extension because the app already has civic actions, proof photos/GPS, and payouts.

### Priority 7 — Mangrove / Environmental Geo-Proof Registry

**Wishlist fit:** #231 Environmental Cleanup Reward, #241 Mangrove Restoration Geo-Proof Registry

Add an environmental program type with:

- location/GPS
- proof photo URL
- verification date
- waste collected or trees planted
- proof digest
- reward transaction hash

This improves the environmental story without becoming a carbon marketplace.

### Priority 8 — Muxed Account / Memo Upgrade Path

**Wishlist fit:** underused Stellar primitive: multiplexed accounts

Currently the app relies on unique memos and reference codes. That is acceptable, but adding optional muxed destination support gives a stronger Stellar-native architecture for pooled receiving accounts.

Recommended approach:

- keep memo fallback for wallet compatibility
- add optional muxed destination ID for payment intents
- store `muxedDestination` and `muxedId`
- verify using Horizon payment operations and reference metadata

### Priority 9 — USDC Asset Readiness Layer

**Wishlist fit:** #228, #231

Add a UI and backend check for non-XLM assets:

- selected asset code
- issuer public key
- recipient trustline status
- warning if recipient cannot receive the asset
- fallback to XLM on Testnet

This makes USDC rewards credible instead of just text fields.

### Priority 10 — Optional Soroban Proof Registry

**Ideas strengthened:** #165, #240, #241, #287, #243

A small Soroban contract could store proof digests for civic records:

```text
record(referenceCode, proofDigest, recordType, tenantPublicKey)
```

This is high impact for technical judging but higher complexity. Do this only after the classic Stellar flows are stable.

## Ranked Recommendation Matrix

Scoring: 5 = highest/best.

| Rank | Recommendation | Acceptance impact | Complexity | Natural fit | Notes |
| --- | --- | ---: | ---: | ---: | --- |
| 1 | Unified Civic Ledger Explorer | 5 | 2 | 5 | Makes the Stellar story obvious to reviewers and citizens. |
| 2 | Proof digest anchoring | 5 | 3 | 5 | Turns off-chain proofs into verifiable civic records. |
| 3 | Multi-sig treasury approval workflow | 5 | 4 | 5 | Strong civic accountability story; can start app-level then Stellar multi-sig later. |
| 4 | USDC/trustline readiness layer | 4 | 3 | 4 | Aligns reward modules with USDC language in the wishlist. |
| 5 | Verified volunteer/residency credentials | 4 | 3 | 5 | Very natural public-service extension. |
| 6 | Sponsored reserve onboarding path | 4 | 4 | 4 | Strong Stellar primitive, improves citizen onboarding. |
| 7 | Disaster cash-for-work mode | 4 | 2 | 4 | Easy extension of civic actions/rewards. |
| 8 | Environmental geo-proof registry | 4 | 2 | 4 | Easy extension of cleanup rewards. |
| 9 | Muxed account support | 3 | 4 | 3 | Stronger Stellar architecture, but wallet compatibility must be handled carefully. |
| 10 | Soroban proof registry | 4 | 5 | 3 | Strong technical signal, but not required for first acceptance if classic flows are excellent. |

## Submission Story Recommendation

Pitch the product as:

> CivicTrust is a multi-tenant civic trust platform for LGUs, barangays, and municipalities. It digitizes citizen services while using Stellar for verifiable service payments, permanent receipts, civic reward payouts, and transparent public disbursement records.

Avoid saying:

- generic payment platform
- donation platform
- DAO or voting app
- crowdfunding platform
- NFT credential app
- generic wallet app
- escrow app

## Immediate Implementation Plan

### Sprint 1 — Submission readiness

1. Build `/[tenant]/ledger` as the public Civic Ledger Explorer.
2. Add `proofDigest` and `proofPayload` fields to civic actions, transparency entries, and property tax receipts.
3. Show Stellar verification cards consistently across payment receipts, rewards, transparency, and tax receipt pages.
4. Add external Stellar explorer links.
5. Add docs explaining exactly how each Stellar transaction proves the civic record.

### Sprint 2 — Credibility upgrades

1. Add app-level approval workflow for payouts/disbursements.
2. Add asset readiness checks for USDC/custom assets.
3. Add citizen wallet setup checklist.
4. Add disaster cash-for-work program type.
5. Add environmental geo-proof program type.

### Sprint 3 — Advanced Stellar primitives

1. Add optional muxed destination support.
2. Add sponsored-reserve onboarding prototype.
3. Add Soroban proof registry only if time allows.

## Implemented in the demo-readiness pass (July 2026)

The highest-ranked items from the matrix above are now built:

1. **Unified Civic Ledger Explorer** (Rank 1) — `/[tenant]/ledger` + public API `GET /api/tenant/[tenantSlug]/ledger`. Aggregates verified service payments, civic/cleanup rewards, public disbursements, and tax receipts into one page with impact metrics (records, on-chain count, XLM moved) and a "Verify on Stellar Expert" external link per record. Linked from the app menu and the transparency page.
2. **On-chain proof-digest anchoring** (Rank 2) — every reward payout and public disbursement now anchors a SHA-256 proof digest of the record's canonical fields **on the ledger as a 32-byte MEMO_HASH** (the Stellar-native way to bind off-chain proof to a transaction). Digests are stored on civic actions, transparency entries, and tax receipts (`proofDigest` column) and shown in the UI so anyone can recompute and compare. See `lib/stellar/proof.ts` and `computeProofDigest`.
3. **Claimable-balance rewards** (novelty primitive) — `payoutMethod = CLAIMABLE` issues a civic reward as a Stellar claimable balance so it is committed on-chain immediately and a citizen can claim it later from their own wallet, even before funding an account. See `submitClaimableBalanceReward` and `rewardClaimableBalanceId`.
4. **Guided wallet onboarding** (Rank 6 lite) — `/[tenant]/wallet` explains public vs secret keys, generates a practice Testnet keypair, and funds it via Friendbot, with trustline-readiness helpers (`accountHasTrustline`).
5. **Consistent "Verified on Stellar" proof card** — `components/stellar/stellar-proof.tsx` reused across payment receipts, checkout, tax receipts, transparency, and the admin rewards view (hash, ledger, proof digest, claimable-balance id, explorer link).
6. **Demo reliability** — `/api/health` keep-warm endpoint plus a client heartbeat (`components/layout/keep-warm.tsx`) so the serverless Postgres connection stays warm during a live demo.

Explorer/link helpers live in `lib/stellar/explorer.ts` (`stellarExpertTxUrl`, `stellarExpertAccountUrl`, `stellarExpertClaimableBalanceUrl`, `horizonTxUrl`).

Still open (roadmap): multi-sig treasury approval, sponsored-reserve account creation, muxed accounts, and an optional Soroban proof registry.

## Final Verdict

The project is now much closer to StellarX alignment than the original civic SaaS. The strongest path is not adding random blockchain features. The strongest path is making the Stellar-backed civic trust layer impossible to miss:

- every payment has a permanent transaction hash receipt
- every reward has a verified payout
- every cleanup proof has a digest
- every public disbursement can be audited
- every tax receipt can be verified publicly

The next best improvement is the Unified Civic Ledger Explorer plus proof digest anchoring.
