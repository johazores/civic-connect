import { HeroSection } from '@/components/public/hero-section';
import { HotlinesSection } from '@/components/public/hotlines-section';
import { NewsGrid } from '@/components/public/news-grid';
import { ServicesGrid } from '@/components/public/services-grid';
import { StellarExplainer } from '@/components/public/stellar-explainer';
import { PublicShell } from '@/components/layout/public-shell';
import { getTenantHomeData } from '@/services/tenant-service';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const data = await getTenantHomeData(tenantSlug);

  if (!data) {
    notFound();
  }

  const base = `/${data.tenant.slug}`;

  return (
    <PublicShell tenant={data.tenant}>
      <div className="home-page">
        <HeroSection tenant={data.tenant} categoriesCount={data.categories.length} />
        <StellarExplainer tenantSlug={data.tenant.slug} />

        <section className="home-section">
          <div className="section-head">
            <h2>Services</h2>
            <Link href={`${base}/services`}>View all</Link>
          </div>
          <ServicesGrid
            services={data.services.map((service: any) => ({ ...service, feeAmount: service.feeAmount ? String(service.feeAmount) : null }))}
            tenantSlug={data.tenant.slug}
          />
        </section>

        <div className="home-split">
          <HotlinesSection hotlines={data.hotlines} tenantSlug={data.tenant.slug} />
          <section className="home-section">
            <div className="section-head">
              <h2>Latest updates</h2>
              <Link href={`${base}/news`}>View all</Link>
            </div>
            <NewsGrid posts={data.newsPosts} tenantSlug={data.tenant.slug} />
          </section>
        </div>
      </div>
    </PublicShell>
  );
}
