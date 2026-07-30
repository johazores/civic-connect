# CivicTrust

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active%20prototype-orange.svg)](docs/roadmap.md)
[![PWA](https://img.shields.io/badge/mobile-PWA-informational.svg)](docs/pwa-setup-guide.md)
[![Stellar](https://img.shields.io/badge/Stellar-testnet-7D00FF.svg)](docs/stellar-architecture.md)

CivicTrust is a multi-tenant civic services platform for cities, municipalities, provinces, barangays, and local-government teams.

It provides a mobile-friendly public portal for citizens, a structured staff workspace for operations, and a Stellar testnet proof-of-payment module for verifiable civic service receipts.

> **Status:** Active prototype. Stellar modules use testnet and seeded credentials are for local demonstration only. Production government deployment requires security, privacy, accessibility, operational, and legal review.

## Core product

### Citizen portal

- Tenant landing pages
- Services directory
- Citizen report submission with photo upload
- Auto-generated report reference numbers
- Public request tracking
- Citizen registration and account dashboard
- News and announcements
- Emergency hotlines with one-tap calls
- Responsive mobile navigation and installable PWA shell

### Staff portal

- Staff authentication
- Operations dashboard
- Searchable and filterable report queue
- Department assignment
- Status and priority management
- Public and internal notes
- Uploaded photo review
- CSV export
- Services, hotlines, news, categories, departments, and staff management
- Tenant organization settings
- Stellar payment and civic-program administration

### Platform administration

- Multi-tenant configuration
- Database-managed runtime settings
- Separate privileged platform interface
- Tenant wallet and payment configuration
- Shared CRUD and UI foundations

## Stellar proof of payment

The implemented payment module demonstrates how civic service payments can produce verifiable public receipts.

1. Staff configure a service fee and tenant Stellar testnet receiving wallet.
2. A citizen creates a payment intent.
3. CivicTrust generates a SEP-7 payment URI and QR code.
4. The citizen pays from a compatible testnet wallet.
5. CivicTrust verifies the transaction through Horizon.
6. The transaction hash is stored and displayed on a permanent public receipt page.

Implemented capabilities include:

- tenant testnet wallet generation and funding;
- encrypted wallet-secret storage;
- service fees and payment intents;
- SEP-7 payment URIs and QR codes;
- Horizon transaction verification;
- duplicate-payment protection;
- staff payment records and CSV export;
- public transaction receipts;
- civic participation, environmental, transparency, and tax-receipt prototypes.

> Testnet transaction proof does not mean the platform is approved to process real government payments.

Read [Stellar architecture](docs/stellar-architecture.md), [payment implementation](docs/stellar-payment-implementation.md), and [security policy](docs/security.md).

## Technology

- Next.js 16 App Router for rendered pages
- Pages Router API routes under `pages/api`
- React 19 and TypeScript
- Tailwind CSS 4
- PostgreSQL and Prisma 6
- Custom cookie and JWT sessions
- Stellar SDK and QR generation
- PWA manifest, service worker, and offline fallback

## Architecture

```text
app/                  public, citizen, staff, and platform pages
components/           shared UI, public, layout, and admin components
components/ui/        standardized interface primitives
pages/api/            REST API routes
services/             business and data-access services
lib/                  auth, database, request, formatting, tenant, and Stellar helpers
prisma/               PostgreSQL schema and seed data
scripts/              setup, build, and validation utilities
docs/                 product, deployment, payment, roadmap, and community docs
public/                manifest, icons, service worker, and static assets
```

Tenant-owned data must be scoped using trusted route and authentication context. UI visibility is not a replacement for server-side authorization.

## Requirements

- Node.js compatible with Next.js 16
- PostgreSQL database
- Strong authentication and encryption secrets
- Optional Stellar testnet access for payment demonstrations

## Installation

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Minimum bootstrap configuration:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
ADMIN_JWT_SECRET="replace-with-a-long-random-secret"
STELLAR_WALLET_ENCRYPTION_KEY="replace-with-another-long-random-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_AUTH_PROVIDER="custom"
STELLAR_NETWORK="TESTNET"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
STELLAR_FRIENDBOT_URL="https://friendbot.stellar.org"
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
```

Open a seeded tenant:

```text
http://localhost:3000/metro-city
http://localhost:3000/laguna-province
```

Development credentials and the recommended walkthrough are documented in [demo guide](docs/demo.md). Replace seeded passwords before any shared deployment.

## Runtime configuration

Some administrator-managed values can be stored in PostgreSQL through the platform interface at `/root`.

Database-managed settings include public application URLs, authentication-provider selection, and non-secret Stellar network configuration.

Bootstrap secrets must stay in the deployment environment because the application needs them before it can safely read the database:

- `DATABASE_URL`
- `ADMIN_JWT_SECRET`
- `STELLAR_WALLET_ENCRYPTION_KEY`

## PWA and mobile

CivicTrust includes:

- web application manifest;
- app icons;
- production service worker;
- offline fallback;
- safe-area metadata;
- mobile app shell and bottom navigation.

The recommended product direction is PWA-first. Consider a Capacitor or native wrapper only when app-store distribution, offline behavior, push notifications, or native device APIs justify the added maintenance.

Read [PWA setup](docs/pwa-setup-guide.md) and [native mobile roadmap](docs/native-mobile-roadmap.md).

## Authentication status

Custom cookie and JWT authentication remains active for staff and citizens.

Clerk is not currently installed as the active authentication provider. The optional `User.clerkUserId` field and migration documentation are preparation only.

Read [Clerk migration plan](docs/clerk-migration-plan.md) before changing authentication architecture.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run verify
```

Stellar testnet validation is separate because it may create network transactions:

```bash
npm run validate:stellar
```

## Deployment

1. Provision PostgreSQL.
2. Configure strong bootstrap secrets.
3. Set the deployed application URL.
4. Keep the authentication provider set to the implemented option.
5. Use Stellar testnet while validating payment flows.
6. Run database setup through a reviewed operational process.
7. Replace all seeded accounts and passwords.
8. Verify tenant isolation, uploads, public tracking, staff permissions, and payment receipts.

See [deployment guide](docs/deployment-guide.md).

## Production limitations

Before real civic or payment use, complete:

- tenant isolation integration testing;
- role and permission review;
- privacy and data-retention assessment;
- upload security and storage policy;
- accessibility testing;
- backups and disaster-recovery validation;
- operational monitoring and incident response;
- regulated payment or asset partnerships;
- signer, treasury, reconciliation, refund, and dispute procedures;
- independent security review.

## Documentation

- [Documentation index](docs/index.md)
- [User guide](docs/user-guide.md)
- [Admin guide](docs/admin-guide.md)
- [Developer guide](docs/developer-guide.md)
- [Deployment guide](docs/deployment-guide.md)
- [Demo guide](docs/demo.md)
- [Product review](docs/product-review.md)
- [Stellar architecture](docs/stellar-architecture.md)
- [Payment implementation](docs/stellar-payment-implementation.md)
- [Stellar civic programs](docs/stellar-civic-programs.md)
- [PWA setup](docs/pwa-setup-guide.md)
- [Roadmap](docs/roadmap.md)
- [Changelog](docs/changelog.md)
- [Contributing](docs/contributing.md)
- [Security policy](docs/security.md)
- [Code of conduct](docs/code-of-conduct.md)
- [Repository metadata](docs/repository-metadata.md)

## License

MIT. See [LICENSE](LICENSE).

## Author

Created and maintained by [Johanssen Azores](https://github.com/johazores).
