# Review Notes

## Latest review summary

The app has a coherent and usable MVP flow:

- Public tenant site
- Citizen registration/login
- Guest report submission
- Logged-in report submission
- Report tracking by reference number
- Citizen dashboard
- Admin login
- Admin report command center
- Department assignment
- Status/priority updates
- Public/internal timeline updates
- CSV export
- Content management
- Tenant settings
- Multiple seeded tenants

## Code review result

The codebase is simple and aligned with the intended style:

- `app/` handles rendered routes.
- `pages/api/` handles backend endpoints.
- `services/` contains reusable data/business logic.
- `lib/` contains helpers for auth, API responses, formatting, DB, and requests.
- UI is componentized without heavy abstraction.
- Tenant-owned APIs check tenant access.
- Build, lint, and typecheck pass.

## UX review result

The public UI is mobile-first and usable:

- Sticky public navigation
- Horizontal mobile nav
- Large rounded tap targets
- Card-based report categories
- Progress indicators
- Citizen dashboard stats
- Clear tracker timeline
- Public hotlines and services

The revised civic SaaS design keeps the experience professional and easier to trust:

- Report readiness score
- Clear progress/status language
- Citizen level
- Mission board admin dashboard
- Progress bars and status badges

## Improvements made during review

- Normalized admin email login to avoid casing issues.
- Avoided unnecessary object URL usage for image preview by using the validated data URL preview.
- Added client-side staff-user password guidance when creating users.
- Re-verified lint, typecheck, and production build.
- Added complete Markdown guides for users, admins, developers, deployment, testing, product review, architecture, and marketing.

## Remaining production gaps

These are not blockers for local testing or MVP demo, but they should be added before production sales:

- PostgreSQL migration
- Object storage for uploads
- Rate limiting
- CAPTCHA/abuse protection
- Audit logs
- Email/SMS notifications
- Super-admin tenant onboarding
- Custom domains
- Formal role permission matrix
- Automated integration tests

## App-market fit review

The app makes sense because it is not just CRUD. It covers a real operational loop:

```text
Citizen concern -> reference number -> staff queue -> department assignment -> public status updates -> citizen tracking
```

This is strong enough for a product demo and pilot discussion.

The best market entry is smaller organizations first, such as barangays, subdivisions, campuses, and local community teams. These groups can validate the workflow faster than a large city procurement process.


## UI correction pass

The public UI was revised to remove the harsh neon/dark direction. The current direction uses a calmer civic SaaS palette: white surfaces, soft blue accents, slate text, lighter shadows, rounded but not exaggerated cards, clearer spacing, and mobile-first navigation. The goal is to feel trustworthy for government/community users while still looking modern enough for a product demo.
