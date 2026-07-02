# Admin Guide

This guide explains how tenant admins and staff users manage reports and public content.

## Admin URL

```text
/:tenant/admin/login
/:tenant/admin
```

Local examples:

```text
http://localhost:3000/san-pablo/admin/login
http://localhost:3000/demo-city/admin/login
```

## Demo admin login

```text
San Pablo:
Email: admin@sanpablo.local
Password: admin12345

Demo City:
Email: admin@demo-city.local
Password: admin12345
```

## Admin areas

The admin dashboard has three main sections:

| Section | Purpose |
| --- | --- |
| Command Center | Review, filter, assign, and update citizen reports. |
| Content Studio | Manage public services, hotlines, news, categories, departments, and staff users. |
| Tenant Settings | Update tenant name, copy, contact info, and primary color. |

## Command Center workflow

1. Login as an admin.
2. Open the Command Center.
3. Use filters to narrow the report queue:
   - Search text
   - Status
   - Category
   - Department
   - Priority
4. Select a report from the queue.
5. Review the report details:
   - Citizen name/contact
   - Category
   - Location
   - Description
   - Attachments
   - Timeline
6. Update the report:
   - Status
   - Priority
   - Department assignment
   - Public or internal update message
7. Save progress.

## Public vs internal updates

When saving a report update, the admin can mark it as public or internal.

- Public updates appear on the citizen tracker and citizen dashboard.
- Internal updates only appear in the admin timeline.

## Report statuses

| Status | Meaning |
| --- | --- |
| `SUBMITTED` | Citizen submitted the report and it is waiting for review. |
| `REVIEWING` | Staff is checking the report details. |
| `ASSIGNED` | Report has been assigned to a department. |
| `IN_PROGRESS` | Department or staff is working on the issue. |
| `RESOLVED` | Issue has been completed. |
| `REJECTED` | Report was rejected or cannot be processed. |

## Report priorities

| Priority | Suggested use |
| --- | --- |
| `LOW` | Informational or non-urgent concern. |
| `NORMAL` | Default priority for standard city requests. |
| `HIGH` | Needs faster review. |
| `URGENT` | Time-sensitive or safety-related concern. |

## CSV export

The Command Center has an Export CSV button. It exports reports using the current filters so staff can share, archive, or analyze report queues outside the app.

## Content Studio

The Content Studio manages the public tenant content.

### Services

Use this for public city services, permit links, forms, or department information.

Fields:

- Title
- Description
- Department label
- Link URL
- Sort order
- Active flag

### Hotlines

Use this for emergency and general contact numbers.

Fields:

- Name
- Description
- Phone
- Sort order
- Emergency flag
- Active flag

### News

Use this for announcements and updates.

Fields:

- Title
- Excerpt
- Content
- Image URL
- Publish date
- Published flag

### Report Categories

Use this to control citizen report category cards.

Examples:

- Road Concern
- Garbage Concern
- Streetlight Concern
- Drainage Concern
- Public Safety

### Departments

Use this for assignment targets in the Command Center.

Examples:

- Public Works
- Waste Management
- Public Safety
- Business Permits

### Staff Users

Admin users can create and archive staff accounts.

Rules:

- Password is required when creating a new user.
- Password can be left blank when editing an existing user.
- At least one active admin must remain.
- A logged-in admin cannot archive their own account.

## Tenant Settings

Tenant settings control the public identity of a city/tenant:

- Tenant name
- City name
- Tagline
- Description
- Email
- Phone
- Address
- Primary color

The primary color is visible in the public shell and branding elements.

## Recommended admin operating process

1. Review new reports daily.
2. Move valid reports from `SUBMITTED` to `REVIEWING`.
3. Assign department ownership as early as possible.
4. Use public updates for citizen-facing progress.
5. Use internal updates for staff-only notes.
6. Resolve reports only when the action is completed or officially closed.
