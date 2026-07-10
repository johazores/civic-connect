import Link from 'next/link';
import { FiArrowRight, FiFlag, FiShield } from 'react-icons/fi';

const tenantLinks = [
  {
    href: '/metro-city',
    name: 'Metro City',
    description: 'Demo city — pay a fee, verify the receipt, explore the public ledger.'
  },
  {
    href: '/laguna-province',
    name: 'Laguna Province',
    description: 'Regional demo — service payments with on-chain proof.'
  }
];

export default function RootPage() {
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <div className="flex items-center gap-3">
            <div className="app-mark">CT</div>
            <div>
              <p className="app-title">CivicTrust</p>
              <p className="app-subtitle">Civic services with public proof</p>
            </div>
          </div>
          <nav className="marketing-header-nav">
            <Link href="/about">How it works</Link>
            <Link href="/root" className="marketing-header-muted">Platform</Link>
          </nav>
        </div>
      </header>

      <main className="marketing-main">
        <section className="marketing-hero">
          <p className="marketing-eyebrow">Stellar-powered civic trust</p>
          <h1 className="marketing-title">Pay government fees. Get proof anyone can verify.</h1>
          <p className="marketing-lead">
            Citizens pay from their own wallet. The city keeps one wallet. Every verified payment becomes a permanent public receipt on the Stellar ledger.
          </p>
          <div className="marketing-hero-actions">
            <Link href="/metro-city" className="app-btn btn-primary">
              Open demo city <FiArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="app-btn btn-secondary">
              How Stellar works
            </Link>
          </div>
        </section>

        <section className="marketing-section">
          <h2 className="marketing-section-title">Choose a demo city</h2>
          <div className="marketing-city-grid">
            {tenantLinks.map((tenant) => (
              <Link key={tenant.href} href={tenant.href} className="marketing-city-card">
                <span className="marketing-city-icon">
                  <FiFlag className="h-5 w-5" />
                </span>
                <span className="marketing-city-name">{tenant.name}</span>
                <span className="marketing-city-desc">{tenant.description}</span>
                <FiArrowRight className="marketing-city-arrow h-4 w-4" />
              </Link>
            ))}
          </div>
        </section>

        <section className="marketing-steps">
          <div className="marketing-step">
            <b>1</b>
            <div>
              <h3>Pay</h3>
              <p>Citizen opens a SEP-7 QR in Freighter or any Stellar wallet.</p>
            </div>
          </div>
          <div className="marketing-step">
            <b>2</b>
            <div>
              <h3>Prove</h3>
              <p>Horizon verifies amount, destination, and receipt note.</p>
            </div>
          </div>
          <div className="marketing-step">
            <b>3</b>
            <div>
              <h3>Check</h3>
              <p>Transaction hash lives in the public ledger forever.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
