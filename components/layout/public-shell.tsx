import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

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
      className="min-h-screen bg-[#f6f8fb] text-slate-900"
      style={{
        '--tenant-primary': tenant.primaryColor || '#2563eb',
        '--brand': tenant.primaryColor || '#2563eb',
        '--brand-dark': tenant.primaryColor || '#1d4ed8'
      } as CSSProperties}
    >
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link href={`/${tenant.slug}`} className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow-sm shadow-blue-950/10" style={{ backgroundColor: 'var(--tenant-primary)' }}>
              {tenant.cityName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight text-slate-950 sm:text-lg">{tenant.name}</p>
              <p className="hidden max-w-xs truncate text-xs font-medium text-slate-500 sm:block">{tenant.tagline}</p>
            </div>
          </Link>

          <nav className="hidden items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-blue-50 hover:text-[var(--tenant-primary)] xl:px-4"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/${tenant.slug}/login`}
              className="rounded-xl px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-950/10 transition hover:-translate-y-0.5 sm:px-4"
              style={{ backgroundColor: 'var(--tenant-primary)' }}
            >
              Login
            </Link>
            <Link
              href={`/${tenant.slug}/admin/login`}
              className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 sm:inline-flex"
            >
              Admin
            </Link>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3 md:px-6 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm"
            >
              {item.label}
            </Link>
          ))}
          <Link href={`/${tenant.slug}/admin/login`} className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm sm:hidden">
            Admin
          </Link>
        </nav>
      </header>

      {children}

      <footer className="border-t border-slate-200 bg-white px-4 py-8 text-sm text-slate-500 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 md:flex-row md:items-center">
          <p className="font-semibold text-slate-700">{tenant.cityName} citizen service platform.</p>
          <p className="break-words">{tenant.email || tenant.phone ? `${tenant.email || ''} ${tenant.phone || ''}`.trim() : 'Built for fast citizen support.'}</p>
        </div>
      </footer>
    </div>
  );
}
