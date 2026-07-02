# StellarX Implementation Plan

This is the practical implementation plan for turning Civic Connect into a StellarX-ready project.

## Goal

Add enough Stellar functionality so the app is no longer just a civic SaaS dashboard. It should clearly demonstrate why Stellar is useful.

The first target is a working Testnet demo for:

> Proof-of-payment for government or community services.

## Phase 1: Stellar Payment Receipts

### Database additions

Add the following models or equivalent fields:

```prisma
model StellarSettings {
  id                    String   @id @default(cuid())
  tenantId              String   @unique
  network               String   @default("testnet")
  receivingPublicKey    String
  assetCode             String   @default("XLM")
  assetIssuer           String?
  isEnabled             Boolean  @default(false)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model PaymentIntent {
  id              String   @id @default(cuid())
  tenantId        String
  citizenId       String?
  serviceId       String?
  referenceCode   String   @unique
  payerName       String
  payerEmail      String?
  amount          Decimal
  assetCode       String   @default("XLM")
  destination     String
  memo            String
  status          String   @default("PENDING")
  transactionHash String?
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

For PostgreSQL, use `Decimal` for payment amounts when the Stellar payment module is added.

### API routes

Add:

```text
GET  /api/tenant/:tenantSlug/stellar/settings
PATCH /api/tenant/:tenantSlug/stellar/settings
POST /api/tenant/:tenantSlug/payments/intents
GET  /api/tenant/:tenantSlug/payments/intents/:referenceCode
POST /api/tenant/:tenantSlug/payments/intents/:referenceCode/verify
```

### UI routes

Add:

```text
/:tenant/pay/:serviceId
/:tenant/receipts/:referenceCode
/:tenant/admin/payments
/:tenant/admin/stellar
```

### Citizen flow

1. Citizen opens Services.
2. Citizen selects a payable service.
3. App creates a payment intent.
4. App shows QR code and SEP-7 payment URI.
5. Citizen pays from a Stellar wallet on Testnet.
6. Citizen pastes transaction hash or clicks verify.
7. App checks Horizon Testnet.
8. App marks the intent as paid.
9. Citizen gets a receipt page.

### Admin flow

1. Admin opens Stellar settings.
2. Admin enters tenant receiving public key.
3. Admin enables Stellar payments.
4. Admin opens payment dashboard.
5. Admin sees pending/paid/failed payments.
6. Admin can click each receipt and transaction hash.

### Validation rules

For the MVP:

- Use Testnet only by default.
- Do not store private keys.
- The app should only store public keys, payment intents, and transaction hashes.
- The citizen signs/pays using their own wallet or a demo wallet.
- Verification should confirm destination, amount, memo/reference, and transaction success.

## Phase 2: Civic Rewards

### Database additions

Add:

```prisma
model CivicReward {
  id              String   @id @default(cuid())
  tenantId        String
  citizenId       String
  reportId        String?
  title           String
  reason          String
  amount          String
  assetCode       String   @default("XLM")
  status          String   @default("PENDING")
  transactionHash String?
  approvedAt      DateTime?
  paidAt          DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### MVP reward triggers

Start with admin-approved rewards only:

- Verified cleanup proof.
- Valid civic report that resulted in action.
- Verified volunteer activity.
- Assembly attendance proof.

### UI additions

- Citizen dashboard reward cards.
- Admin reward approval page.
- Public reward transaction proof.

## Phase 3: Transparency Ledger

### Database additions

Add:

```prisma
model TransparencyEntry {
  id              String   @id @default(cuid())
  tenantId        String
  departmentId    String?
  title           String
  description     String
  amount          String
  assetCode       String   @default("XLM")
  category        String
  transactionHash String?
  occurredAt      DateTime
  isPublished     Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### UI additions

```text
/:tenant/transparency
/:tenant/admin/transparency
```

### Demo flow

1. Admin creates a public disbursement record.
2. Admin attaches a Stellar transaction hash.
3. Citizen views public transparency ledger.
4. Citizen can click to verify the transaction.

## Phase 4: Credentials

Only build this after the payment and rewards modules are stable.

Possible features:

- Proof of residency credential.
- Barangay ID credential.
- Business/employer credential.
- Tax clearance credential.

Keep credentials as demo/Testnet proof until there is a real issuing partner.

## What To Demo To Investors

Best short demo:

1. Open `/san-pablo`.
2. Submit a road/streetlight report.
3. Log in as admin and resolve it.
4. Open services and select a payable service.
5. Generate Stellar payment QR.
6. Verify payment through Testnet.
7. Show citizen receipt page.
8. Show public transparency ledger.
9. Show dashboard proving the app is multitenant with `/demo-city`.

## What Not To Claim

Do not claim:

- Official San Pablo City approval.
- Production government payment acceptance.
- Legal identity verification.
- Real funds disbursed unless connected to a compliant production partner.

Safe claim:

- The app demonstrates how a city/community service platform can use Stellar Testnet for verifiable receipts, rewards, and transparent civic records.
