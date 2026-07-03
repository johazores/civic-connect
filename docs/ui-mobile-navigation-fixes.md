# UI Navigation Fixes

This pass fixes two usability issues reported during mobile and desktop testing.

## Desktop submenu behavior

Problem:

- The desktop submenu opened on hover but disappeared while moving the cursor from the top navigation item into the dropdown.

Fix:

- Removed the dropdown translation gap.
- Positioned the submenu directly under the parent item.
- Kept the hover/focus area stable so users can move into the menu without it closing.

## Mobile bottom navigation spacing

Problem:

- The fixed bottom tab bar covered the last items in the mobile menu and made the page feel like it could not scroll far enough.

Fix:

- Added larger bottom spacing to the public shell.
- Updated the mobile menu overlay to scroll independently.
- Added safe-area-aware bottom padding for devices with gesture bars.
- Increased bottom tab safe-area padding.

## Stellar learning playground

Added:

```text
/stellar-playground
```

This route gives developers a simple frontend/backend learning flow for:

- Generating Testnet keypairs
- Funding wallets through Friendbot
- Checking balances through Horizon
- Creating SEP-7 payment URIs and QR codes
- Verifying payment transaction hashes through Horizon

See:

```text
docs/stellar-playground-guide.md
```
