# Citizen User Guide

This guide explains how a citizen uses the public tenant app.

## Public tenant URL

Each tenant has its own route:

```text
/san-pablo
/laguna-province
```

For local testing:

```text
http://localhost:3000/san-pablo
http://localhost:3000/laguna-province
```

## Main citizen pages

| Page | Purpose |
| --- | --- |
| `/:tenant` | Public home page with city services, report CTA, hotlines, and announcements. |
| `/:tenant/report` | Submit a city concern or service report. |
| `/:tenant/track` | Track a report using the generated reference number. |
| `/:tenant/services` | Browse available city services and public links. |
| `/:tenant/hotlines` | View emergency and non-emergency contact numbers. |
| `/:tenant/news` | View city announcements. |
| `/:tenant/news/:postId` | Read a full announcement. |
| `/:tenant/register` | Create a citizen account. |
| `/:tenant/login` | Login as a citizen. |
| `/:tenant/dashboard` | View citizen-owned reports and latest updates. |

## Local citizen login

```text
San Pablo:
Email: maria.santos@sanpablo.local
Password: citizen12345

Laguna Province:
Email: ana.reyes@laguna.local
Password: citizen12345
```

## Submit a report as a guest

1. Open `/:tenant/report`.
2. Choose a report category.
3. Enter your name.
4. Add an optional phone or email.
5. Enter the report title, description, and location.
6. Optionally upload a JPG, PNG, WEBP, or GIF photo up to 4MB.
7. Submit the report.
8. Save the generated reference number.
9. Open `/:tenant/track?reference=REFERENCE_CODE` or manually enter the code on the tracking page.

Guest reports work without an account, but the citizen must keep the reference number.

## Submit a report while logged in

1. Login at `/:tenant/login`.
2. Open `/:tenant/report`.
3. The form automatically fills the citizen name, email, and phone when available.
4. Submit the report.
5. The report appears automatically in `/:tenant/dashboard`.

## Track a report

1. Open `/:tenant/track`.
2. Enter the reference number, for example:

```text
SPC-2026-0001
DC-2026-0001
```

3. The tracker shows:
   - Current status
   - Progress bar
   - Category
   - Assigned department
   - Location
   - Description
   - Public photos
   - Public update trail

## Citizen dashboard

The citizen dashboard shows:

- Citizen level
- Total reports
- Active reports
- Resolved reports
- Report history
- Latest public update per report
- Progress bar per report
- Direct tracker link

## User experience notes

The public UI is intentionally mobile-first. Citizens can submit and track reports from a phone without needing to use the admin dashboard.

The interface uses clear progress indicators, reference numbers, and report history to make civic reporting easy to follow without using playful language that could feel unprofessional for government use.
