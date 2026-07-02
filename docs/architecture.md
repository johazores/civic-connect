# Architecture

## High-level concept

Civic Connect is a multitenant citizen service platform.

Each tenant represents a city, municipality, barangay, or organization. A tenant has its own public app, citizens, staff users, services, hotlines, news, departments, categories, and reports.

## Main actors

| Actor | Description |
| --- | --- |
| Guest citizen | Can browse public content, submit reports, and track by reference number. |
| Registered citizen | Can login, submit reports, and see owned reports in a dashboard. |
| Staff user | Can login to admin and manage reports depending on role. |
| Admin user | Can manage reports, content, tenant settings, and staff users. |
| Tenant | The city/organization being served. |

## Main data flow

### Public report submission

1. Citizen opens `/:tenant/report`.
2. Frontend loads active report categories.
3. Citizen fills the form.
4. Optional image is validated by `/api/uploads/reports`.
5. Report is created through `/api/tenant/:tenantSlug/reports`.
6. Backend validates the tenant and category.
7. Backend generates a unique reference code.
8. Report and initial public update are saved.
9. Citizen receives the reference code.

### Report tracking

1. Citizen opens `/:tenant/track`.
2. Citizen enters reference code.
3. Frontend calls `/api/tenant/:tenantSlug/reports/:referenceCode`.
4. API returns only public updates.
5. UI displays progress, department, location, attachments, and update trail.

### Admin report management

1. Admin logs in with `/api/auth/login`.
2. Admin opens `/:tenant/admin`.
3. Dashboard calls `/api/tenant/:tenantSlug/reports`.
4. Admin filters and selects a report.
5. Admin updates status, priority, department, and message.
6. API verifies tenant-admin access.
7. Report is updated and a timeline entry is created.
8. Public updates appear to citizens; internal updates remain admin-only.

## Tenant isolation

The important rule is that every tenant-owned operation must include `tenantId`.

Examples:

```ts
where: { tenantId: auth.tenant.id }
```

or:

```ts
where: {
  id,
  tenantId: auth.tenant.id
}
```

This prevents one tenant from accessing another tenant's records.

## Database model summary

| Model | Purpose |
| --- | --- |
| `Tenant` | City/organization configuration. |
| `User` | Admin/staff user. |
| `Citizen` | Public citizen account. |
| `Department` | Report assignment target. |
| `ReportCategory` | Public category card for reports. |
| `Report` | Main citizen report/request record. |
| `ReportUpdate` | Status timeline message. |
| `ReportAttachment` | Report image reference. |
| `Service` | Public services directory item. |
| `Hotline` | Public hotline contact. |
| `NewsPost` | Public news/announcement item. |

## Why this structure is simple and scalable

The codebase does not introduce a separate backend yet, but it keeps backend logic inside `pages/api` and shared data logic inside `services`.

This means the backend can later be moved to a standalone API without rewriting the whole app.

## Current boundaries

Included now:

- Tenant-scoped public app
- Tenant-scoped admin app
- Citizen accounts
- Report workflow
- Public content management
- Local/demo upload handling

Not included yet:

- Super-admin SaaS dashboard
- Custom domains
- Billing
- Advanced permission matrix
- Email/SMS delivery
- Geolocation map picker
