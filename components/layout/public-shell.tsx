import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { MobileMenu } from '@/components/layout/mobile-menu';

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
  const navItems = [
    { href: `/${tenant.slug}`, label: 'Home' },
    { href: `/${tenant.slug}/report`, label: 'Report' },
    { href: `/${tenant.slug}/track`, label: 'Track' },
    { href: `/${tenant.slug}/services`, label: 'Services' },
    { href: `/${tenant.slug}/hotlines`, label: 'Hotlines' },
    { href: `/${tenant.slug}/news`, label: 'News' },
    { href: `/${tenant.slug}/dashboard`, label: 'My Account' }
  ];

  return (
    <div
      className="min-h-screen text-slate-900"
      style={{
        '--tenant-primary': tenant.primaryColor || '#2563eb',
        '--brand': tenant.primaryColor || '#2563eb',
        '--brand-dark': tenant.primaryColor || '#1d4ed8'
      } as CSSProperties}
    >
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/82 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link href={`/${tenant.slug}`} className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] text-sm font-black text-white shadow-[0_16px_30px_rgba(37,99,235,0.22)]" style={{ background: 'linear-gradient(135deg, var(--tenant-primary), #0284c7)' }}>
              {tenant.cityName.slice(0, 2).toUpperCase()}
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-4 border-white bg-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-[-0.03em] text-slate-900 sm:text-lg">{tenant.name}</p>
              <p className="hidden max-w-xs truncate text-xs font-black text-slate-500 sm:block">{tenant.tagline}</p>
            </div>
          </Link>

          <nav className="hidden items-center rounded-full border border-slate-200 bg-white/88 p-1 shadow-[0_12px_32px_rgba(16,32,51,0.08)] lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-blue-50 hover:text-[var(--tenant-primary)] xl:px-4"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Link href={`/${tenant.slug}/login`} className="inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold btn-primary">
              Login
            </Link>
            <Link href={`/${tenant.slug}/admin/login`} className="inline-flex min-h-11 items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold btn-secondary">
              Admin
            </Link>
          </div>

          <MobileMenu tenantSlug={tenant.slug} navItems={navItems} />
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-200/80 bg-white/90 px-4 py-8 text-sm text-slate-500 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 md:flex-row md:items-center">
          <p className="font-extrabold text-slate-700">{tenant.cityName} citizen service platform.</p>
          <p className="break-words">{tenant.email || tenant.phone ? `${tenant.email || ''} ${tenant.phone || ''}`.trim() : 'Built for fast citizen support.'}</p>
        </div>
      </footer>
    </div>
  );
}
