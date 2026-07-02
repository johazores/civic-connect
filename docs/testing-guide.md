# Testing Guide

Use this checklist after running the app locally.

## Setup test

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000/san-pablo
```

## Build test

```bash
npm run verify
```

Expected:

- Lint passes
- TypeScript passes
- Production build passes

## Public pages test

Check these routes:

```text
/san-pablo
/san-pablo/report
/san-pablo/track
/san-pablo/services
/san-pablo/hotlines
/san-pablo/news
/san-pablo/news/POST_ID_FROM_NEWS_PAGE
/san-pablo/login
/san-pablo/register
/san-pablo/dashboard
```

Repeat basic checks for:

```text
/laguna-province
```

## Citizen test

1. Login at `/san-pablo/login`.
2. Use:

```text
maria.santos@sanpablo.local
citizen12345
```

3. Confirm dashboard loads.
4. Submit a report from `/san-pablo/report`.
5. Confirm account details are filled automatically.
6. Save the reference number.
7. Confirm the new report appears in `/san-pablo/dashboard`.
8. Open tracker using the direct link.
9. Confirm the tracker shows status, details, and timeline.
10. Logout.

## Guest report test

1. Open `/san-pablo/report` while logged out.
2. Submit a report as guest.
3. Save the reference number.
4. Open `/san-pablo/track`.
5. Enter the reference number.
6. Confirm the report loads.

## Photo upload test

1. Submit a report with a JPG, PNG, WEBP, or GIF photo under 4MB.
2. Confirm the preview appears before submit.
3. Submit the report.
4. Track the report.
5. Confirm the attachment appears.
6. Try uploading a file larger than 4MB.
7. Confirm the UI/API rejects it.
8. Try uploading a non-image file.
9. Confirm the UI/API rejects it.

## Admin test

1. Open `/san-pablo/admin/login`.
2. Use:

```text
admin@sanpablo.local
admin12345
```

3. Confirm dashboard loads.
4. Select a report.
5. Update status to `REVIEWING`.
6. Assign a department.
7. Change priority.
8. Add a public update message.
9. Save progress.
10. Open the public tracker and confirm the update appears.
11. Add an internal update.
12. Confirm it appears in admin timeline but not public tracker.

## Admin filters test

Check these filters:

- Search
- Status
- Category
- Department
- Priority
- Unassigned department

Confirm the report queue updates correctly.

## CSV export test

1. Apply a filter.
2. Click Export CSV.
3. Confirm a CSV downloads or opens.
4. Confirm exported rows match the filtered queue.

## Content Studio test

Test create/edit/archive for:

- Services
- Hotlines
- News
- Report categories
- Departments
- Staff users

After changing public content, open the public pages and confirm updates are visible.

## Tenant settings test

1. Open Tenant Settings.
2. Change tagline or primary color.
3. Save.
4. Open the public site.
5. Confirm the public shell reflects the change.

## Multitenancy test

1. Login as San Pablo admin.
2. Check San Pablo reports.
3. Logout.
4. Login as Laguna Province admin.
5. Check Laguna Province reports.
6. Confirm San Pablo reports are not visible in Laguna Province.
7. Repeat the same check for citizen accounts.

## Mobile responsiveness test

Use browser responsive tools and check:

- Home page navigation scrolls horizontally on mobile.
- Report form is usable on narrow screens.
- Category cards stack properly.
- Dashboard cards stack properly.
- Admin dashboard remains usable on tablet/mobile.
- Buttons are large enough to tap.
- Text does not overflow.

## Known environment limitation

The packaging sandbox could run lint, typecheck, and build. It could not run Prisma database commands because the Prisma engine binary host was unreachable from the sandbox.

Run `db:push` and `db:seed` locally with internet access.
