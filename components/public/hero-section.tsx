import Link from 'next/link';
import { FiAward, FiCreditCard, FiFlag, FiHash } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { getTenantCopy } from '@/lib/tenant-copy';

export function HeroSection({
  tenant,
  categoriesCount
}: {
  tenant: {
    slug: string;
    orgType?: string | null;
    cityName: string;
    tagline: string;
    description: string;
  };
  categoriesCount: number;
}) {
  const copy = getTenantCopy(tenant.orgType);

  const quickActions: Array<{ label: string; href: string; Icon: IconType; text: string; tone: string }> = [
    { label: copy.payCta, href: `/${tenant.slug}/payments`, Icon: FiCreditCard, text: 'Wallet + QR', tone: 'action-navy' },
    { label: 'Public ledger', href: `/${tenant.slug}/ledger`, Icon: FiHash, text: 'Verify receipts', tone: 'action-teal' },
    ...(copy.isGovernment
      ? [{ label: 'Report issue', href: `/${tenant.slug}/report`, Icon: FiFlag, text: 'Track by reference', tone: 'action-ember' }]
      : [{ label: 'Volunteer', href: `/${tenant.slug}/civic-actions`, Icon: FiAward, text: 'Earn verified rewards', tone: 'action-ember' }]),
    { label: 'Programs', href: `/${tenant.slug}/civic-actions`, Icon: FiAward, text: copy.programsLabel, tone: 'action-gold' }
  ];

  return (
    <section className="home-hero">
      <div className="home-hero-banner">
        <div className="home-hero-copy">
          <p className="home-hero-eyebrow">CivicTrust · {tenant.cityName}</p>
          <h2 className="home-hero-title">{tenant.tagline}</h2>
          <p className="home-hero-description">{tenant.description}</p>
        </div>
        <div className="home-hero-stats">
          <HeroStat value="SEP-7" label="Wallet payments" />
          <HeroStat value="Horizon" label="Verified on-chain" />
          <HeroStat value={String(categoriesCount)} label={copy.isGovernment ? 'Services' : 'Programs'} />
        </div>
      </div>

      <div className="home-hero-actions">
        {quickActions.map(({ Icon, ...action }) => (
          <Link key={action.href} href={action.href} className={`home-action-card ${action.tone}`}>
            <span className="home-action-icon">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="home-action-label">{action.label}</span>
            <span className="home-action-hint">{action.text}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="home-hero-stat">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}
