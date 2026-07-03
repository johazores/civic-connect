import Link from 'next/link';
import { FiArrowRight, FiChevronRight, FiFlag, FiShield } from 'react-icons/fi';

const tenantLinks = [
  {
    href: '/metro-city',
    name: 'Metro City Services',
    description: 'Citizen reports, service payments, rewards, and public transparency.'
  },
  {
    href: '/laguna-province',
    name: 'Laguna Province Services',
    description: 'Regional service requests, verifiable receipts, and civic records.'
  }
];

export default function RootPage() {
  return (
    <main className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">CT</div>
            <div className="min-w-0">
              <p className="app-title truncate">CivicTrust</p>
              <p className="app-subtitle truncate">Mobile civic operating system</p>
            </div>
          </div>
          <span className="app-icon-btn"><FiShield className="h-4 w-4" /></span>
        </header>

        <div
          className="civic-viewport viewport-flow px-5 pt-4"
          style={{ paddingBottom: 'calc(var(--safe-bottom) + 26px)' }}
        >
          <section className="app-pulse-card p-[22px]">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#9fc0e6]">CivicTrust Platform</p>
              <h1 className="mt-3 font-display text-[28px] font-extrabold leading-[1.08] tracking-[-0.02em] text-white">
                Verifiable civic services
              </h1>
              <p className="mt-1.5 text-[13px] font-medium leading-5 text-[#b9d0ea]">
                Reports, payments, and receipts backed by public Stellar proof.
              </p>
              <div className="mt-[18px] flex gap-[18px] border-t border-white/15 pt-4">
                <MiniMetric value="SEP-7" label="Pay" />
                <MiniMetric value="Hash" label="Proof" />
                <MiniMetric value="LGU" label="Ready" />
              </div>
            </div>
          </section>

          <div className="section-head">
            <h2>Choose your city</h2>
          </div>

          <div className="grid gap-3">
            {tenantLinks.map((tenant) => (
              <Link key={tenant.href} href={tenant.href} className="app-feed-card">
                <span className="flex items-center gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[var(--surface-2)] text-[var(--navy)]">
                    <FiFlag className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-base font-bold tracking-[-0.02em] text-[var(--ink)]">
                      {tenant.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[13px] font-medium text-[var(--muted)]">
                      {tenant.description}
                    </span>
                  </span>
                  <FiChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                </span>
              </Link>
            ))}
          </div>

          <Link href="/about" className="app-tile-card mt-3 flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]">
              <FiShield className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-bold tracking-[-0.02em] text-[var(--ink)]">How it works</span>
              <span className="mt-0.5 block truncate text-[13px] font-medium text-[var(--muted)]">Why Stellar powers verifiable civic services</span>
            </span>
            <FiArrowRight className="h-4 w-4 shrink-0 text-[var(--ember)]" />
          </Link>
        </div>
      </div>
    </main>
  );
}

function MiniMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-[11.5px] font-semibold text-[#9fc0e6]">
      <b className="mb-0.5 block font-display text-[17px] font-bold text-white">{value}</b>
      {label}
    </div>
  );
}
