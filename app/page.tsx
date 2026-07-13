import Link from 'next/link';
import { FiArrowRight, FiFlag, FiHeart, FiShield, FiUsers } from 'react-icons/fi';
import { orgTypeBadge } from '@/lib/tenant-copy';

const tenantLinks = [
  {
    href: '/bayanihan-ngo',
    name: 'Bayanihan NGO',
    orgType: 'NGO',
    description: 'Community aid, cleanup rewards, and transparent disbursements.'
  },
  {
    href: '/liga-sports',
    name: 'Liga Sports Club',
    orgType: 'COMMUNITY',
    description: 'League dues, prize pools, and verifiable payments.'
  },
  {
    href: '/freelancer-guild',
    name: 'Freelancer Guild',
    orgType: 'BUSINESS',
    description: 'Client payment receipts as portable income proof.'
  },
  {
    href: '/metro-city',
    name: 'Metro City',
    orgType: 'GOVERNMENT',
    description: 'Demo city — pay a fee, verify the receipt, explore the public ledger.'
  },
  {
    href: '/laguna-province',
    name: 'Laguna Province',
    orgType: 'GOVERNMENT',
    description: 'Regional demo — service payments with on-chain proof.'
  }
] as const;

const orgIcon = {
  NGO: FiHeart,
  COMMUNITY: FiUsers,
  BUSINESS: FiShield,
  GOVERNMENT: FiFlag
} as const;

export default function RootPage() {
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <div className="flex items-center gap-3">
            <div className="app-mark">CT</div>
            <div>
              <p className="app-title">CivicTrust</p>
              <p className="app-subtitle">Verifiable payments for communities and organizations</p>
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
          <p className="marketing-eyebrow">Stellar-powered trust layer</p>
          <h1 className="marketing-title">Collect payments. Release funds. Prove it in public.</h1>
          <p className="marketing-lead">
            NGOs, community groups, freelancers, and small businesses use CivicTrust to collect wallet-signed payments,
            reward volunteers, and publish transparent disbursements — without depending on government programs.
          </p>
          <div className="marketing-hero-actions">
            <Link href="/bayanihan-ngo" className="app-btn btn-primary">
              Open NGO demo <FiArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="app-btn btn-secondary">
              How Stellar works
            </Link>
          </div>
        </section>

        <section className="marketing-section">
          <h2 className="marketing-section-title">Choose a demo organization</h2>
          <div className="marketing-city-grid">
            {tenantLinks.map((tenant) => {
              const Icon = orgIcon[tenant.orgType];
              return (
                <Link key={tenant.href} href={tenant.href} className="marketing-city-card">
                  <span className="marketing-city-icon">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="marketing-city-name">{tenant.name}</span>
                  <span className="marketing-city-badge">{orgTypeBadge(tenant.orgType)}</span>
                  <span className="marketing-city-desc">{tenant.description}</span>
                  <FiArrowRight className="marketing-city-arrow h-4 w-4" />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="marketing-steps">
          <div className="marketing-step">
            <b>1</b>
            <div>
              <h3>Pay or donate</h3>
              <p>Members open a SEP-7 QR in Freighter or any Stellar wallet.</p>
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
              <h3>Share</h3>
              <p>Receipts, rewards, and disbursements stay on the public ledger.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
