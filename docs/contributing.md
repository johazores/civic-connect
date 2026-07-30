# Contributing

Thank you for helping improve CivicTrust.

## Current status

CivicTrust is a multi-tenant civic services platform and Stellar testnet proof-of-payment prototype. Contributions must preserve tenant isolation, public-service accessibility, and clear testnet boundaries.

## Setup

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Use local or disposable PostgreSQL data. Never run reset or seed commands against unreviewed production databases.

## Development principles

- Resolve tenant context from trusted application routes and authenticated sessions.
- Scope all tenant-owned data at API and service boundaries.
- Keep public citizen journeys usable on mobile and low-complexity devices.
- Preserve server-side authorization for staff and platform administration.
- Keep bootstrap secrets in environment variables and administrator-managed runtime values in the database.
- Keep Stellar testnet proof separate from real government payment or financial claims.
- Reuse shared UI primitives and service patterns instead of duplicating CRUD behavior.
- Do not add or modify GitHub Actions without a separate workflow and cost review.

## Branches and commits

Use `feat/<feature-name>` branches and focused Conventional Commits.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm run verify
npm run validate:stellar
```

The Stellar validation command may write testnet transactions and should use only intended test configuration.

## Pull requests

Include what changed, why it changed, testing performed, tenant or authorization impact, public accessibility impact, Stellar or payment impact, and breaking changes.
