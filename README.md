# CivicTrust Multitenant Platform

CivicTrust is a production-focused city services platform for LGUs, barangays, municipalities, and provincial teams. It provides a modern public portal for citizens and a structured staff workspace for operations teams.

The current build focuses on usability, clean information architecture, PostgreSQL deployment readiness, consistent CRUD workflows, and a real Stellar Testnet proof-of-payment module for civic service fees.

## Core Product

### Public Portal

- City landing page with clear service access
- Citizen report submission
- Photo upload for reports
- Auto-generated tracking/reference number
- Public request tracker
- Citizen account registration and login
- Citizen dashboard with report history
- Services directory
- News and announcements
- Emergency hotlines with one-tap call links
- Fully responsive hamburger navigation

### Staff Portal

- Staff login
- Operations dashboard
- Report queue with search and filters
- Department assignment
- Status and priority updates
- Public and internal notes
- Uploaded photo review
- CSV export
- Services CRUD
- Hotlines CRUD
- News CRUD
- Report categories CRUD
- Departments CRUD
- Staff user CRUD
- Organization settings

### Technical Foundation

- Next.js App Router for rendered pages
- `pages/api` for backend API routes
- PostgreSQL with Prisma
- Tailwind CSS
- Tenant-scoped data model
- Cookie-based staff and citizen sessions
- Vercel-ready build scripts

## Local Setup

Create your environment file:

```bash
cp .env.example .env
```

Set a PostgreSQL database URL:

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

Install and prepare the database:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000/metro-city
http://localhost:3000/laguna-province
```

## Starter Access

Metro City staff:

```text
http://localhost:3000/metro-city/admin/login
admin@metrocity.local
admin12345
```

Metro City citizen:

```text
http://localhost:3000/metro-city/login
sofia.cruz@metrocity.local
citizen12345
```

Laguna Province staff:

```text
http://localhost:3000/laguna-province/admin/login
admin@laguna.local
admin12345
```

Laguna Province citizen:

```text
http://localhost:3000/laguna-province/login
ana.reyes@laguna.local
citizen12345
```

Replace all starter passwords before using the app with real users.


## Stellar Testnet Setup for Beginners

For normal Stellar testing, do **not** manually type values into the receiving public key or secret key fields.

Use this flow:

```text
Admin → Settings → Real Stellar Testnet wallet → Generate Testnet Wallet
```

After generation, the app should display a `G...` receiving public key automatically. The `S...` secret key field is only for importing an existing Testnet wallet, so it should usually stay blank.

Read these first if you are new to Stellar:

- `docs/stellar-beginner-wallet-guide.md`
- `docs/stellar-testnet-setup.md`
- `docs/stellar-payment-implementation.md`

## Verification

```bash
npm run lint
npm run typecheck
npm run build
npm run verify
```

`npm run verify` runs lint, TypeScript, and production build together.

## Vercel Deployment

1. Create a hosted PostgreSQL database.
2. Set `DATABASE_URL` in Vercel.
3. Set `ADMIN_JWT_SECRET` in Vercel.
4. Set `STELLAR_WALLET_ENCRYPTION_KEY` in Vercel.
5. Set `NEXT_PUBLIC_APP_URL` to your deployed URL.
6. Keep Stellar Testnet variables enabled while testing.
7. Deploy the project.
8. Run database setup from your local terminal or deployment workflow:

```bash
npm run db:push
npm run db:seed
```

The app is PostgreSQL-first and no longer uses SQLite.

## Project Structure

```text
app/                  App Router pages
components/           Reusable UI, public, layout, and admin components
components/ui/        Standardized buttons, cards, inputs, selects, badges, stats
pages/api/            REST API routes
services/             Business/data access services
lib/                  Shared auth, db, format, request, reference, and Stellar helpers
prisma/               Prisma schema and starter data
scripts/              Build/setup helper scripts
docs/                 Product, user, admin, deployment, and roadmap docs
```

## Product Direction

The platform is designed to evolve into a Stellar-powered civic trust product. The strongest Stellar direction is proof-of-payment for government services, where service payments generate permanent transaction hashes and public receipts.

Implemented Stellar module:

- Service fee management
- Tenant Stellar Testnet receiving wallet management
- Real Testnet keypair generation
- Friendbot funding
- Payment intent records
- SEP-7 payment URI and QR generation
- Horizon transaction verification
- Permanent public receipt pages
- Staff payment dashboard

Future Stellar modules:

- Civic participation rewards
- Environmental cleanup incentives
- Municipal budget transparency
- Digital property tax receipts

## Documentation

Start with:

- `docs/user-guide.md`
- `docs/admin-guide.md`
- `docs/developer-guide.md`
- `docs/deployment-guide.md`
- `docs/product-review.md`
- `docs/stellarx-fit-review.md`
- `docs/stellarx-implementation-plan.md`


## StellarX Direction Implemented

The project now includes the first StellarX-aligned module: **Proof-of-Payment for Government Services**.

Implemented payment routes:

```text
/[tenant]/payments
/[tenant]/payments/[referenceCode]
/[tenant]/receipts/[referenceCode]
```

Implemented payment APIs:

```text
POST /api/tenant/[tenantSlug]/payments
GET  /api/tenant/[tenantSlug]/payments
GET  /api/tenant/[tenantSlug]/payments/[referenceCode]
GET  /api/tenant/[tenantSlug]/payments/[referenceCode]/qr
POST /api/tenant/[tenantSlug]/payments/[referenceCode]/verify
GET  /api/tenant/[tenantSlug]/payments/export
GET  /api/tenant/[tenantSlug]/stellar/wallet
PATCH /api/tenant/[tenantSlug]/stellar/wallet
POST /api/tenant/[tenantSlug]/stellar/wallet/generate
POST /api/tenant/[tenantSlug]/stellar/wallet/fund
POST /api/tenant/[tenantSlug]/stellar/wallet/check
```

Staff can generate/fund/check real Testnet tenant wallets under **Admin → Settings**, manage service fees under **Admin → Content → Services**, and review verified payment records under **Admin → Payments**.

See `docs/stellar-payment-implementation.md` for the full implementation guide.

## Stellar Civic Programs

The platform now includes additional StellarX-aligned civic modules:

- Civic Participation Rewards
- Environmental Cleanup Rewards
- Municipal Budget Transparency
- Digital Property Tax Receipts

Start from `docs/stellar-civic-programs.md` after configuring the tenant Testnet wallet in `Admin → Settings`. The civic platform remains the core product; Stellar is used only for verifiable payment receipts, reward payout proof, public fund records, and receipt hashes.

New public routes:

```text
/[tenant]/civic-actions
/[tenant]/transparency
/[tenant]/tax-receipts
```

Admin route:

```text
/[tenant]/admin → Stellar Programs
```
