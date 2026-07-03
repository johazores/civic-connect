'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  FiAward,
  FiBell,
  FiCreditCard,
  FiFileText,
  FiFlag,
  FiGrid,
  FiHash,
  FiHome,
  FiMenu,
  FiPhoneCall,
  FiSearch,
  FiShield,
  FiUser,
  FiX
} from 'react-icons/fi';
import type { IconType } from 'react-icons';

export type NavIconKey =
  | 'home'
  | 'services'
  | 'payments'
  | 'tax'
  | 'report'
  | 'track'
  | 'account'
  | 'rewards'
  | 'transparency'
  | 'news'
  | 'hotlines';

export type NavItem = {
  href: string;
  label: string;
  description?: string;
  icon?: NavIconKey;
};

export type NavGroup = {
  label: string;
  description: string;
  items: NavItem[];
};

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

export function MobileMenu({ tenantSlug, navGroups }: { tenantSlug: string; navGroups: NavGroup[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-black text-slate-900 shadow-[0_10px_24px_rgba(18,32,51,0.10)] transition hover:bg-slate-50"
      >
        {isOpen ? <FiX aria-hidden="true" className="h-5 w-5" /> : <FiMenu aria-hidden="true" className="h-5 w-5" />}
        Menu
      </button>

      {isOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[4.25rem] z-[70] overflow-y-auto bg-slate-950/35 px-3 pb-[calc(8.5rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md animate-fade" onClick={() => setIsOpen(false)}>
          <div className="mx-auto max-w-md rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_28px_90px_rgba(15,23,42,0.30)] animate-scale" onClick={(event) => event.stopPropagation()}>
            <div className="brand-panel rounded-[1.65rem] p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Action hub</p>
                  <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-slate-950">What do you need today?</h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">Live</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href={`/${tenantSlug}/report`} onClick={() => setIsOpen(false)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black btn-primary">
                  <FiFlag aria-hidden="true" className="h-4 w-4" />
                  Report issue
                </Link>
                <Link href={`/${tenantSlug}/track`} onClick={() => setIsOpen(false)} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black btn-secondary">
                  <FiSearch aria-hidden="true" className="h-4 w-4" />
                  Track status
                </Link>
              </div>
            </div>

            <nav className="mt-3 grid gap-3" aria-label="Mobile navigation">
              {navGroups.map((group) => (
                <section key={group.label} className="rounded-[1.65rem] border border-slate-200 bg-white p-2 shadow-sm">
                  <div className="px-2 py-2">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{group.description}</p>
                  </div>
                  <div className="grid gap-1">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex min-h-14 items-center gap-3 rounded-[1.25rem] px-3 py-3 text-sm font-black transition ${
                            isActive ? 'bg-blue-50 text-[var(--brand)] ring-1 ring-blue-100' : 'text-slate-800 hover:bg-slate-50'
                          }`}
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isActive ? 'bg-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}>
                            <NavIcon name={item.icon} className="h-4 w-4" />
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate">{item.label}</span>
                            {item.description ? <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">{item.description}</span> : null}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </nav>

            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <Link href={`/${tenantSlug}/login`} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black btn-secondary">
                <FiUser aria-hidden="true" className="h-4 w-4" />
                Citizen sign in
              </Link>
              <Link href={`/${tenantSlug}/admin/login`} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black btn-primary">
                <FiShield aria-hidden="true" className="h-4 w-4" />
                Staff portal
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MobileBottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-3 z-40 rounded-[1.5rem] border border-white/80 bg-white/94 px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-10px_40px_rgba(18,32,51,0.18)] backdrop-blur-2xl lg:hidden" aria-label="Quick mobile navigation">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.15rem] text-[0.70rem] font-black transition ${
                isActive ? 'bg-blue-50 text-[var(--brand)] ring-1 ring-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isActive ? 'bg-white shadow-sm' : ''}`}>
                <NavIcon name={item.icon} className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
