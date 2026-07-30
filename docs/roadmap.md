# Roadmap

CivicTrust is evolving toward a production-focused civic services platform while keeping the current public portal, staff operations, and Stellar testnet modules understandable.

## Current priorities

- Prove tenant isolation across citizen, staff, platform, and public API boundaries.
- Expand authentication, authorization, CRUD, upload, and payment integration tests.
- Improve public accessibility, mobile navigation, and low-connectivity behavior.
- Consolidate duplicated implementation and redesign notes into authoritative documentation.
- Strengthen audit logs, operational alerts, backup procedures, and deployment validation.
- Keep Stellar testnet proof separate from real government payment claims.

## Platform improvements

- Better report assignment, SLA, escalation, and citizen notification workflows.
- File-storage abstraction and retention policy.
- Staff role and permission refinement.
- Tenant branding, domain, and onboarding improvements.
- Search, export, analytics, and public transparency reporting.
- Accessibility testing against current WCAG guidance.
- End-to-end tests for core citizen and staff journeys.

## Payment and Stellar discovery

- Production treasury and signer policy.
- Regulated payment or asset partners.
- Reconciliation and failed-payment recovery.
- Privacy-safe public receipt and record policies.
- Independent security and operational review.
- Clear ownership for refund, dispute, and support processes.

## Mobile direction

Continue PWA-first. Consider Capacitor or native applications only when app-store distribution, offline capability, push notifications, or native device APIs justify the maintenance cost.

## Out of scope until separately approved

- Real government payment processing without regulated partners.
- Mainnet wallet custody.
- Public release using seeded credentials.
- Automatic legal or policy decisions without staff review and audit records.
