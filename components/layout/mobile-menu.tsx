'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = {
  href: string;
  label: string;
};

export function MobileMenu({ tenantSlug, navItems }: { tenantSlug: string; navItems: NavItem[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-[0_10px_24px_rgba(16,24,40,0.10)] transition hover:bg-slate-50"
      >
        <span className="relative h-4 w-5">
          <span className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition ${isOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`absolute left-0 top-[7px] h-0.5 w-5 rounded-full bg-current transition ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`absolute left-0 top-[14px] h-0.5 w-5 rounded-full bg-current transition ${isOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </span>
      </button>

      {isOpen ? (
        <div className="fixed inset-0 top-[4.25rem] z-50 bg-slate-900/30 px-3 pb-3 backdrop-blur-md animate-fade" onClick={() => setIsOpen(false)}>
          <div className="mx-auto max-w-md overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_24px_70px_rgba(16,24,40,0.22)] animate-rise" onClick={(event) => event.stopPropagation()}>
            <nav className="grid gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex min-h-12 items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      isActive ? 'bg-blue-50 text-[var(--brand)] ring-1 ring-blue-100' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                    <span className="text-slate-300">→</span>
                  </Link>
                );
              })}
            </nav>
            <div className="mt-3 grid grid-cols-1 gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2">
              <Link href={`/${tenantSlug}/login`} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-sm font-bold btn-secondary">
                Citizen sign in
              </Link>
              <Link href={`/${tenantSlug}/admin/login`} onClick={() => setIsOpen(false)} className="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-3 text-sm font-bold btn-primary">
                Staff portal
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
