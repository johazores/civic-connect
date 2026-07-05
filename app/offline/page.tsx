import Link from 'next/link';
import { FiHome, FiRefreshCw, FiWifiOff } from 'react-icons/fi';

export const metadata = {
  title: 'Offline | CivicTrust',
  description: 'Offline fallback screen for the CivicTrust PWA.'
};

export default function OfflinePage() {
  return (
    <main className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">CT</div>
            <div className="min-w-0">
              <p className="app-title truncate">CivicTrust</p>
              <p className="app-subtitle truncate">Offline mode</p>
            </div>
          </div>
        </header>

        <div className="civic-viewport viewport-flow grid place-items-center px-5 text-center">
          <section className="card w-full max-w-[340px] p-6">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] bg-[var(--surface-2)] text-[var(--navy)]">
              <FiWifiOff aria-hidden="true" className="h-8 w-8" />
            </div>
            <h1 className="mt-5 font-display text-2xl font-bold tracking-[-0.02em] text-[var(--ink)]">
              You are offline
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">
              CivicTrust needs a connection for live reports, payments, admin tools, and Stellar checks. Reconnect and refresh to continue.
            </p>
            <div className="mt-5 grid gap-2">
              <Link href="/" className="btn btn-primary btn-block">
                <FiHome aria-hidden="true" className="h-4 w-4" /> Open home
              </Link>
              <Link href="/offline" className="btn btn-outline btn-block">
                <FiRefreshCw aria-hidden="true" className="h-4 w-4" /> Try again
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
