# Developer Guide

This guide explains how to run, verify, and extend the codebase.

## Stack

- Next.js App Router for rendered pages
- `pages/api` for backend API routes
- React + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL database
- JWT cookies for admin and citizen sessions

## Install and run

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000/san-pablo
```

## Verification commands

```bash
npm run lint
npm run typecheck
npm run build

# all at once
npm run verify
```

## Database commands

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run db:reset
npm run db:studio
```

## Project structure

```text
app/                 App Router pages
components/          Reusable UI and feature components
components/admin/    Admin dashboard components
components/public/   Citizen-facing components
components/layout/   Public layout shell
components/ui/       Shared UI primitives
lib/                 API response, auth, db, formatting, request helpers
pages/api/           API routes
prisma/              Prisma schema and seed file
services/            Business/data access functions
types/               Shared TypeScript types
docs/                Product, user, admin, developer, and deployment docs
```

## Coding style

The project intentionally stays simple:

- Kebab-case file names
- App Router for rendered pages
- `pages/api` for APIs
- No server actions
- No heavy state management
- No global state library
- Tenant access scoped by `tenantId`
- Small helper functions instead of large abstractions
- Reusable UI primitives, but not over-abstracted business screens

## Multitenancy pattern

Public and admin pages use tenant slug routes:

```text
/:tenant
/:tenant/report
/:tenant/admin
```

APIs use the same tenant slug pattern:

```text
/api/tenant/:tenantSlug/...
```

The backend resolves the tenant by slug, then queries records by `tenantId`.

Important rule:

> Never fetch, update, or delete tenant-owned records without checking `tenantId`.

## Authentication

There are two separate session cookies:

| Cookie | Purpose |
| --- | --- |
| `civic_token` | Admin/staff session. |
| `civic_citizen_token` | Citizen session. |

Both are signed with `ADMIN_JWT_SECRET`.

For production, rename the environment variable later if preferred, but the current single secret is enough for the MVP.

## Important services

| File | Purpose |
| --- | --- |
| `services/tenant-service.ts` | Fetch tenant and public tenant content. |
| `services/report-service.ts` | Create, list, find, and update reports. |
| `lib/auth.ts` | Admin and citizen JWT cookie helpers. |
| `lib/db.ts` | Prisma client bootstrap. |
| `lib/reference.ts` | Report reference code generation. |

## API response pattern

Use helpers from `lib/api-response.ts`:

```ts
ok(res, data)
created(res, data)
badRequest(res, message)
unauthorized(res, message)
forbidden(res, message)
notFound(res, message)
methodNotAllowed(res)
serverError(res, error)
```

This keeps API responses consistent.

## Adding a new tenant manually

For local testing, update `prisma/seed.ts` and add another tenant block.

A future production version should add a super-admin tenant onboarding UI.

## Adding a new public module

1. Add a model in `prisma/schema.prisma` if persistent data is needed.
2. Add tenant-scoped API route under `pages/api/tenant/[tenantSlug]/...`.
3. Add service functions if business logic is reused.
4. Add public page under `app/[tenant]/...`.
5. Add admin CRUD in Content Studio if admins need to manage it.
6. Update `docs/feature-checklist.md`.

## Current local limitation

The sandbox used to package this project cannot download Prisma engine binaries from `binaries.prisma.sh`, so database commands could not be executed there. On a normal local machine with internet access, run:

```bash
npm run db:push
npm run db:seed
```
