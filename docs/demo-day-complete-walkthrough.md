# CivicTrust Demo Day Complete Walkthrough

This guide is a start-to-finish demo script for CivicTrust. It is written for a presenter who has never used the project before.

Use it as a live checklist. Each section explains what the feature is for, how to open it, how to use it, what happens after each action, and what to mention during Demo Day.

## 1. Demo Goal

CivicTrust is a mobile-first civic services platform for LGUs, barangays, municipalities, and provinces.

The demo should prove three things:

1. Citizens can access local services from one simple public app.
2. Staff can manage reports, services, payments, content, approvals, and public records from one workspace.
3. Important civic payments and releases can become public proof records that citizens and auditors can check later.

Use plain language during the demo:

- Say `wallet address`, not `public key`.
- Say `private key`, not `secret key`.
- Say `payment ID`, not `transaction hash`.
- Say `receipt note`, not `memo`.
- Say `public record`, not `ledger`.
- Say `practice wallet` or `practice network` when using Testnet.

## 2. Demo Setup

### Local URL

If running locally:

```text
http://localhost:3000
```

Main demo tenants:

```text
http://localhost:3000/metro-city
http://localhost:3000/laguna-province
```

If using the deployed Vercel URL, replace `http://localhost:3000` with the deployed domain.

### Starter Accounts

Metro City staff:

```text
/metro-city/admin/login
admin@metrocity.local
admin12345
```

Metro City citizen:

```text
/metro-city/login
sofia.cruz@metrocity.local
citizen12345
```

Laguna Province staff:

```text
/laguna-province/admin/login
admin@laguna.local
admin12345
```

Laguna Province citizen:

```text
/laguna-province/login
ana.reyes@laguna.local
citizen12345
```

Platform root admin:

```text
/root/login
root@civictrust.local
root12345
```

### Recommended Demo Order

Use this order for the clearest story:

1. Landing page and tenant selection.
2. Public Metro City portal.
3. Report a concern.
4. Track a request.
5. Citizen account and dashboard.
6. Services and payment receipt flow.
7. Wallet setup and civic rewards.
8. Transparency and public records.
9. Tax receipt search.
10. News and hotlines.
11. Staff admin reports.
12. Staff admin payments.
13. Staff civic programs.
14. Staff content studio.
15. Staff settings, LGU wallet, and release approvals.
16. Practice payment playground.
17. Platform root console.
18. Closing value summary.

## 3. Start at the Landing Page

### What It Is For

The root landing page shows that CivicTrust is multi-tenant. A presenter can choose a city or province and then enter the correct public portal.

### How To Access

Open:

```text
/
```

### What To Show

The first screen shows:

- CivicTrust brand.
- Short value statement.
- Metro City Services card.
- Laguna Province Services card.
- `How it works` link.
- `Platform console` link.

### How To Use

1. Click `Metro City Services`.
2. The app opens `/metro-city`.
3. Explain that each LGU has its own public portal, staff users, wallet, services, records, and branding.

### Expected Behavior

The app should move from the global CivicTrust landing page to the Metro City public app.

### Demo Talking Point

Say:

> CivicTrust is not a single-city prototype. It is built as a multi-tenant civic platform, so each LGU can have separate services, staff, public records, and wallet settings.

## 4. How It Works Page

### What It Is For

The `How it works` page explains the product to judges before showing detailed workflows.

### How To Access

Open:

```text
/about
```

Or click `How it works` from the root page or app menu.

### What To Show

Show these sections:

- What CivicTrust is.
- The problem: citizens are asked to trust records they cannot see.
- Who uses it: citizens, staff, organizations.
- The journey: request, reference number, payment, confirmation, public receipt.
- Public proof explanation.
- Vision: rewards, cleanup incentives, budget transparency, tax receipts.

### Expected Behavior

The page should read like a product explainer. It should not require technical background to understand the civic value.

### Demo Talking Point

Say:

> The product is not a crypto dashboard. It is a civic app. Stellar is used only where public proof is valuable: payments, rewards, public fund releases, and receipts.

## 5. Metro City Home Screen

### What It Is For

The tenant home screen is the citizen's main entry point. It gives quick access to reporting, tracking, payments, civic rewards, services, hotlines, news, and public records.

### How To Access

Open:

```text
/metro-city
```

### What To Show

The screen includes:

- City name and tagline.
- Quick actions:
  - Report
  - Track
  - Pay
  - Rewards
