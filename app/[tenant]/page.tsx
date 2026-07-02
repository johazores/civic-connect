import { notFound } from 'next/navigation';
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

  return (
    <PublicShell tenant={data.tenant}>
      <HeroSection tenant={data.tenant} categoriesCount={data.categories.length} />
      <section className="page-section">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="section-eyebrow">Services</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">Find city services</h2>
            </div>
          </div>
          <ServicesGrid services={data.services.map((service: any) => ({ ...service, feeAmount: service.feeAmount ? String(service.feeAmount) : null }))} tenantSlug={data.tenant.slug} />
        </div>
      </section>
      <HotlinesSection hotlines={data.hotlines} tenantSlug={data.tenant.slug} />
      <section className="page-section">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <p className="section-eyebrow">News</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">Latest announcements</h2>
          </div>
          <NewsGrid posts={data.newsPosts} tenantSlug={data.tenant.slug} />
        </div>
      </section>
    </PublicShell>
  );
}
