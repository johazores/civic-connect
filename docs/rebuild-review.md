# Rebuild Review

## Goal

Build a clean multitenant version of a civic services app inspired by the reviewed site concept.

The app should not copy protected source code or private assets. It should rebuild the same type of product with original structure, original components, and working features.

## Product Direction

This should be a white-label civic platform for cities, municipalities, barangays, or organizations.

Each tenant can have its own:

- Public landing page
- Services directory
- News and announcements
- Emergency hotlines
- Citizen issue reporting
- Report tracking
- Admin dashboard

## MVP Modules

### Public Citizen App

- Home page
- Report an issue
- Track a report
- Services directory
- News page
- Hotline cards

### Admin App

- Tenant admin login
- Report list
- Report details
- Report status updates
- Public update messages
- Basic dashboard stats

## Multitenant Strategy

Current MVP uses tenant slug routing:

```text
/san-pablo
/san-pablo/report
/san-pablo/track
/san-pablo/admin
```

Production can later support:

```text
sanpablo.yourdomain.com
connect.sanpablo.gov.ph
```

## Data Model

The schema starts with these main models:

- Tenant
- User
- Department
- ReportCategory
- Report
- ReportUpdate
- ReportAttachment
- Service
- Hotline
- NewsPost

## Build Style

- Keep code simple
- App Router for UI pages
- `pages/api` for backend endpoints
- Prisma services for data logic
- Tailwind only
- kebab-case file names
- No heavy state library
- No unnecessary abstractions
