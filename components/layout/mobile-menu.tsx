'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiChevronRight, FiHome, FiMenu, FiShield, FiUser, FiX } from 'react-icons/fi';
import { NavIcon } from '@/components/layout/nav-icon';

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
  center?: boolean;
  exact?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

const CLOSE_MS = 320;

export function MobileMenu({
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
  const [state, setState] = useState<'closed' | 'open' | 'closing'>('closed');
  const [frameEl, setFrameEl] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);

  // The sheet must be portaled into the phone frame: rendering it inside the
  // backdrop-filtered app bar would trap absolute positioning in the header box.
  useEffect(() => {
    setFrameEl((triggerRef.current?.closest('.app-shell-frame, .civic-app-frame') as HTMLElement) ?? null);
  }, []);

  const close = useCallback(() => {
    setState('closing');
    closeTimer.current = window.setTimeout(() => setState('closed'), CLOSE_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (state !== 'open') return;

    closeBtnRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }

      if (event.key !== 'Tab' || !sheetRef.current) return;

      const focusables = sheetRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, close]);

  const isOpen = state !== 'closed';
  const anim = state === 'closing' ? 'out' : 'in';

  const homeItem: NavItem = { href: `/${tenantSlug}`, label: 'Home', description: 'Civic app overview', icon: 'home' };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setState('open')}
        aria-label="Open menu"
        aria-expanded={state === 'open'}
        aria-haspopup="dialog"
        className="app-icon-btn"
      >
        <FiMenu aria-hidden="true" className="h-5 w-5" />
      </button>

      {isOpen && frameEl
        ? createPortal(
            <>
              <button type="button" className={`sheet-backdrop backdrop-${anim}`} onClick={close} aria-label="Close menu" tabIndex={-1} />
              <div ref={sheetRef} className={`sheet sheet-${anim}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
                <div className="sheet-grab" />
                <div className="sheet-head">
                  <div className="min-w-0">
                    <h2 className="truncate">Menu</h2>
                    <p className="sheet-sub truncate">
                      {tenantName} · {cityName}
                    </p>
                  </div>
                  <button ref={closeBtnRef} type="button" onClick={close} aria-label="Close menu" className="app-icon-btn">
                    <FiX aria-hidden="true" className="h-5 w-5" />
                  </button>
                </div>

                <div className="sheet-scroll">
                  <div className="mb-4 grid grid-cols-2 gap-2.5">
                    <Link href={`/${tenantSlug}/login`} onClick={close} className="app-btn btn-outline">
                      <FiUser aria-hidden="true" className="h-4 w-4" />
                      Sign in
                    </Link>
                    <Link href={`/${tenantSlug}/admin/login`} onClick={close} className="app-btn btn-primary">
                      <FiShield aria-hidden="true" className="h-4 w-4" />
                      Staff portal
                    </Link>
                  </div>

                  <nav aria-label="App navigation">
                    <div className="menu-group">
                      <MenuLink item={homeItem} active={pathname === homeItem.href} onNavigate={close} />
                      <MenuLink
                        item={{ href: '/about', label: 'How it works', description: 'How public proof helps civic services', icon: 'transparency' }}
                        active={pathname === '/about'}
                        onNavigate={close}
                      />
                    </div>

                    {navGroups.map((group) => (
                      <section key={group.label}>
                        <p className="group-label">{group.label}</p>
                        <div className="menu-group">
                          {group.items.map((item) => (
                            <MenuLink key={item.href} item={item} active={pathname === item.href} onNavigate={close} />
                          ))}
                        </div>
                      </section>
                    ))}
                  </nav>
                </div>
              </div>
            </>,
            frameEl
          )
        : null}
    </>
  );
}

function MenuLink({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate: () => void }) {
  return (
    <Link href={item.href} onClick={onNavigate} className={`menu-item ${active ? 'on' : ''}`.trim()} aria-current={active ? 'page' : undefined}>
      <span className="mi-ic">
        <NavIcon name={item.icon} className="h-5 w-5" />
      </span>
      <span className="mi-tx">
        <b>{item.label}</b>
        {item.description ? <span>{item.description}</span> : null}
      </span>
      <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
    </Link>
  );
}

export function Tabbar({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? '';

  return (
    <nav className="tabbar" aria-label="Primary navigation">
      {items.map((item) => {
        const isActive = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

        if (item.center) {
          return (
            <Link key={item.href} href={item.href} className="tab tab-center" aria-label={item.label}>
              <span className="fab">
                <NavIcon name={item.icon} />
              </span>
            </Link>
          );
        }

        return (
          <Link key={item.href} href={item.href} className={`tab ${isActive ? 'on' : ''}`.trim()} aria-current={isActive ? 'page' : undefined}>
            <NavIcon name={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
