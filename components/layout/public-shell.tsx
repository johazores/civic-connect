import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { FiArrowLeft, FiUser } from 'react-icons/fi';
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
  /** Screen title rendered in the app bar (reference .appbar pattern). Omit on Home for the brand row. */
  title?: string;
  subtitle?: string;
  /** Renders a back button in the app bar. */
  backHref?: string;
  /** Focused flow (wizard/checkout): hides the tab bar and menu so nothing covers the form. */
  flow?: boolean;
  children: ReactNode;
}) {
  const base = `/${tenant.slug}`;

  const navGroups: NavGroup[] = [
    {
      label: 'Services',
      items: [
        { href: `${base}/services`, label: 'Service directory', description: 'Permits, forms, and fees', icon: 'services' },
        { href: `${base}/payments`, label: 'Service payments', description: 'Pay fees, verify receipts', icon: 'payments' },
        { href: `${base}/tax-receipts`, label: 'Tax receipts', description: 'Digital property tax records', icon: 'tax' }
      ]
    },
    {
      label: 'Requests',
      items: [
        { href: `${base}/report`, label: 'Report an issue', description: 'Roads, waste, lights, safety', icon: 'report' },
        { href: `${base}/track`, label: 'Track request', description: 'Follow status by reference', icon: 'track' },
        { href: `${base}/dashboard`, label: 'My account', description: 'Reports, updates, receipts', icon: 'account' }
      ]
    },
    {
      label: 'Civic trust',
      items: [
        { href: `${base}/ledger`, label: 'Civic ledger', description: 'Every Stellar-backed record', icon: 'transparency' },
        { href: `${base}/civic-actions`, label: 'Civic rewards', description: 'Verified participation actions', icon: 'rewards' },
        { href: `${base}/wallet`, label: 'Set up a wallet', description: 'Receive rewards on Stellar', icon: 'account' },
        { href: `${base}/transparency`, label: 'Budget transparency', description: 'Public disbursements', icon: 'transparency' }
      ]
    },
    {
      label: 'Updates',
      items: [
        { href: `${base}/news`, label: 'News', description: 'Official announcements', icon: 'news' },
        { href: `${base}/hotlines`, label: 'Hotlines', description: 'Emergency contacts', icon: 'hotlines' }
      ]
    }
  ];

  const tabs: NavItem[] = [
    { href: base, label: 'Home', icon: 'home', exact: true },
    { href: `${base}/track`, label: 'Track', icon: 'track' },
    { href: `${base}/report`, label: 'Report', icon: 'report', center: true },
    { href: `${base}/payments`, label: 'Pay', icon: 'payments' },
    { href: `${base}/dashboard`, label: 'Me', icon: 'account' }
  ];

  const primary = tenant.primaryColor || '#1a497b';

  return (
    <div className="civic-device-shell">
      <KeepWarm />
      <div
        className="civic-app-frame"
        style={{
          '--tenant-primary': primary,
          '--brand': primary,
          '--brand-dark': `color-mix(in srgb, ${primary} 70%, #0f2d4d)`
        } as CSSProperties}
      >
        <header className="civic-appbar">
          {title ? (
            <div className="flex min-w-0 items-center gap-3">
              {backHref ? (
                <Link href={backHref} className="app-icon-btn" aria-label="Back">
                  <FiArrowLeft aria-hidden="true" className="h-5 w-5" />
                </Link>
              ) : null}
              <div className="min-w-0">
                <h1 className="appbar-title truncate">{title}</h1>
                {subtitle ? <p className="app-subtitle truncate">{subtitle}</p> : null}
              </div>
            </div>
          ) : (
            <Link href={base} className="flex min-w-0 items-center gap-3" aria-label={`${tenant.name} home`}>
              <div className="app-mark">{initials(tenant.cityName)}</div>
              <div className="min-w-0">
                <p className="app-title truncate">{tenant.name}</p>
                <p className="app-subtitle truncate">{tenant.cityName} civic app</p>
              </div>
            </Link>
          )}

          {flow ? null : (
            <div className="flex shrink-0 items-center gap-2">
              <Link href={`${base}/login`} className="app-icon-btn" aria-label="Citizen sign in">
                <FiUser aria-hidden="true" className="h-5 w-5" />
              </Link>
              <MobileMenu tenantSlug={tenant.slug} tenantName={tenant.name} cityName={tenant.cityName} navGroups={navGroups} />
            </div>
          )}
        </header>

        <div className={`civic-viewport ${flow ? 'viewport-flow' : ''}`.trim()}>{children}</div>

        {flow ? null : <Tabbar items={tabs} />}
      </div>
    </div>
  );
}
