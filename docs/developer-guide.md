# Developer Guide

## Stack

- Next.js App Router for pages
- `pages/api` for REST endpoints
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- TypeScript

## Local Commands

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Verification:

```bash
npm run verify
```

## Code Organization

```text
app/                  Rendered routes
pages/api/            Backend routes
components/layout/    Public navigation and shell
components/public/    Citizen-facing UI
components/admin/     Staff portal UI
components/ui/        Shared design system components
services/             Data and business logic
lib/                  Shared helpers
prisma/               Schema and starter data
```

## Coding Pattern

- Keep rendered pages in `app/`.
- Keep backend endpoints under `pages/api/`.
- Keep reusable UI in `components/`.
- Keep database logic out of UI components when possible.
- Use tenant slug in routes and tenant ID in database queries.
- Avoid cross-tenant queries without a tenant filter.

## Multitenancy

Each tenant has isolated:

- Staff users
- Citizens
- Departments
- Report categories
- Reports
- Services
- Hotlines
- News posts

Tenant is resolved from the URL slug.

## Authentication

Staff and citizen sessions are separate cookies:

- Staff sessions use `/api/auth/*`.
- Citizen sessions use `/api/tenant/[tenantSlug]/citizens/*`.

Use a strong `ADMIN_JWT_SECRET` in production.
