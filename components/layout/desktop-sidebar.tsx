'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiShield, FiUser } from 'react-icons/fi';
import type { NavGroup, NavItem } from '@/components/layout/mobile-menu';
import { NavIcon } from '@/components/layout/nav-icon';

export function DesktopSidebar({
  tenantSlug,
  tenantName,
  cityName,
  navGroups
}: {
  tenantSlug: string;
  tenantName: string;
  cityName: string;
  navGroups: NavGroup[];
}) {
  const pathname = usePathname() ?? '';
  const base = `/${tenantSlug}`;

  return (
    <aside className="desktop-sidebar" aria-label="Main navigation">
      <div className="desktop-sidebar-brand">
        <Link href={base} className="desktop-sidebar-brand-link">
          <div className="app-mark">{cityName.slice(0, 2).toUpperCase()}</div>
          <div className="min-w-0">
            <p className="desktop-sidebar-title">{tenantName}</p>
            <p className="desktop-sidebar-subtitle">{cityName}</p>
          </div>
        </Link>
      </div>

      <nav className="desktop-sidebar-nav">
        <SidebarLink item={{ href: base, label: 'Overview', icon: 'home', exact: true }} active={pathname === base} />

        {navGroups.map((group) => (
          <section key={group.label} className="desktop-sidebar-group">
            <p className="desktop-sidebar-group-label">{group.label}</p>
            {group.items.map((item) => (
              <SidebarLink
                key={item.href}
                item={item}
                active={item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)}
              />
            ))}
          </section>
        ))}

        <section className="desktop-sidebar-group">
          <p className="desktop-sidebar-group-label">Help</p>
          <SidebarLink
            item={{ href: '/about', label: 'How Stellar works', icon: 'transparency' }}
            active={pathname === '/about'}
          />
        </section>
      </nav>

      <div className="desktop-sidebar-footer">
        <Link href={`${base}/login`} className="desktop-sidebar-footer-link">
          <FiUser className="h-4 w-4" />
          Sign in
        </Link>
        <Link href={`${base}/admin/login`} className="desktop-sidebar-footer-link desktop-sidebar-footer-link-primary">
          <FiShield className="h-4 w-4" />
          Staff portal
        </Link>
      </div>
    </aside>
  );
}

function SidebarLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`desktop-sidebar-link ${active ? 'is-active' : ''}`.trim()}
      aria-current={active ? 'page' : undefined}
    >
      <NavIcon name={item.icon} className="h-[18px] w-[18px]" />
      <span>{item.label}</span>
    </Link>
  );
}
