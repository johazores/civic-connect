import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiAward, FiChevronRight, FiCreditCard, FiFileText, FiHash } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { HeroSection } from '@/components/public/hero-section';
import { HotlinesSection } from '@/components/public/hotlines-section';
import { NewsGrid } from '@/components/public/news-grid';
import { ServicesGrid } from '@/components/public/services-grid';
import { PublicShell } from '@/components/layout/public-shell';
import { getTenantHomeData } from '@/services/tenant-service';

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const data = await getTenantHomeData(tenantSlug);

  if (!data) {
    notFound();
  }

  const base = `/${data.tenant.slug}`;

  const trustLinks: Array<{ href: string; title: string; description: string; Icon: IconType }> = [
    { href: `${base}/payments`, title: 'Proof-of-payment', description: 'Fees generate permanent transaction receipts', Icon: FiCreditCard },
    { href: `${base}/civic-actions`, title: 'Civic rewards', description: 'Verified participation can be rewarded', Icon: FiAward },
    { href: `${base}/transparency`, title: 'Budget transparency', description: 'Disbursements linked to ledger records', Icon: FiHash },
    { href: `${base}/tax-receipts`, title: 'Tax receipts', description: 'Property tax records with payment proof', Icon: FiFileText }
  ];

  return (
    <PublicShell tenant={data.tenant}>
      <HeroSection tenant={data.tenant} categoriesCount={data.categories.length} />

      <section className="px-5">
        <div className="section-head">
          <h2>Services</h2>
          <Link href={`${base}/services`}>View all</Link>
        </div>
        <ServicesGrid
          services={data.services.map((service: any) => ({ ...service, feeAmount: service.feeAmount ? String(service.feeAmount) : null }))}
          tenantSlug={data.tenant.slug}
        />

        <div className="section-head">
          <h2>Stellar civic trust</h2>
        </div>
        <div className="menu-group">
          <p className="border-b border-[var(--line)] px-4 py-3 text-[13px] font-medium leading-[1.5] text-[var(--muted)]">
            Stellar adds proof: verifiable receipts for payments, rewards, records, and taxes.
          </p>
          {trustLinks.map(({ Icon, ...item }) => (
            <Link key={item.href} href={item.href} className="menu-item">
              <span className="mi-ic">
                <Icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="mi-tx">
                <b>{item.title}</b>
                <span className="truncate">{item.description}</span>
              </span>
              <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
            </Link>
          ))}
        </div>
      </section>

      <HotlinesSection hotlines={data.hotlines} tenantSlug={data.tenant.slug} />

      <section className="px-5 pb-4">
        <div className="section-head">
          <h2>Latest updates</h2>
          <Link href={`${base}/news`}>View all</Link>
        </div>
        <NewsGrid posts={data.newsPosts} tenantSlug={data.tenant.slug} />
      </section>
    </PublicShell>
  );
}
