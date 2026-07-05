# Clerk Migration Plan

Clerk is a good candidate for hosted identity, but it should not replace the current auth until tenant roles and seeded demo accounts have a migration plan.

Current status:

- Clerk is not installed.
- Current custom auth remains the default.
- `NEXT_PUBLIC_AUTH_PROVIDER="custom"` is the default feature flag.
- `User.clerkUserId` is optional preparation only.

## Current Auth

### Citizen Login

Citizens are stored in the `Citizen` table.

Current routes:

```text
POST /api/tenant/[tenantSlug]/citizens/login
POST /api/tenant/[tenantSlug]/citizens/register
GET  /api/tenant/[tenantSlug]/citizens/me
POST /api/tenant/[tenantSlug]/citizens/logout
```

The API sets the `civic_citizen_token` cookie. The token is a JWT signed with `ADMIN_JWT_SECRET` and contains `citizenId` and `tenantId`.

### Admin Login

Tenant staff/admin users are stored in the `User` table with roles:

```text
ADMIN
STAFF
```

The API sets the `civic_token` cookie. The token contains `userId` and `tenantId`.

### Platform Admin Login

Platform admins are stored in `PlatformAdmin`.

The API sets the `civic_platform_token` cookie. This is separate from tenant admin login.

### Tenant Scope

Tenant-scoped checks use helper functions in `lib/auth.ts`:

- `requireTenantAdmin`
- `requireTenantCitizen`
- `requirePlatformAdmin`

These helpers verify cookies and confirm the user belongs to the requested tenant.

## Proposed Clerk Structure

Future Clerk auth should separate identity from tenant access.

Recommended model:

- Clerk user identity owns sign-in, email verification, and sessions.
- Local `User` table stores `clerkUserId`.
- A future `TenantMembership` table maps users to tenants.
- Roles become tenant membership roles: `CITIZEN`, `STAFF`, `ADMIN`.
- Admin routes check tenant role.
- Citizen routes check login and tenant membership.
- Public routes remain public.

Potential future table:

```prisma
model TenantMembership {
  id        String   @id @default(cuid())
  tenantId  String
  userId    String
  role      TenantRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([tenantId, userId])
  @@index([tenantId])
  @@index([userId])
}

enum TenantRole {
  CITIZEN
  STAFF
  ADMIN
}
```

Do not add this table until the migration shape is confirmed.

## Phase 1: Clerk Shell

Goals:

- Install Clerk packages.
- Add `ClerkProvider`.
- Add middleware or proxy protection.
- Add sign-in and sign-up pages.
- Store `clerkUserId` in local users.
- Keep `NEXT_PUBLIC_AUTH_PROVIDER="custom"` as the default until tested.

Do not remove current cookies yet.

## Phase 2: Citizen Auth Migration

Goals:

- Replace citizen login and registration with Clerk.
- Link existing `Citizen` rows to Clerk users.
- Preserve seeded demo citizen accounts or document replacements.
- Keep admin auth temporarily if needed.

Key risk: existing reports, payment intents, civic actions, and receipts reference `Citizen` rows.

## Phase 3: Admin Auth Migration

Goals:

- Replace tenant admin login with Clerk.
- Add tenant role protection.
- Decide whether Clerk Organizations are needed for tenant teams.
- Map existing `User` rows to Clerk users.
- Preserve seeded admin accounts or document replacements.

Key risk: tenant admin authorization is role and tenant dependent, not just "signed in".

## Phase 4: Remove Old Auth

Goals:

- Remove old login routes only after all users have migrated.
- Remove old password fields only after backups and rollback planning.
- Remove old cookies.
- Keep public routes public.
- Update all docs and seed data.

## Risks

- Clerk install is easy.
- Tenant-aware role migration is medium complexity.
- Mixing Clerk and old auth forever will create maintenance risk.
- Breaking seeded admin/citizen demo accounts would hurt demos.
- Clerk environment variables must not be required while custom auth is active.

## Current Non-Breaking Prep

Implemented safe preparation:

- `.env.example` includes `NEXT_PUBLIC_AUTH_PROVIDER="custom"`.
- `lib/auth-provider.ts` resolves `custom` vs `clerk`.
- `User.clerkUserId` is optional and indexed.

No Clerk runtime dependency is installed. No existing auth route has been changed.

Deployment note: because `User.clerkUserId` is a Prisma schema field, apply the schema to PostgreSQL with `npm run db:push` before deploying a generated Prisma client from this branch. The column is nullable, so the database change is additive.