- Services preview.
- Civic trust links:
  - Payment receipts
  - Civic rewards
  - Budget transparency
  - Tax receipts
- Hotlines preview.
- Latest updates.
- Bottom tab bar:
  - Home
  - Track
  - Report
  - Pay
  - Me
- Hamburger menu with grouped navigation.

### How To Use

1. Point out the bottom tab bar.
2. Open the hamburger menu.
3. Show grouped sections:
   - Services
   - Requests
   - Civic trust
   - Updates
4. Close the menu.

### Expected Behavior

The user should understand what they can do without needing a staff member to explain the app.

### Demo Talking Point

Say:

> The home screen is built for citizens. The main actions are direct: report, track, pay, and receive rewards.

## 6. Report A Concern

### What It Is For

Citizens use this flow to submit local issues such as road damage, waste collection problems, lighting issues, safety concerns, or permit/service concerns.

### How To Access

Open:

```text
/metro-city/report
```

Or tap the center `Report` button in the bottom tab bar.

### Screen 1: Category

Purpose:

- Select the kind of concern.

How to use:

1. Choose a category such as `Roads and Infrastructure`, `Waste and Sanitation`, `Streetlights and Utilities`, `Public Safety`, or `Permits and Services`.
2. Click `Continue`.

What happens:

- The form moves to the Details step.
- The page scrolls to the top of the next step so the step title is visible.

Important note:

- If no category is selected, the user sees a validation message.

### Screen 2: Details

Purpose:

- Explain the issue clearly.

How to use:

1. Enter a short report title.
2. Enter a description.
3. Enter the location, such as a street, barangay, landmark, or area.
4. Click `Continue`.

What happens:

- The form validates required fields.
- The form moves to the Contact step.
- The page scrolls to the top of the next step.

Important note:

- Missing title, description, or location stops the user and shows a clear message.

### Screen 3: Contact

Purpose:

- Capture who submitted the concern.

How to use:

1. If signed in, the app fills in citizen details.
2. If not signed in, enter name manually.
3. Email and phone are optional.
4. Click `Continue`.

What happens:

- The form moves to Review.

Important note:

- Name is required.
- Reports can still be submitted without a citizen account.

### Screen 4: Review

Purpose:

- Let the citizen confirm the report before submission.

How to use:

1. Optionally add a photo.
2. Review category, title, location, and reporter.
3. Click `Submit report`.

What happens:

- If a photo was selected, it is uploaded first.
- The report is created.
- A reference number is generated.
- The success screen appears.

### Success Screen

Purpose:

- Give the citizen the reference number.

How to use:

1. Copy the reference number.
2. Click `Track this report`.

What happens:

- The user opens the tracker with the reference already filled in.

### Demo Talking Point

Say:

> The citizen leaves with a reference number immediately. That is important because it lets them follow the request without calling the office.

## 7. Track Request

### What It Is For

Citizens use this to check report status, assigned department, updates, and attachments.

### How To Access

Open:

```text
/metro-city/track
```

Or click `Track this report` from a submitted report.

### How To Use

1. Enter a reference number, for example:

```text
MCS-2026-0001
```

2. Click `Track request`.

### What Happens

If the reference exists:

- Report title appears.
- Status appears.
- Progress steps appear.
- Location and description appear.
- Updates appear.
- Attachments appear if available.

If the reference does not exist:

- The app shows a not-found message.

### Expected Status Flow

```text
Submitted -> Reviewing -> Assigned -> In Progress -> Resolved
```

### Demo Talking Point

Say:

> The tracking page reduces follow-up calls because citizens can see status and public updates from their phone.

## 8. Citizen Account Registration

### What It Is For

A citizen account lets reports stay connected to the citizen dashboard.

### How To Access

Open:

```text
/metro-city/register
```

Or open the menu and choose account creation from the sign-in flow.

### How To Use

1. Enter full name.
2. Enter email.
3. Enter phone number.
4. Enter password.
5. Submit.

### What Happens

- The account is created.
- The user is signed in.
- The app redirects to the citizen dashboard.

### Important Notes

- Passwords must meet the app rules.
- Existing email addresses cannot register again.
- For the seeded demo account, use the login flow instead:

```text
sofia.cruz@metrocity.local
citizen12345
```

## 9. Citizen Sign In

### What It Is For

Citizens sign in to see their reports and account details.

### How To Access

Open:

```text
/metro-city/login
```

### How To Use

1. Enter email.
2. Enter password.
3. Submit.

### What Happens

