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
        '--tenant-primary': tenant.primaryColor || '#1f6feb',
        '--brand': tenant.primaryColor || '#1f6feb',
        '--brand-dark': tenant.primaryColor || '#164fa8'
      } as CSSProperties}
    >
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/88 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
          <Link href={`/${tenant.slug}`} className="flex min-w-0 items-center gap-3" aria-label={`${tenant.name} home`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(31,111,235,0.2)]" style={{ background: 'linear-gradient(135deg, var(--tenant-primary), #14b8a6)' }}>
              {tenant.cityName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold tracking-[-0.03em] text-slate-950 sm:text-lg">{tenant.name}</p>
              <p className="hidden max-w-xs truncate text-xs font-semibold text-slate-500 sm:block">{tenant.tagline}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white/90 p-1 shadow-[0_10px_28px_rgba(18,32,51,0.06)] lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-blue-50 hover:text-[var(--tenant-primary)] xl:px-4"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 items-center gap-2 lg:flex">
            <Link href={`/${tenant.slug}/login`} className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold btn-secondary">
              Sign in
            </Link>
            <Link href={`/${tenant.slug}/admin/login`} className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold btn-primary">
              Staff
            </Link>
          </div>

          <MobileMenu tenantSlug={tenant.slug} navItems={navItems} />
        </div>
      </header>

      {children}

      <footer className="border-t border-slate-200/80 bg-white/92 px-4 py-8 text-sm text-slate-500 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-bold text-slate-800">{tenant.cityName} citizen service platform</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Built for transparent reporting, service requests, and public communication.</p>
          </div>
          <p className="break-words text-slate-600">{tenant.email || tenant.phone ? `${tenant.email || ''} ${tenant.phone || ''}`.trim() : 'Support details can be managed from staff settings.'}</p>
        </div>
      </footer>
    </div>
  );
}
