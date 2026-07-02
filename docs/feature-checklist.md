# Feature Coverage Checklist

This checklist tracks the features identified during the rebuild review and what is implemented in this package.

## Public Citizen App

- Landing page / city app home: implemented
- Mobile-first navigation: implemented
- Report an issue: implemented
- Report category selection: implemented
- Optional report photo: implemented through validated data URLs
- Photo upload body limit: implemented for the upload and report submission APIs
- Report reference generation: implemented and tenant-aware
- Track report by reference number: implemented
- Progress bar / timeline: implemented
- Services directory: implemented
- Emergency hotlines: implemented on home and full hotlines page
- One-tap call links: implemented with `tel:` links
- News list: implemented
- News detail page: implemented
- Citizen registration/login/logout: implemented
- Citizen dashboard / my reports: implemented
- Logged-in report ownership: implemented
- Guest report mode: implemented
- Direct tracker links with `?reference=`: implemented
- Tenant branding color visibility: implemented

## Admin App

- Admin login/logout: implemented
- Tenant-scoped auth: implemented
- Report dashboard: implemented
- Report search and filters: implemented
- Department assignment: implemented
- Status updates: implemented
- Priority updates: implemented
- Public/internal update messages: implemented
- Report attachment preview: implemented
- CSV export for filtered reports: implemented
- Services CRUD/archive: implemented
- Hotlines CRUD/archive: implemented
- News CRUD/unpublish: implemented
- Report categories CRUD/archive: implemented
- Departments CRUD/archive: implemented
- Staff user management: implemented
- Last active admin protection: implemented
- Tenant settings editor: implemented

## Multitenancy

- Tenant route isolation: implemented through `/:tenant`
- Tenant-scoped APIs: implemented through `/api/tenant/:tenantSlug/...`
- Tenant-specific admins: implemented
- Tenant-specific citizens: implemented
- Second demo tenant seed: implemented as `/demo-city`
- Tenant public content isolation: implemented
- Tenant report isolation: implemented

## Documentation

- README: implemented
- Citizen user guide: implemented
- Admin guide: implemented
- Developer guide: implemented
- Deployment guide: implemented
- Architecture notes: implemented
- Product review: implemented
- Marketing guide: implemented
- Testing guide: implemented
- Review notes: implemented
- Next steps: implemented

## Not Included Yet By Design

These are production enhancements, not required for the current working MVP:

- Citizen profile editing
- Email/SMS notifications
- Object storage for high-volume uploads
- Super-admin tenant provisioning UI
- Payment/billing integration
- Geolocation/map picker
- Full audit log table
- Rate limiting / CAPTCHA
- Formal module-level permission matrix
- Custom domain management
- Automated integration test suite