- The user is redirected to `/metro-city/dashboard`.
- If login fails, the app shows an error.

## 10. Citizen Dashboard

### What It Is For

The dashboard gives a citizen one place for report history, quick actions, and city contact details.

### How To Access

Open:

```text
/metro-city/dashboard
```

Or tap the bottom `Me` tab after signing in.

### What To Show

The dashboard includes:

- Citizen name and account info.
- Active report count.
- Resolved report count.
- Total report count.
- Quick actions:
  - New report
  - Pay service fee
  - Track request
- Report list.
- Profile details.
- City contact links.
- Sign out action.

### How To Use

1. Click a report card.
2. The app opens the tracker for that report.
3. Click `New report` to start another concern.
4. Click `Pay service fee` to open payments.
5. Click `Sign out` to end the citizen session.

### Expected Behavior

Signed-in citizens see their own reports only. If a citizen has no reports, the dashboard shows an empty state with a button to submit one.

## 11. Services Directory

### What It Is For

The services page lists city services and identifies which services require payment.

### How To Access

Open:

```text
/metro-city/services
```

Or use the menu: `Services -> Service directory`.

### How To Use

1. Review service cards.
2. Look for services that show a fee.
3. Click the payment button for a payable service.

### What Happens

- If the service is payable, the app opens the payment form with that service selected.
- If the service is informational, users read the service description and department.

### Demo Talking Point

Say:

> Services can be simple information pages or paid services. Staff can manage these from the admin content studio.

## 12. Service Payments

### What It Is For

Citizens use this workflow to pay a service fee and get a public receipt.

### How To Access

Open:

```text
/metro-city/payments
```

Or tap `Pay` in the bottom tab.

### Screen 1: Payment Details

How to use:

1. Choose a service such as `Business Permit Assistance`.
2. Confirm the service fee.
3. Enter payer name.
4. Enter email.
5. Enter phone.
6. Click `Continue to payment`.

What happens:

- The app creates a payment request.
- The user is redirected to `/metro-city/payments/[referenceCode]`.

Important notes:

- The payment request includes a receipt note that matches the payment to the request.
- The portal never asks for a citizen private key.

### Screen 2: Payment Request

What to show:

- Service title.
- Amount.
- Receipt note.
- Pay-to wallet address.
- QR code.
- `Open wallet payment` button.
- `Copy payment link` button.

How to use:

1. Scan the QR code with a practice wallet or supported wallet.
2. Or click `Open wallet payment`.
3. Complete the payment in the wallet.
4. Copy the payment ID from the wallet after sending.
5. Paste the payment ID into `Check your payment`.
6. Click `Check payment ID`.

Alternative:

- Click `Search by receipt note` if the payment was already sent and should be found by the app.

What happens after successful verification:

- The status changes to confirmed.
- A public proof card appears.
- A `View public receipt` button appears.

What happens if verification fails:

- The app shows a reason, such as wrong amount, wrong destination, missing payment, or unmatched receipt note.

### Screen 3: Public Receipt

How to access:

```text
/metro-city/receipts/[referenceCode]
```

What to show:

- Service name.
- Amount paid.
- Public proof status.
- Payer.
- Receipt note.
- Payment ID.
- Public record number.
- Confirmation date.

Expected behavior:

- A verified payment shows public proof.
- A pending payment shows the proof as waiting or pending.

### Demo Talking Point

Say:

> The citizen gets a public receipt tied to a payment ID. The LGU gets a cleaner audit trail, and the citizen has proof later.

## 13. Wallet Setup For Rewards

### What It Is For

Citizens need a wallet address to receive civic rewards.

### How To Access

Open:

```text
/metro-city/wallet
```

Or menu: `Civic trust -> Set up a wallet`.

### How To Use

1. Read the wallet explanation.
2. Click `Create practice wallet`.
3. Copy the wallet address.
4. Reveal the private key only if needed for practice.
5. Click `Add play money` if using the practice wallet.
6. Click `Submit a civic action` when ready.

### What Happens

- A practice wallet is created.
- The screen displays:
  - Wallet address.
  - Private key.
  - Optional balance after adding play money.

### Important Notes

- Wallet address is safe to share.
- Private key must never be shared.
- Practice wallets are for demo and learning only.

## 14. Civic Rewards

### What It Is For

Citizens can submit verified civic participation, attendance, volunteer work, or cleanup work and receive rewards after staff approval.

### How To Access

Open:

```text
/metro-city/civic-actions
```

