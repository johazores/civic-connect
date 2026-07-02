# Civic Connect Multitenant

A simple, scalable, multitenant civic services starter for city, municipality, barangay, campus, subdivision, or community service apps.

This is a working MVP, not just a static clone. It includes a public citizen experience, tenant-aware APIs, issue reporting, tracking, admin report operations, content management, tenant settings, citizen accounts, staff management, and a mobile-first civic SaaS UI.

## Current Status

Verified in this package:

- `npm run lint` passes
- `npm run typecheck` passes
- `npm run build` passes
- Next.js production routes compile successfully
- APIs are tenant-scoped by `tenantSlug` / `tenantId`
- Report photo upload works without writable server storage by storing validated data URLs
- Citizen login/dashboard, guest reports, admin dashboard, CSV export, staff management, full hotlines page, and news detail pages are included

## Tech Stack

- Next.js App Router for rendered pages
- `pages/api` for backend routes
- React + TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL for Vercel-ready deployment
- JWT cookie auth for tenant admins and citizens

PostgreSQL is used by default so the project is ready for Vercel deployment with persistent data.

## Getting Started

```bash
cp .env.example .env
# update DATABASE_URL with your PostgreSQL connection string
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open the public tenants:

```text
http://localhost:3000/san-pablo
http://localhost:3000/demo-city
```

## Demo Accounts

Admin:

```text
San Pablo:
Email: admin@sanpablo.local
Password: admin12345

Demo City:
Email: admin@demo-city.local
Password: admin12345
```

Citizen:

```text
San Pablo:
Email: citizen@sanpablo.local
Password: citizen12345

Demo City:
Email: citizen@demo-city.local
Password: citizen12345
```

## Build Check

```bash
npm run lint
npm run typecheck
npm run build

# or run all checks
npm run verify
```

## Tenant Routes

```text
/:tenant
/:tenant/report
/:tenant/track
/:tenant/services
/:tenant/hotlines
/:tenant/news
/:tenant/news/:postId
/:tenant/login
/:tenant/register
/:tenant/dashboard
/:tenant/admin/login
/:tenant/admin
```

Example:

```text
/san-pablo
```

## Citizen Features

- Modern civic SaaS landing page
- Mobile-first sticky navigation
- Service directory
- News and announcements
- Emergency hotline cards
- Full emergency hotlines page
- Report issue form
- Category card selection
- Optional photo upload
- Auto-generated tenant-aware report reference number
- Public report tracking
- Progress bar and update trail
- Public attachments shown in tracking view
- Full news detail pages
- Citizen registration and login
- Citizen dashboard with owned reports
- Guest report support
- Logged-in reports automatically attach to the citizen account

## Admin Features

- Tenant admin login
- Report command center
- Report stats
- Report search
- Filter by status, category, department, and priority
- Assign report to department
- Update status
- Update priority
- Public or internal update messages
- Report timeline
- Report attachments preview
- CSV report export
- Content Studio CRUD/archive for:
  - Services
  - Hotlines
  - News
  - Report categories
  - Departments
  - Staff users
- Tenant settings editor for:
  - Tenant name
  - City name
  - Tagline
  - Description
  - Email
  - Phone
  - Address
  - Primary color

## API Routes

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

POST /api/tenant/:tenantSlug/citizens/register
POST /api/tenant/:tenantSlug/citizens/login
POST /api/tenant/:tenantSlug/citizens/logout
GET  /api/tenant/:tenantSlug/citizens/me
GET  /api/tenant/:tenantSlug/citizens/reports

GET  /api/tenant/:tenantSlug
GET  /api/tenant/:tenantSlug/reports
POST /api/tenant/:tenantSlug/reports
GET  /api/tenant/:tenantSlug/reports/export
GET  /api/tenant/:tenantSlug/reports/:referenceCode
PATCH /api/tenant/:tenantSlug/reports/:referenceCode

GET  /api/tenant/:tenantSlug/services
POST /api/tenant/:tenantSlug/services
PATCH /api/tenant/:tenantSlug/services/:id
DELETE /api/tenant/:tenantSlug/services/:id

GET  /api/tenant/:tenantSlug/hotlines
POST /api/tenant/:tenantSlug/hotlines
PATCH /api/tenant/:tenantSlug/hotlines/:id
DELETE /api/tenant/:tenantSlug/hotlines/:id

GET  /api/tenant/:tenantSlug/news
POST /api/tenant/:tenantSlug/news
PATCH /api/tenant/:tenantSlug/news/:id
DELETE /api/tenant/:tenantSlug/news/:id

GET  /api/tenant/:tenantSlug/categories
POST /api/tenant/:tenantSlug/categories
PATCH /api/tenant/:tenantSlug/categories/:id
DELETE /api/tenant/:tenantSlug/categories/:id

GET  /api/tenant/:tenantSlug/departments
POST /api/tenant/:tenantSlug/departments
PATCH /api/tenant/:tenantSlug/departments/:id
DELETE /api/tenant/:tenantSlug/departments/:id

GET   /api/tenant/:tenantSlug/settings
PATCH /api/tenant/:tenantSlug/settings

GET    /api/tenant/:tenantSlug/users
POST   /api/tenant/:tenantSlug/users
PATCH  /api/tenant/:tenantSlug/users/:id
DELETE /api/tenant/:tenantSlug/users/:id

POST /api/uploads/reports
```

