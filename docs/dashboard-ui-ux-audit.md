# Admin and Citizen Dashboard UI/UX Audit

## Design review summary

This pass focused on the two most important logged-in workspaces: the Admin Dashboard and the Citizen Dashboard. The goal was to move both screens away from a scattered prototype feel and into a calmer, more structured SaaS experience inspired by products such as Linear, Stripe Dashboard, Vercel, Notion, GitHub, and Clerk.

The redesign does not copy those products. It applies the same product design principles:

- persistent navigation for important admin workflows
- clear page titles and one primary action per area
- compact but readable analytics
- consistent cards, forms, tabs, buttons, and status states
- reduced border radius so the product feels more professional
- better scan paths for operators and citizens
- mobile-first layouts with thumb-friendly actions

## Main problems identified

### Admin Dashboard

Before this pass, the admin screen had too many unrelated elements stacked vertically. Reports, metrics, navigation, filters, selected report details, and actions were visually similar, which made it harder to understand what mattered first.

Issues found:

- top navigation felt like a loose tab bar instead of an operations workspace
- large hero area used too much space for repeat visitors
- stats were disconnected from the active workflow
- filters were visually heavy and not clearly separated from the queue
- report list and selected report detail lacked a strong master-detail hierarchy
- actions were placed far down the page and competed visually with content
- aggressive rounded corners were used on nearly every component
- empty and loading states were basic text instead of designed states

### Citizen Dashboard

The citizen dashboard was functional but did not feel like a modern user account area. It needed a clearer personal summary, quick actions, and report cards that feel easier to scan on mobile.

Issues found:

- welcome area felt oversized and not very useful after first login
- account information competed with report activity
- quick actions were not prominent enough
- report cards looked similar to admin cards instead of citizen-facing activity cards
- mobile experience did not feel app-like enough
- empty state lacked guidance and reassurance

## Design changes implemented

### Shared dashboard system

Added dashboard-specific styles in `app/globals.css`:

- `dashboard-shell`
- `dashboard-container`
- `dashboard-card`
- `dashboard-card-muted`
- `dashboard-kicker`
- `dashboard-tab`
- `dashboard-sidebar-item`
- `dashboard-table`
- `dashboard-empty`
- `skeleton-line`

These utilities create a more consistent design language across admin and citizen dashboards.

### Border radius refinement

The previous design relied too much on very large rounded corners. This made cards, forms, and controls feel inflated and inconsistent.

Updated direction:

- main cards: `rounded-2xl`
- buttons and inputs: `rounded-xl`
- small pills/badges: `rounded-full`
- removed most arbitrary `rounded-[1.5rem]` / `rounded-[1.65rem]` patterns

This makes the interface feel calmer and more professional.

### Admin Dashboard redesign

The Admin Dashboard now uses a proper operations shell:

- desktop sidebar navigation
- compact mobile tab fallback
- structured header for the active module
- module-specific title and description
- compact active/urgent/resolved metric strip
- clear navigation sections:
  - Reports
  - Payments
  - Civic Trust
  - Content
  - Settings

This improves orientation because staff can quickly see where they are and switch modules without scanning a crowded header.

### Citizen Dashboard redesign

The Citizen Dashboard was rebuilt around a user account experience:

- personal welcome summary
- quick action cards for report, payment, and tracking
- account sidebar with citizen identity and current activity
- improved report history cards
- clearer progress indicators
- better latest update presentation
- designed empty state
- skeleton loading state

This makes it feel more like a modern citizen service app instead of an admin template reused for users.

### Component refinements

Updated shared UI components:

- `Card`
- `Button`
- `Input`
- `Textarea`
- `Select`
- `StatCard`

Changes:

- reduced over-rounding
- improved padding scale
- stronger focus states
- better shadows
- improved hover movement
- cleaner typography weights
- optional stat icons

## User flow improvements

### Admin reports

The admin flow is now clearer:

1. choose the Reports module from the sidebar
2. view operational stats
3. filter the queue
4. select a report
5. update status, priority, department, and message
6. review the timeline

### Citizen dashboard

The citizen flow is now clearer:

1. see account summary
2. choose the next action: new report, pay service fee, or track request
3. review open activity
4. open a report tracker from the report card
5. sign out from a visible but secondary control

## Responsive behavior

Admin:

- desktop uses sidebar navigation
- smaller screens use horizontal module tabs
- cards and filters stack vertically
- report detail remains readable on narrow screens

Citizen:

- quick action cards stack cleanly
- sidebar content moves below the intro on mobile
- report cards are mobile-first and scan like activity feed items
- buttons remain thumb-friendly

## Files changed

Primary files:

- `components/admin/admin-dashboard.tsx`
- `components/public/citizen-dashboard.tsx`
- `components/ui/card.tsx`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/select.tsx`
- `components/ui/stat-card.tsx`
- `app/globals.css`

## Verification

The following checks passed after the dashboard redesign:

```bash
npm run lint
npm run typecheck
npm run build
```

The build completed successfully with `BUILD_EXIT:0`.