Or tap `Rewards` on the home screen.

### How To Use

1. Choose action type:
   - Civic participation / attendance
   - Environmental cleanup
2. Enter title.
3. Enter details.
4. Enter location.
5. Optionally add GPS coordinates.
6. Optionally add photo or proof URL.
7. Enter name.
8. Optionally enter email.
9. Enter wallet address for rewards.
10. Click `Submit for review`.

### What Happens

- The action is saved for staff review.
- The success screen shows a status.
- If available, it shows a reward note.

### Important Notes

- Staff must review evidence before reward release.
- If release approvals are enabled, money waits until enough staff approve.
- The app never asks the citizen for a private key.

### Demo Talking Point

Say:

> This supports real civic programs, like cleanup incentives or attendance rewards. The reward can later be tied to public proof.

## 15. Budget Transparency

### What It Is For

The transparency page shows public fund allocations, disbursements, grants, and program records.

### How To Access

Open:

```text
/metro-city/transparency
```

Or home screen: `Budget transparency`.

### What To Show

The screen includes:

- Button to view all public records.
- Published record count.
- Public proof count.
- Tracked amount.
- Proof source.
- Public spending records.
- Proof cards for records with payment IDs.

### How To Use

1. Review the stat cards.
2. Open a record card.
3. If proof exists, show the public proof area.
4. Click `View all public records`.

### What Happens

- The app opens `/metro-city/ledger`, now shown as `Public records`.

## 16. Public Records

### What It Is For

This is the public audit page. It aggregates service payments, rewards, disbursements, and tax receipts into one searchable-style record list.

### How To Access

Open:

```text
/metro-city/ledger
```

Or menu: `Civic trust -> Public records`.

### What To Show

The page includes:

- Total records.
- Records with proof.
- Total paid.
- Filter chips:
  - All records
  - Payments
  - Rewards
  - Disbursements
  - Tax receipts
- Record cards.
- Payment IDs when available.
- External public proof links when available.

### How To Use

1. Click each filter chip.
2. Show how the list changes.
3. Open public proof links if available.

### Expected Behavior

- If no records exist for a filter, the app shows an empty state.
- If records exist, each card shows reference, title, amount, date, and proof status.

### Demo Talking Point

Say:

> This is the public audit view. Instead of asking citizens to trust an internal spreadsheet, the LGU can publish civic records with proof.

## 17. Tax Receipts

### What It Is For

Citizens can search property tax receipt records and open a public receipt page.

### How To Access

Open:

```text
/metro-city/tax-receipts
```

Or menu: `Services -> Tax receipts`.

### Search Screen

How to use:

1. Type a receipt reference, taxpayer name, email, or property index.
2. Click `Search receipts`.

What happens:

- Matching receipts appear.
- If no match exists, an empty state appears.

### Receipt Card

Each result shows:

- Reference code.
- Taxpayer name.
- Property address.
- Status.
- Fiscal year.
- Amount.
- Proof status.

### Tax Receipt Detail

How to access:

Click a receipt result.

What to show:

- Reference code.
- Taxpayer.
- Property details.
- Tax year.
- Amount.
- Status.
- Public proof card if a payment ID exists.

### Demo Talking Point

Say:

> Tax receipts are another civic record type that can be searched and checked publicly.

## 18. Hotlines

### What It Is For

Citizens can quickly find emergency and city contact numbers.

### How To Access

Open:

```text
/metro-city/hotlines
```

Or menu: `Updates -> Hotlines`.

### How To Use

1. Review emergency contacts first.
2. Tap the call button.

### What Happens

- On mobile, the device opens the phone dialer.
- Emergency hotlines are visually marked.

### Important Notes

- The call icon should be white inside the colored circular call button.
- Hotlines are managed by staff in the Content tab.

## 19. News

### What It Is For

Citizens can read official announcements.

### How To Access

Open:

```text
/metro-city/news
```

Or menu: `Updates -> News`.

### How To Use

1. Review announcement cards.
2. Click a news card.

### What Happens

- The app opens `/metro-city/news/[postId]`.
- The detail page shows title, publication date, image if available, and full content.

### Important Notes

- Staff can create and publish news in the Content tab.
- Unpublished news should not appear on the public page.

## 20. Staff Admin Login

### What It Is For

Staff use the admin workspace to manage reports, payments, civic programs, public content, wallet settings, and release approvals.

### How To Access

Open:

```text
/metro-city/admin/login
```

### How To Use

