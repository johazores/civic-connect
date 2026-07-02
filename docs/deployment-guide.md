# Deployment Guide

This guide explains how to deploy the project and what must change before production.

## Local-first deployment status

The project uses PostgreSQL by default so local development and Vercel deployment follow the same database provider.

## Vercel-ready build

The project includes:

- `npm run build`
- `npm run vercel-build`
- `vercel.json`
- Safe Prisma postinstall script

Build command:

```bash
npm run vercel-build
```

## Environment variables

Required locally:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
ADMIN_JWT_SECRET="change-this-long-secret-before-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Required for production:

```env
DATABASE_URL="postgresql://..."
ADMIN_JWT_SECRET="use-a-long-random-secret"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Recommended production database

Use PostgreSQL for production.

Examples:

- Neon
- Supabase Postgres
- Vercel Postgres / marketplace database
- Railway Postgres
- Render Postgres

## Database setup

The Prisma datasource is already set to PostgreSQL. After setting `DATABASE_URL`, run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

For a real production app with existing users, use Prisma migrations instead of direct `db push`.

## Upload storage

Current MVP upload behavior:

- Browser reads image as data URL.
- Upload API validates MIME type and size.
- Report stores the data URL in the database.

This is useful for a demo and Vercel compatibility, but not ideal for high-volume production.

Recommended production storage:

- Cloudflare R2
- S3
- Supabase Storage
- UploadThing
- Cloudinary

## Production hardening checklist

Before selling or deploying to real government/business users:

- Replace all demo passwords.
- Set a strong `ADMIN_JWT_SECRET`.
- Add rate limiting for login, register, report submission, and upload APIs.
- Add CAPTCHA or abuse protection for guest reports.
- Move uploads to object storage.
- Add audit logs for admin actions.
- Add email/SMS notifications.
- Add role permissions per module.
- Add automated tests for critical flows.
- Add backup and restore process.
- Add privacy policy and terms.
- Confirm branding/content permission for each tenant.

## Suggested Vercel flow

1. Push project to GitHub.
2. Import to Vercel.
3. Set environment variables.
4. Add PostgreSQL database.
5. Deploy.
6. Run database setup once.
7. Login with seeded admin.
8. Replace seeded demo data.
