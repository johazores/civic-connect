# Feature Checklist

## Public Platform

- Home page: implemented
- Mobile hamburger menu: implemented
- Report issue form: implemented
- Report categories: implemented
- Description field: implemented
- Location field: implemented
- Contact information: implemented
- Photo upload: implemented
- Auto-generated reference number: implemented
- Track request by reference: implemented
- Status timeline: implemented
- Services directory: implemented
- News list and detail pages: implemented
- Emergency hotlines: implemented
- One-tap calling: implemented
- Citizen registration: implemented
- Citizen login: implemented
- Citizen dashboard: implemented

## Staff Platform

- Staff login: implemented
- Report management: implemented
- Search and filters: implemented
- Department assignment: implemented
- Status updates: implemented
- Priority updates: implemented
- Internal notes: implemented
- Public updates: implemented
- Photo review: implemented
- CSV export: implemented
- Services CRUD: implemented
- Hotlines CRUD: implemented
- News CRUD: implemented
- Report categories CRUD: implemented
- Departments CRUD: implemented
- Staff users CRUD: implemented
- Organization settings: implemented

## Technical

- PostgreSQL Prisma schema: implemented
- Tenant-scoped data: implemented
- Vercel build script: implemented
- TypeScript checks: implemented
- Production build: implemented

## Implemented Stellar Layer

- Service fees: implemented
- Tenant Stellar wallet settings: implemented
- Real Testnet account generation: implemented
- Friendbot Testnet funding: implemented
- Payment intents: implemented
- SEP-7 payment URI and QR: implemented
- Horizon transaction verification: implemented
- Public receipt page: implemented
- Staff payment dashboard: implemented

## StellarX Proof-of-Payment Coverage

- [x] Service fee management
- [x] Tenant-specific Stellar Testnet receiving wallet
- [x] Payment intent records
- [x] SEP-7 payment URI generation
- [x] QR code generation for wallet payment requests
- [x] Horizon transaction verification
- [x] Permanent transaction hash storage
- [x] Public payment receipt page
- [x] Admin payment dashboard
- [x] Payment CSV export
- [x] Architecture kept separate from reports/content modules

- [x] Real Stellar Testnet account generation using Stellar SDK
- [x] Friendbot funding for tenant Testnet wallets
- [x] Encrypted server-side tenant secret storage
- [x] Secret keys never returned by wallet APIs
- [x] Payment verification by pasted transaction hash
- [x] Payment verification by Horizon memo scan
- [x] Duplicate transaction hash prevention
- [x] Pending/failed/expired/verified payment handling


## StellarX Civic Program Coverage

- [x] Idea 76: Proof-of-Payment for Government Services via SEP-7 and Horizon verification.
- [x] Idea 228: Civic Participation Reward workflow with staff approval and Stellar payout.
- [x] Idea 231: Environmental Cleanup Reward workflow using the civic action model with cleanup evidence.
- [x] Idea 243: Municipal Budget Transparency records with optional real Stellar disbursement hash.
- [x] Idea 165: Digital Property Tax Receipt records with public search and transaction hash display.
- [x] Tenant-aware Stellar wallet configuration.
- [x] Encrypted server-side wallet secret storage.
- [x] Public routes for rewards, transparency, and tax receipts.
- [x] Admin Stellar Programs workspace.
- [x] Documentation in `docs/stellar-civic-programs.md`.