1. Enter:

```text
admin@metrocity.local
admin12345
```

2. Submit.

### What Happens

- The app opens `/metro-city/admin`.
- The default tab is Reports.

### Admin Tabs

The bottom admin navigation includes:

- Reports
- Payments
- Civic trust
- Content
- Settings

## 21. Admin Reports Tab

### What It Is For

Staff use Reports to triage citizen concerns and communicate status updates.

### How To Access

Open:

```text
/metro-city/admin
```

Select `Reports`.

### What To Show

The Reports tab includes:

- Active count.
- Urgent count.
- Resolved count.
- Unassigned count.
- Search bar.
- Filter button.
- Status filter chips.
- Report queue.
- Export CSV.

### How To Use Search

1. Type a reference number, name, issue, or location.
2. Submit the search.

What happens:

- The report queue updates.

### How To Use Filters

1. Click the filter icon.
2. Choose status, category, department, or priority.
3. Apply filters.
4. Clear filter chips as needed.

What happens:

- The queue narrows based on selected criteria.

### How To Open A Report

1. Click a report card.
2. A bottom sheet opens.

The bottom sheet shows:

- Report title.
- Reference number.
- Status.
- Priority.
- Citizen contact.
- Location.
- Assigned owner.
- Description.
- Uploaded photos.
- Status update form.
- Update timeline.

### How To Update A Report

1. Choose status.
2. Choose priority.
3. Assign department.
4. Write an update message.
5. Choose whether the note is public.
6. Save.

What happens:

- The report is updated.
- Public updates appear on the citizen tracking page.
- Internal updates stay in staff history only.

### Demo Talking Point

Say:

> This closes the loop. Citizens submit and track; staff triage, assign, update, and resolve.

## 22. Admin Payments Tab

### What It Is For

Staff use Payments to review service payment requests and public receipts.

### How To Access

Select `Payments` in the admin bottom navigation.

### What To Show

The Payments tab includes:

- Total payments.
- Pending payments.
- Verified payments.
- Verified amount.
- Search by payer, reference, or payment ID.
- Filter button.
- Payment list.
- Export CSV.

### How To Use

1. Search or filter payment records.
2. Click a payment.
3. Review payer, amount, public record number, created date, and payment ID.
4. Click `Receipt` to open the public receipt.
5. Click `Payment page` to open the payment request page.

### What Happens

- Staff can quickly confirm whether a payment has public proof.
- CSV export downloads payment records for audit or reconciliation.

## 23. Admin Civic Trust Tab

### What It Is For

The Civic trust tab manages rewards, public spending records, and property tax receipts.

### How To Access

Select `Civic trust` in the admin bottom navigation.

### Subsections

The tab has three main program areas:

- Rewards
- Public records
- Tax receipts

### Rewards Program

Purpose:

- Review citizen-submitted civic actions and release rewards.

How to use:

1. Select `Rewards`.
2. Filter by status or type if needed.
3. Open an action.
4. Review title, participant, location, and description.
5. Set reward amount.
6. Set currency code.
7. Add token issuer address if using a non-XLM token.
8. Confirm reward wallet address.
9. Choose payout method:
   - Direct payout
   - Reserved reward
10. Add review note.
11. Click `Save review`, `Approve`, or `Send reward` depending on current status.

What happens:

- Staff review decisions are saved.
- If release approvals are enabled, `Approve release` records one approval.
- When enough approvals are reached, the final release can send the reward.
- The record shows payment ID, claim code, or record check code when available.

Important notes:

- Changing recipient, amount, or wallet can clear previous release approvals.
- Reserved reward is useful when a citizen is still setting up a wallet.

### Public Records Program

Purpose:

- Create public records for disbursements, grants, allocations, and other spending.

How to use:

1. Select `Public records`.
2. Click `Create record`.
3. Enter title.
4. Enter description.
5. Choose entry type.
6. Choose status.
7. Enter department.
8. Enter recipient name.
9. Enter recipient wallet address if sending funds.
10. Enter amount.
11. Enter currency code.
12. Enter token issuer address if needed.
13. Optionally enter existing payment ID.
14. Choose date.
15. Save.

What happens:

- The record is saved.
- If a disbursement should be sent, open the saved record and choose `Send public release` or `Approve release`.
- Once complete, the public transparency page and public records page can show the record.

### Tax Receipts Program

Purpose:

- Issue and manage property tax receipt records.

How to use:

