# Deployment Guide

## Requirements

- Hosted PostgreSQL database
- Vercel project
- Environment variables

## Environment Variables

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
ADMIN_JWT_SECRET="replace-this-with-a-long-secure-random-value"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## Deploy to Vercel

1. Push the project to a Git repository.
2. Import the project in Vercel.
3. Add the environment variables.
4. Deploy.
5. Run database setup from a trusted terminal:

```bash
npm run db:push
npm run db:seed
```

## Production Checklist

- Replace starter passwords.
- Use a strong `ADMIN_JWT_SECRET`.
- Confirm the PostgreSQL database is persistent.
- Review organization contact details.
- Review service content, hotlines, news, categories, and departments.
- Add real file storage before heavy production usage.
- Configure observability and error reporting.

## Stellar Testnet Environment Variables

For real Stellar Testnet payments, set these in Vercel in addition to `DATABASE_URL` and `ADMIN_JWT_SECRET`:

```env
STELLAR_WALLET_ENCRYPTION_KEY="long-random-secret"
STELLAR_NETWORK="TESTNET"
STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
STELLAR_FRIENDBOT_URL="https://friendbot.stellar.org"
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_APP_URL="https://your-vercel-domain.vercel.app"
```

## Runtime Settings In PostgreSQL

After the database is migrated and seeded, root admins can manage safe env-like runtime values from the platform console:

```text
/root -> Runtime settings
```

These settings are stored in the `RuntimeSetting` table and can also be managed through:

```text
GET   /api/platform/settings
PATCH /api/platform/settings
```

Database-managed keys:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_AUTH_PROVIDER
STELLAR_NETWORK
STELLAR_HORIZON_URL
STELLAR_FRIENDBOT_URL
STELLAR_NETWORK_PASSPHRASE
```

Do not move bootstrap secrets into the database:

```text
DATABASE_URL
ADMIN_JWT_SECRET
STELLAR_WALLET_ENCRYPTION_KEY
```

Those must remain Vercel environment variables because the app needs them to connect to the database, sign sessions, and decrypt wallet secrets.

After deploy, log in to each tenant admin portal and generate or import that tenant's receiving wallet under **Settings → Real Stellar Testnet wallet**.

Do not set Mainnet values until the app has gone through policy, compliance, security, and accounting review.
