import Link from 'next/link';
import { FiAward, FiCreditCard, FiFlag, FiSearch } from 'react-icons/fi';
import type { IconType } from 'react-icons';

export function HeroSection({
  tenant,
  categoriesCount
}: {
  tenant: {
    slug: string;
    cityName: string;
    tagline: string;
    description: string;
  };
  categoriesCount: number;
}) {
  const quickActions: Array<{ label: string; href: string; Icon: IconType; text: string; tone: string }> = [
    { label: 'Report', href: `/${tenant.slug}/report`, Icon: FiFlag, text: 'Send concern', tone: 'from-[#ef3a52] to-[#ff6f84]' },
    { label: 'Track', href: `/${tenant.slug}/track`, Icon: FiSearch, text: 'Check status', tone: 'from-[#2f80ed] to-[#16a78b]' },
    { label: 'Pay', href: `/${tenant.slug}/payments`, Icon: FiCreditCard, text: 'Verified receipt', tone: 'from-[#1a497b] to-[#2f80ed]' },
    { label: 'Rewards', href: `/${tenant.slug}/civic-actions`, Icon: FiAward, text: 'Civic action', tone: 'from-[#16a78b] to-[#f2c94c]' }
  ];

  return (
    <section className="px-5 pt-2">
      <div className="flex items-end justify-between gap-3 pb-3 pt-1">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[var(--muted)]">Welcome to</p>
          <h1 className="truncate font-display text-[21px] font-bold tracking-[-0.01em] text-[var(--ink)]">{tenant.cityName}</h1>
        </div>
      </div>

      <div className="app-pulse-card p-[22px]">
        <div className="relative z-10">
          <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9fc0e6]">CivicTrust</p>
          <h2 className="mt-2 line-clamp-2 font-display text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-[#fff]">
            {tenant.tagline}
          </h2>
          <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-[1.5] text-[#b9d0ea]">{tenant.description}</p>
          <div className="mt-4 flex gap-[18px] border-t border-[rgba(255,255,255,.14)] pt-4">
            <PulseStat value="SEP-7" label="Wallet pay" />
            <PulseStat value="24/7" label="Tracking" />
            <PulseStat value={String(categoriesCount)} label="Services" />
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {quickActions.map(({ Icon, ...action }) => (
          <Link key={action.href} href={action.href} className="app-tile-card">
            <span className={`grid h-11 w-11 place-items-center rounded-[15px] bg-gradient-to-br ${action.tone} text-[#fff] shadow-[0_10px_20px_rgba(18,40,72,.16)]`}>
              <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-bold text-[var(--ink)]">{action.label}</p>
            <p className="mt-0.5 text-xs font-semibold text-[var(--muted)]">{action.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PulseStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-[11.5px] text-[#9fc0e6]">
      <b className="block font-display text-[17px] font-bold text-[#fff]">{value}</b>
      {label}
    </div>
  );
}