1. Select `Tax receipts`.
2. Click `Issue receipt`.
3. Enter taxpayer name.
4. Enter taxpayer email.
5. Enter property index number.
6. Enter property address.
7. Enter tax year.
8. Enter amount.
9. Enter currency code.
10. Enter public record number if available.
11. Enter payment ID if available.
12. Save.

What happens:

- A public tax receipt is created.
- Staff can open the public receipt link.
- Staff can void a receipt if needed.

### Demo Talking Point

Say:

> CivicTrust goes beyond reporting. It also creates verifiable civic records for rewards, public releases, and tax receipts.

## 24. Admin Content Tab

### What It Is For

Staff use the Content tab to manage public-facing data.

### How To Access

Select `Content` in the admin bottom navigation.

### Content Types

The Content tab supports:

- Services
- Hotlines
- News
- Report categories
- Departments
- Staff users

### Shared CRUD Pattern

For every content type:

1. Choose the content type.
2. Review the list.
3. Click the create button.
4. Fill out the bottom-sheet form.
5. Save.
6. Open an existing item to edit.
7. Archive or deactivate when needed.

### Services

Purpose:

- Control what appears in the public services directory and which services require payment.

Fields:

- Title.
- Description.
- Department label.
- Link URL.
- Sort order.
- Collect online payment.
- Service fee amount.
- Payment currency.
- Token issuer address.
- Destination wallet address.
- Active status.

Expected behavior:

- Active services appear publicly.
- Payable services can create payment requests.

### Hotlines

Purpose:

- Control public emergency and city contact numbers.

Fields:

- Name.
- Description.
- Phone.
- Sort order.
- Emergency hotline toggle.
- Active status.

Expected behavior:

- Emergency contacts sort first.
- Active hotlines appear on the home page and Hotlines page.
- Call buttons use `tel:` links.

### News

Purpose:

- Publish announcements.

Fields:

- Title.
- Excerpt.
- Content.
- Image URL.
- Publish date.
- Published toggle.

Expected behavior:

- Published news appears publicly.
- Unpublished news stays hidden.

### Report Categories

Purpose:

- Control the categories citizens choose when submitting reports.

Fields:

- Name.
- Description.
- Active status.

Expected behavior:

- Active categories appear in the Report a concern stepper.

### Departments

Purpose:

- Control staff assignment options for reports.

Fields:

- Name.
- Email.
- Phone.
- Active status.

Expected behavior:

- Active departments can be assigned in the Reports tab.

### Staff Users

Purpose:

- Manage admin access.

Fields:

- Name.
- Email.
- Password.
- Role.
- Active status.

Expected behavior:

- Active users can sign in.
- Admin role has broader permissions than staff role.
- Editing a user can leave password blank if not changing it.

## 25. Admin Settings Tab

### What It Is For

Settings manages the tenant profile, LGU wallet, release approval rules, branding, contact details, and default payment currency.

### How To Access

Select `Settings` in the admin bottom navigation.

### Public Site Shortcut

Purpose:

- Open the citizen-facing app quickly.

How to use:

1. Click `Public site`.
2. The app opens the public tenant portal.

### LGU Wallet

Purpose:

- Manage the official wallet that receives payments and sends rewards or public releases.

How to use:

1. Review the receiving wallet address.
2. Click copy to copy the wallet address.
3. If no wallet exists, click `Create practice wallet`.
4. Click `Check wallet` to refresh wallet state.
5. Click `Add play money` when using the practice network.

What happens:

- The app creates, funds, checks, or displays the LGU wallet.
- Wallet status and balances update.

Important notes:

- Private key is protected after saving.
- Practice wallets are for demo and testing.

### Advanced Wallet Settings

Purpose:

- Import a wallet or adjust network service settings.

How to use:

1. Open `Advanced wallet settings`.
2. Enter wallet address if importing.
3. Enter private key if importing.
4. Choose network.
5. Review network safety phrase.
6. Review public record service URL.
7. Review test funding service URL.
8. Save advanced settings.

Expected behavior:

- Normal demos should not need this.
- Use this only when importing or troubleshooting a wallet.

### Release Approvals

Purpose:

- Require multiple staff approvals before money leaves the LGU wallet.

How to use:

1. Turn on `Require more than one approval`.
2. Set reviewer count, for example `10`.
3. Set approvals needed, for example `6`.
4. Add a plain-language note.
5. Click `Save approval rule`.

What happens:

- Rewards and public releases wait until enough staff approve.
- Service payments still go directly to the receiving wallet.

