import type { Metadata } from 'next';
import { FiGlobe } from 'react-icons/fi';
import { PlatformLoginForm } from '@/components/platform/platform-login-form';

export const metadata: Metadata = {
  title: 'Platform Console — CivicTrust',
  robots: { index: false, follow: false }
};

export default function PlatformLoginPage() {
  return (
    <div className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">CT</div>
            <div className="min-w-0">
              <p className="app-title truncate">Platform Console</p>
              <p className="app-subtitle truncate">Root administration</p>
            </div>
          </div>
          <span className="app-icon-btn">
            <FiGlobe aria-hidden="true" className="h-5 w-5" />
          </span>
        </header>

        <div className="civic-viewport viewport-flow" style={{ paddingBottom: 'calc(var(--safe-bottom) + 26px)' }}>
          <main className="page-section">
            <div className="mb-6 mt-2">
              <span className="grid h-16 w-16 place-items-center rounded-[20px] bg-gradient-to-br from-[var(--navy)] to-[var(--navy-900)] text-white shadow-[0_16px_34px_rgba(26,73,123,0.35)]">
                <FiGlobe aria-hidden="true" className="h-8 w-8" />
              </span>
              <h1 className="mt-5 font-display text-3xl font-extrabold tracking-[-0.03em] text-[var(--ink)]">Root sign in</h1>
              <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">
                Manage every city tenant, create new organizations, and oversee the platform.
              </p>
            </div>
            <PlatformLoginForm />
          </main>
        </div>
      </div>
    </div>
  );
}
