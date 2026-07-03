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
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-[0_10px_24px_rgba(16,24,40,0.10)] transition hover:bg-slate-50"
      >
        {isOpen ? <FiX aria-hidden="true" className="h-5 w-5" /> : <FiMenu aria-hidden="true" className="h-5 w-5" />}
      </button>

      {isOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[4.25rem] z-[70] overflow-y-auto bg-slate-950/30 px-3 pb-[calc(7rem+env(safe-area-inset-bottom))] backdrop-blur-md animate-fade" onClick={() => setIsOpen(false)}>
          <div className="mx-auto max-w-md rounded-[2rem] border border-white/80 bg-white p-3 shadow-[0_28px_90px_rgba(15,23,42,0.28)] animate-rise" onClick={(event) => event.stopPropagation()}>
            <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 ring-1 ring-blue-100">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Citizen app menu</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Choose what you need now. The bottom tabs stay available for quick mobile actions.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href={`/${tenantSlug}/report`} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black btn-primary">
                  <FiFlag aria-hidden="true" className="h-4 w-4" />
                  Report issue
                </Link>
                <Link href={`/${tenantSlug}/track`} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black btn-secondary">
                  <FiSearch aria-hidden="true" className="h-4 w-4" />
                  Track status
                </Link>
              </div>
            </div>

            <nav className="mt-3 grid gap-3" aria-label="Mobile navigation">
              {navGroups.map((group) => (
                <section key={group.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-2">
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
                          className={`flex min-h-14 items-center gap-3 rounded-[1.15rem] px-3 py-3 text-sm font-black transition ${
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
              <Link href={`/${tenantSlug}/login`} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black btn-secondary">
                <FiUser aria-hidden="true" className="h-4 w-4" />
                Citizen sign in
              </Link>
              <Link href={`/${tenantSlug}/admin/login`} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-black btn-primary">
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/80 bg-white/92 px-2 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-2 shadow-[0_-18px_50px_rgba(15,23,42,0.12)] backdrop-blur-2xl lg:hidden" aria-label="Quick mobile navigation">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.72rem] font-black transition ${
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