Demo talking point:

> This is the governance layer. One staff member cannot release funds alone if the LGU requires majority approval.

### Organization Settings

Purpose:

- Control tenant identity and public branding.

Fields:

- Tenant name.
- City name.
- Tagline.
- Description.
- Email.
- Phone.
- Address.
- Primary color.

What happens:

- Saved changes update the public portal and admin display.

### Default Payment Currency

Purpose:

- Set the default currency for payable services.

Fields:

- Currency code.
- Token issuer address.

Important note:

- Use a stable token for real fees when the amount should stay close to peso or dollar value.

## 26. Practice Payments Playground

### What It Is For

The playground lets judges or developers test the payment building blocks without using a real wallet or real money.

### How To Access

Open:

```text
/stellar-playground
```

### Step 1: Create A Practice Wallet

How to use:

1. Click `Create practice wallet`.
2. Copy the wallet address if needed.
3. Keep the private key private.

What happens:

- A practice wallet is created.
- The page displays wallet address and private key.

### Step 2: Add Play Money

How to use:

1. Confirm the wallet address.
2. Click `Add money`.
3. Click `Check balance`.

What happens:

- The wallet receives test funds.
- Balance and account information appear.
- `Show technical details` can reveal raw response data for technical reviewers.

### Step 3: Make A Payment Request

How to use:

1. Enter amount.
2. Enter receipt note.
3. Click `Create payment QR`.

What happens:

- A QR code appears.
- A payment link can be copied.

### Step 4: Check The Payment

How to use:

1. Paste payment ID.
2. Click `Check payment`.

What happens:

- The app checks whether the payment exists and matches the request.
- It shows payment confirmed or payment not found.

### Important Notes

- This screen is for practice only.
- Do not paste a real wallet private key into a website.
- This page is useful if judges ask how the payment request and proof check works.

## 27. Platform Root Console

### What It Is For

The platform console is for managing tenants at the CivicTrust platform level.

### How To Access

Open:

```text
/root/login
```

Use:

```text
root@civictrust.local
root12345
```

### What To Show

After login, the root console shows:

- Tenant list.
- Tenant stats.
- Create tenant action.
- Admin reset action.
- Tenant activation controls.
- Links to tenant public portals.

### How To Use

1. Review existing tenants.
2. Open a tenant public site.
3. Create a new tenant if needed.
4. Fill in:
   - Tenant name.
   - Slug.
   - City name.
   - Tagline.
   - Description.
   - Email.
   - Brand color.
   - Admin name.
   - Admin email.
   - Admin password.
5. Save.

What happens:

- A new tenant is created.
- A first admin user is created.
- The new tenant can use the same public and staff workflows.

### Demo Talking Point

Say:

> This is how CivicTrust can scale from one demo city to many LGUs.

## 28. Multi-Tenant Demo

### What It Is For

This proves that Metro City and Laguna Province have separate records and settings.

### How To Access

Open:

```text
/metro-city
/laguna-province
```

### What To Show

Compare:

- City names.
- Services.
- Hotlines.
- Reports.
- Staff accounts.
- Public records.
- Wallet settings.

### Expected Behavior

Records from Metro City should not appear inside Laguna Province, and vice versa.

### Demo Talking Point

Say:

> Each tenant has its own data boundary. That matters for real LGUs because records, wallets, staff, and services must not mix.

## 29. End-To-End Demo Script

Use this exact path if you have limited time.

### Part A: Citizen Journey

1. Open `/`.
2. Click `Metro City Services`.
3. Show the Metro City home screen.
4. Tap `Report`.
5. Submit a concern through all four steps.
6. Copy the reference number.
7. Click `Track this report`.
8. Show the tracker.
9. Open `/metro-city/login`.
10. Sign in as Sofia.
11. Show the citizen dashboard.
12. Open `/metro-city/services`.
13. Choose a payable service.
14. Create a payment request.
15. Show QR, payment link, receipt note, and pay-to wallet.
16. Explain that a wallet sends the payment and returns a payment ID.
17. Open a public receipt if a verified payment exists.
18. Open `/metro-city/civic-actions`.
19. Submit a cleanup or participation reward request.
20. Open `/metro-city/transparency`.
21. Open `/metro-city/ledger`.
22. Open `/metro-city/tax-receipts`.
23. Search for an existing tax receipt.
24. Open `/metro-city/hotlines`.
25. Show tap-to-call.
26. Open `/metro-city/news`.
27. Open a news detail page.

