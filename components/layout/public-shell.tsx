import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { FiArrowLeft, FiUser } from 'react-icons/fi';
import { DesktopSidebar } from '@/components/layout/desktop-sidebar';
import { MobileMenu, Tabbar, type NavGroup, type NavItem } from '@/components/layout/mobile-menu';
import { KeepWarm } from '@/components/layout/keep-warm';

function initials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'CC'
  );
}

export function PublicShell({
  tenant,
  title,
  subtitle,
  backHref,
  flow = false,
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
  title?: string;
  subtitle?: string;
  backHref?: string;
  flow?: boolean;
  children: ReactNode;
}) {
  const base = `/${tenant.slug}`;
  const pageTitle = title || tenant.cityName;
  const pageSubtitle = subtitle || tenant.tagline;

  const navGroups: NavGroup[] = [
    {
      label: 'Pay & prove',
      items: [
        { href: `${base}/payments`, label: 'Pay or donate', icon: 'payments' },
        { href: `${base}/ledger`, label: 'Public ledger', icon: 'transparency' }
      ]
    },
    {
      label: 'Organization',
      items: [
        { href: `${base}/services`, label: 'Services', icon: 'services' },
        { href: `${base}/report`, label: 'Submit request', icon: 'report' },
        { href: `${base}/track`, label: 'Track request', icon: 'track' },
        { href: `${base}/dashboard`, label: 'My account', icon: 'account' }
      ]
    },
    {
      label: 'Programs',
      items: [
        { href: `${base}/civic-actions`, label: 'Volunteer & rewards', icon: 'rewards' },
        { href: `${base}/wallet`, label: 'Your wallet', icon: 'account' },
        { href: `${base}/transparency`, label: 'Fund transparency', icon: 'transparency' }
      ]
    },
    {
      label: 'Updates',
      items: [
        { href: `${base}/news`, label: 'News', icon: 'news' },
        { href: `${base}/hotlines`, label: 'Hotlines', icon: 'hotlines' }
      ]
    }
  ];

  const tabs: NavItem[] = [
    { href: base, label: 'Home', icon: 'home', exact: true },
    { href: `${base}/payments`, label: 'Pay', icon: 'payments' },
    { href: `${base}/report`, label: 'Report', icon: 'report', center: true },
    { href: `${base}/ledger`, label: 'Ledger', icon: 'transparency' },
    { href: `${base}/dashboard`, label: 'Me', icon: 'account' }
  ];

  const primary = tenant.primaryColor || '#1a497b';

  return (
    <div className="app-shell">
      <KeepWarm />
      <div
        className={`app-shell-frame ${flow ? 'is-flow' : 'has-desktop-nav'}`.trim()}
        style={{
          '--tenant-primary': primary,
          '--brand': primary,
          '--brand-dark': `color-mix(in srgb, ${primary} 70%, #0f2d4d)`
        } as CSSProperties}
      >
        {!flow ? (
          <DesktopSidebar
            tenantSlug={tenant.slug}
            tenantName={tenant.name}
            cityName={tenant.cityName}
            navGroups={navGroups}
          />
        ) : null}

        <div className="app-shell-main">
          <header className="app-topbar">
            <div className="app-topbar-start">
              {backHref ? (
                <Link href={backHref} className="app-icon-btn mobile-only" aria-label="Back">
                  <FiArrowLeft className="h-5 w-5" />
                </Link>
              ) : null}

              <Link href={base} className="app-topbar-brand mobile-only">
                <div className="app-mark">{initials(tenant.cityName)}</div>
                <div className="min-w-0">
                  <p className="app-title truncate">{tenant.name}</p>
                  <p className="app-subtitle truncate">{tenant.cityName}</p>
                </div>
              </Link>

              <div className="app-topbar-heading desktop-only">
                <h1 className="app-topbar-title">{pageTitle}</h1>
                {pageSubtitle ? <p className="app-topbar-subtitle">{pageSubtitle}</p> : null}
              </div>
            </div>

            {!flow ? (
              <div className="app-topbar-actions">
                <Link href={`${base}/payments`} className="app-btn btn-primary btn-compact desktop-only">
                  Pay a fee
                </Link>
                <Link href={`${base}/login`} className="app-topbar-action desktop-only">
                  Sign in
                </Link>
                <Link href={`${base}/login`} className="app-icon-btn mobile-only" aria-label="Sign in">
                  <FiUser className="h-5 w-5" />
                </Link>
                <MobileMenu
                  tenantSlug={tenant.slug}
                  tenantName={tenant.name}
                  cityName={tenant.cityName}
                  navGroups={navGroups}
                />
              </div>
            ) : null}
          </header>

          <main className={`app-main ${flow ? 'is-flow' : ''}`.trim()}>
            <div className={`app-main-inner ${flow ? 'is-narrow' : ''}`.trim()}>{children}</div>
          </main>

          {!flow ? <Tabbar items={tabs} /> : null}
        </div>
      </div>
    </div>
  );
}
