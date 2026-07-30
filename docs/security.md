# Security Policy

CivicTrust includes citizen data, staff administration, tenant settings, uploaded files, and Stellar testnet payment records. Security-sensitive issues must not be reported publicly.

## Reporting

Contact the maintainer through the GitHub profile for vulnerabilities involving authentication, tenant isolation, staff permissions, platform administration, wallet secrets, payment verification, uploaded files, or personal data.

Include a sanitized reproduction, affected route or tenant boundary, expected behavior, actual behavior, and potential impact. Do not include real citizen records, credentials, private keys, or working exploits.

## Current boundaries

- Staff and citizen sessions use application-owned authentication and authorization.
- Platform administration is a separate privileged boundary.
- Tenant-owned data must be scoped by trusted tenant context.
- Stellar receiving-wallet secrets are encrypted before database storage.
- Public payment receipts expose transaction proof without exposing secret keys.
- Stellar modules use testnet and must not be described as production government payment rails.

## Safe operation

- Use strong independent bootstrap and encryption secrets.
- Replace all seeded credentials before real use.
- Restrict staff and platform permissions.
- Validate uploads, size limits, and storage access.
- Enforce ownership and tenant scope server-side.
- Verify Stellar transactions through authoritative network data.
- Never store wallet secrets in browser storage or public logs.
- Back up PostgreSQL and test restore procedures.

## Before production payment use

Production payments require regulated partners, treasury and signing policy, reconciliation, incident response, accessibility review, privacy assessment, operational ownership, and an independent security review.