### Part B: Staff Journey

1. Open `/metro-city/admin/login`.
2. Sign in as admin.
3. Show Reports dashboard stats.
4. Search/filter reports.
5. Open a report.
6. Assign department, set status, add public update.
7. Open Payments tab.
8. Open a payment.
9. Open the public receipt.
10. Open Civic trust tab.
11. Open Rewards.
12. Approve or review a reward request.
13. Open Public records.
14. Create a public spending record.
15. Open Tax receipts.
16. Issue a property tax receipt.
17. Open Content tab.
18. Show Services, Hotlines, News, Categories, Departments, and Staff Users.
19. Open Settings.
20. Show LGU wallet.
21. Show Release approvals.
22. Set 10 reviewers and 6 needed.
23. Save approval rule.

### Part C: Platform And Practice

1. Open `/stellar-playground`.
2. Create a practice wallet.
3. Add play money.
4. Create a payment QR.
5. Explain payment ID verification.
6. Open `/root/login`.
7. Sign in as platform root.
8. Show tenant management.
9. Explain that CivicTrust can onboard many LGUs.

## 30. Expected Demo Data

Metro City examples:

- Tenant path: `/metro-city`
- Citizen: Sofia Cruz
- Citizen email: `sofia.cruz@metrocity.local`
- Staff email: `admin@metrocity.local`
- Sample report reference: `MCS-2026-0001`
- Payable service: `Business Permit Assistance`

Laguna Province examples:

- Tenant path: `/laguna-province`
- Citizen: Ana Reyes
- Citizen email: `ana.reyes@laguna.local`
- Staff email: `admin@laguna.local`
- Sample report reference: `LPS-2026-0001`

## 31. What To Say If A Feature Has No Data

Use these fallback lines:

### No reports

> This tenant has no reports yet. I can submit one from the public Report screen, and it will appear here for staff.

### No payments

> Payments appear here after a citizen creates a service payment request. Verified payments can open a public receipt.

### No public records

> Public records appear after staff publish transparency records, rewards, disbursements, or tax receipts.

### No wallet configured

> The LGU can create a practice wallet from Settings. In production, the LGU would import or configure its official wallet.

### No proof yet

> The record exists, but the payment or release has not been confirmed yet. Once confirmed, the public proof appears here.

## 32. Judge Questions And Answers

### Is CivicTrust just a payment app?

No. Payments are one workflow. The product covers citizen reports, request tracking, services, hotlines, news, civic rewards, transparency records, tax receipts, staff operations, and tenant management.

### Why does the app need public proof?

Public proof helps when a citizen or auditor needs to verify that a payment, reward, or fund release really happened. A private database is useful for app data, but public proof is stronger for civic trust.

### Do citizens need to give CivicTrust their private keys?

No. Citizens pay from their own wallet. CivicTrust prepares the request and checks the result. It does not ask citizens for private keys.

### What happens if XLM price changes?

For demos, XLM is simple. For production, the app supports currency code and token issuer fields so an LGU can use a stable asset for predictable pricing.

### Can one staff member release funds alone?

Only if the LGU chooses single approval mode. If release approvals are enabled, rewards and public releases wait until enough staff approve.

### Is approval on-chain?

The current app uses an app-level approval gate before submitting the payment. This is easy to understand for the demo and can be hardened later with Stellar account signer rules.

### Can this support more LGUs?

Yes. The platform root console can create and manage multiple tenants. Each tenant has separate data, branding, staff, wallet settings, and public records.

## 33. Demo Day Closing Statement

Use this closing:

> CivicTrust makes local government services easier to use and harder to fake. Citizens can report issues, track progress, pay fees, receive rewards, and check public records. Staff get one workspace to manage operations. Stellar adds public proof where trust matters most: service payments, civic rewards, public releases, and tax receipts.

## 34. Final Checklist Before Presenting

Before Demo Day:

1. Run the app locally or confirm the deployed URL works.
2. Confirm Metro City public portal opens.
3. Confirm admin login works.
4. Confirm citizen login works.
5. Confirm root login works if showing platform console.
6. Confirm at least one report reference works in the tracker.
7. Confirm at least one service is payable.
8. Confirm payment QR loads.
9. Confirm public records page loads.
10. Confirm tax receipt search returns at least one receipt.
11. Confirm Hotlines call icons appear correctly.
12. Confirm Settings shows LGU wallet and release approvals.
13. Keep this guide open in a second window.