## Project Structure

```text
app/                 App Router pages
components/          Reusable UI and feature components
lib/                 Helpers, auth, db, formatters, request parsing
pages/api/           API routes
prisma/              Prisma schema and seed data
services/            Business/data access logic
types/               Shared TypeScript types
docs/                User, admin, developer, deployment, product, and marketing docs
```

## Documentation Index

Read these files for full guidance:

| File | Purpose |
| --- | --- |
| `docs/user-guide.md` | How citizens use the app. |
| `docs/admin-guide.md` | How admins/staff manage reports and content. |
| `docs/developer-guide.md` | Setup, scripts, structure, and coding guidance. |
| `docs/deployment-guide.md` | Vercel and production deployment notes. |
| `docs/architecture.md` | App architecture, data flow, and multitenancy model. |
| `docs/product-review.md` | Product review, market fit, target users, and MVP verdict. |
| `docs/stellarx-fit-review.md` | StellarX wishlist fit assessment and investor positioning. |
| `docs/stellarx-implementation-plan.md` | Practical implementation plan for Stellar Testnet payments, rewards, and transparency. |
| `docs/marketing-guide.md` | Positioning, pitch, pricing ideas, and demo script. |
| `docs/testing-guide.md` | Manual QA checklist for local testing. |
| `docs/feature-checklist.md` | Implemented features and known production enhancements. |
| `docs/review-notes.md` | Latest code/product/UX review notes. |
| `docs/next-steps.md` | Recommended next implementation steps. |

## Upload Notes

Photo uploads are intentionally simple for the MVP:

- The browser reads the file as a data URL.
- `/api/uploads/reports` validates the MIME type and size.
- The report stores that value in `ReportAttachment.imageUrl`.
- The upload API and report submission API both allow larger request bodies for the 4MB image limit.

This works locally and on Vercel without writable public storage. For a production app, replace this with S3, Cloudflare R2, Supabase Storage, or another object storage provider.

## Vercel Notes

The project builds successfully with `npm run build`. The `postinstall` script safely skips Prisma generation when `DATABASE_URL` is missing, but a real database URL is still required for the app to run with data.

For a real persistent Vercel deployment:

1. Use PostgreSQL from Neon, Supabase, Vercel Marketplace, or another managed database.
2. Set `DATABASE_URL` in Vercel.
3. Set a strong `ADMIN_JWT_SECRET` in Vercel.
4. Run the seed once after the database is ready.

PostgreSQL is now the default database because this project is intended for Vercel deployment and persistent production data.


## StellarX Direction

The current MVP is a working civic SaaS foundation. For a StellarX submission or investor demo, it should be positioned as a Stellar-powered civic trust platform, not just a city reporting dashboard.

Recommended Stellar focus:

1. Proof-of-payment for government/community services.
2. Civic participation rewards.
3. Environmental cleanup reward proofs.
4. Municipal transparency ledger.

Read `docs/stellarx-fit-review.md` and `docs/stellarx-implementation-plan.md` before building the Stellar module.

## Production Notes

Before production:

1. Connect a production PostgreSQL database.
2. Replace the demo admin and citizen passwords.
3. Set a strong `ADMIN_JWT_SECRET` for admin and citizen session signing.
4. Replace data URL photo storage with object storage if report volume grows.
5. Add rate limiting to report submission and login.
6. Add audit logs for admin actions.
7. Add email/SMS notifications.
8. Add a super-admin tenant provisioning flow if needed.
9. Add tenant onboarding and custom domains if this becomes SaaS.
10. Review branding/content permissions before using real city/government assets.

## Design Approach

The app follows a simple structure:

- App Router for rendered pages
- `pages/api` for backend routes
- No server actions
- No heavy state management
- Tenant isolation through `tenantId`
- Kebab-case file names
- Clean reusable components
- Simple APIs that are easy to move to a standalone backend later


## Latest UI / UX direction

The UI has been redesigned to remove the previous harsh neon/dark direction. The current design uses a premium civic SaaS style with soft blue/cyan accents, white glass-like cards, stronger typography, accessible contrast, and a real hamburger menu on mobile. See `docs/ui-redesign-notes.md` for the design rules.

The project is now PostgreSQL-first for Vercel deployment. Set `DATABASE_URL` to a hosted Postgres connection string before running `db:push` and `db:seed`.
