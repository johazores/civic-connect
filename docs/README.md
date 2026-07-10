# Civic Connect Documentation

Start here for the simplified product architecture.

## Validation

Run before every demo:

```bash
npm run validate:stellar
```

This script funds two testnet wallets, submits a payment, verifies it on Horizon, and sends an outbound reward. **All 7 steps must pass.**

## Essential reading

| Doc | Audience | Purpose |
|-----|----------|---------|
| [demo-guide.md](./demo-guide.md) | **Everyone presenting tomorrow** | 5-minute demo script |
| [stellar-architecture.md](./stellar-architecture.md) | Developers | Where Stellar fits, on-chain vs off-chain |
| [developer-guide.md](./developer-guide.md) | Developers | Setup, stack, folder layout |
| [stellar-testnet-setup.md](./stellar-testnet-setup.md) | Developers | Testnet wallets and Friendbot |
| [admin-guide.md](./admin-guide.md) | LGU staff | Admin dashboard operations |
| [user-guide.md](./user-guide.md) | Citizens | Using the public portal |

## Stellar in one sentence

**Citizens pay from their own wallet; the city uses one wallet to receive fees and send rewards; every verified payment gets a permanent public receipt on the Stellar ledger.**

## Project structure

```text
app/                    # UI routes (Next.js App Router)
pages/api/              # API routes (tenant, platform, stellar fund)
services/               # Business logic
lib/stellar/            # Stellar SDK wrapper (only place that talks to Horizon)
components/
  layout/               # Shell, sidebar, mobile nav
  public/               # Citizen-facing UI
  admin/                # Staff dashboard
  stellar/              # Shared proof/receipt UI
```

## What we removed (simplification)

- **Stellar Playground** — replaced by `/about` + `/[tenant]/wallet` + live payment flow
- **Duplicate playground APIs** — one Friendbot endpoint remains: `POST /api/stellar-playground/wallet/fund`
- **Outdated planning docs** — superseded by `stellar-architecture.md` and this index
