import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import {
  FiAward,
  FiBell,
  FiCreditCard,
  FiFileText,
  FiFlag,
  FiGrid,
  FiHash,
  FiHome,
  FiPhoneCall,
  FiSearch,
  FiShield,
  FiUser
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { MobileBottomNav, MobileMenu, type NavGroup, type NavIconKey } from '@/components/layout/mobile-menu';

const iconMap: Record<NavIconKey, IconType> = {
  home: FiHome,
  services: FiGrid,
  payments: FiCreditCard,
  tax: FiFileText,
  report: FiFlag,
  track: FiSearch,
  account: FiUser,
  rewards: FiAward,
  transparency: FiHash,
  news: FiBell,
  hotlines: FiPhoneCall
};

function NavIcon({ name, className }: { name?: NavIconKey; className?: string }) {
  const Icon = name ? iconMap[name] : FiShield;
  return <Icon aria-hidden="true" className={className || 'h-4 w-4'} />;
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function PublicShell({
  tenant,
  children
}: {
  tenant: {
    slug: string;
    name: string;
    cityName: string;
    tagline: string;
    email?: string | null;
    phone?: string | null;
    primaryColor?: string;
  };
  children: ReactNode;
}) {
  const navGroups: NavGroup[] = [
    {
      label: 'Services',
      description: 'Requests, payments, and public service access',
      items: [
        { href: `/${tenant.slug}/services`, label: 'Service directory', description: 'Permits, forms, fees, and city services', icon: 'services' },
        { href: `/${tenant.slug}/payments`, label: 'Service payments', description: 'Pay fees and verify Stellar receipts', icon: 'payments' },
        { href: `/${tenant.slug}/tax-receipts`, label: 'Tax receipts', description: 'Search digital property tax receipts', icon: 'tax' }
      ]
    },
    {
      label: 'Requests',
      description: 'Submit and monitor citizen concerns',
      items: [
        { href: `/${tenant.slug}/report`, label: 'Report an issue', description: 'Roads, waste, lights, drainage, and safety', icon: 'report' },
        { href: `/${tenant.slug}/track`, label: 'Track request', description: 'Follow status by reference number', icon: 'track' },
        { href: `/${tenant.slug}/dashboard`, label: 'My account', description: 'Your reports, updates, and receipts', icon: 'account' }
      ]
    },
    {
      label: 'Civic Trust',
      description: 'Rewards and public financial transparency',
      items: [
        { href: `/${tenant.slug}/civic-actions`, label: 'Civic rewards', description: 'Submit verified participation actions', icon: 'rewards' },
        { href: `/${tenant.slug}/transparency`, label: 'Budget transparency', description: 'View public disbursements and ledger records', icon: 'transparency' }
      ]
    },
    {
      label: 'Updates',
      description: 'Official announcements and contacts',
      items: [
        { href: `/${tenant.slug}/news`, label: 'News', description: 'Announcements from the city office', icon: 'news' },
        { href: `/${tenant.slug}/hotlines`, label: 'Hotlines', description: 'Emergency and support contacts', icon: 'hotlines' }
      ]
    }
  ];

  const bottomItems = [
    { href: `/${tenant.slug}`, label: 'Home', icon: 'home' as const },
    { href: `/${tenant.slug}/report`, label: 'Report', icon: 'report' as const },
    { href: `/${tenant.slug}/track`, label: 'Track', icon: 'track' as const },
    { href: `/${tenant.slug}/payments`, label: 'Pay', icon: 'payments' as const },
    { href: `/${tenant.slug}/dashboard`, label: 'Me', icon: 'account' as const }
  ];

  return (
    <div
      className="min-h-screen pb-32 text-slate-900 lg:pb-0"
      style={{
        '--tenant-primary': tenant.primaryColor || '#2563eb',
        '--brand': tenant.primaryColor || '#2563eb',
        '--brand-dark': tenant.primaryColor || '#1d4ed8'
      } as CSSProperties}
    >
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/82 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/76">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link href={`/${tenant.slug}`} className="flex min-w-0 items-center gap-3" aria-label={`${tenant.name} home`}>
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.15rem] bg-[var(--tenant-primary)] text-sm font-black text-white shadow-[0_16px_32px_rgba(37,99,235,0.22)]">
              {initials(tenant.cityName)}
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-[-0.035em] text-slate-950 sm:text-lg">{tenant.name}</p>
              <p className="hidden max-w-xs truncate text-xs font-semibold text-slate-500 sm:block">{tenant.tagline}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            <Link href={`/${tenant.slug}`} className="rounded-full px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-slate-100 hover:text-[var(--tenant-primary)]">
              Home
            </Link>
            {navGroups.map((group) => (
              <div key={group.label} className="group relative">
                <button
                  type="button"
                  className="rounded-full px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:bg-slate-100 hover:text-[var(--tenant-primary)] group-focus-within:bg-slate-100"
                >
                  {group.label}
                </button>
                <div className="invisible absolute left-1/2 top-[calc(100%-0.125rem)] z-50 w-[23rem] -translate-x-1/2 rounded-[1.5rem] border border-slate-200/90 bg-white/96 p-2 opacity-0 shadow-[0_28px_80px_rgba(15,23,42,0.16)] backdrop-blur-2xl transition duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="px-3 pb-2 pt-2">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{group.description}</p>
                  </div>
                  <div className="grid gap-1">
                    {group.items.map((item) => (
                      <Link key={item.href} href={item.href} className="group/item flex gap-3 rounded-[1.15rem] p-3 transition hover:bg-blue-50/80">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover/item:bg-white group-hover/item:text-[var(--tenant-primary)]">
                          <NavIcon name={item.icon} className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-sm font-black text-slate-950">{item.label}</span>
                          <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{item.description}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link href={`/${tenant.slug}/login`} className="inline-flex min-h-10 items-center justify-center rounded-full px-4 py-2 text-sm font-extrabold btn-secondary">
              Sign in
            </Link>
            <Link href={`/${tenant.slug}/report`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-extrabold btn-primary">
              <FiFlag aria-hidden="true" className="h-4 w-4" />
              Report issue
            </Link>
          </div>

          <MobileMenu tenantSlug={tenant.slug} navGroups={navGroups} />
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-200/80 bg-white/92 px-4 py-8 text-sm text-slate-500 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-bold text-slate-800">{tenant.cityName} citizen services</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Service requests, verifiable payments, civic rewards, and public transparency in one portal.</p>
          </div>
          <p className="break-words text-slate-600">{tenant.email || tenant.phone ? `${tenant.email || ''} ${tenant.phone || ''}`.trim() : 'Contact details are managed by the operations team.'}</p>
        </div>
      </footer>

      <MobileBottomNav items={bottomItems} />
    </div>
  );
}
