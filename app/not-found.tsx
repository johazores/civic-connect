import Link from 'next/link';
import { FiCompass } from 'react-icons/fi';

export default function NotFound() {
  return (
    <main className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">CT</div>
            <div className="min-w-0">
              <p className="app-title truncate">CivicTrust</p>
              <p className="app-subtitle truncate">Mobile civic operating system</p>
            </div>
          </div>
        </header>

        <div
          className="civic-viewport viewport-flow flex flex-col items-center justify-center px-5"
          style={{ paddingBottom: 'calc(var(--safe-bottom) + 26px)' }}
        >
          <div className="empty">
            <div className="eart">
              <FiCompass className="h-10 w-10" />
            </div>
            <p className="section-eyebrow" style={{ color: 'var(--ember)' }}>Error 404</p>
            <h3 className="mt-2 font-display text-[var(--ink)]">Page not found</h3>
            <p>The page you are looking for does not exist or has moved.</p>
            <Link href="/" className="btn btn-primary mt-6 px-8">
              Go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
