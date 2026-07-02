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
