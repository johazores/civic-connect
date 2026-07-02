# Architecture

CivicTrust uses a simple multitenant architecture.

## Request Flow

1. User opens a tenant URL.
2. The app resolves the tenant by slug.
3. Public pages query tenant-scoped content.
4. API routes validate tenant scope before reading or writing data.
5. Staff and citizen sessions are checked before protected actions.

## Database Model

Main entities:

- Tenant
- User
- Citizen
- Department
- ReportCategory
- Report
- ReportUpdate
- ReportAttachment
- Service
- Hotline
- NewsPost

## Why This Structure Works

The model keeps the platform simple while supporting real operations:

- Tenants isolate data.
- Reports have categories, departments, status, priority, updates, and attachments.
- Public CMS content is tenant-managed.
- Staff users are scoped to a tenant.
- Citizen accounts are scoped to a tenant.

## Future Stellar Extension

Stellar modules should be added as separate tables:

- TenantWallet
- ServiceFee
- PaymentIntent
- PaymentReceipt
- StellarTransactionCheck

This keeps civic operations separate from payment logic.
