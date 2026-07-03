import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiAward, FiCreditCard, FiFileText, FiFlag, FiGrid, FiHash } from 'react-icons/fi';
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

  const quickLinks: Array<{ href: string; title: string; description: string; Icon: IconType }> = [
    {
      href: `/${data.tenant.slug}/services`,
      title: 'Find a service',
      description: 'Permits, clearances, forms, payments, and public requirements.',
      Icon: FiGrid
    },
    {
      href: `/${data.tenant.slug}/report`,
      title: 'Submit a concern',
      description: 'Send location, category, notes, and photos to the right team.',
      Icon: FiFlag
    },
    {
      href: `/${data.tenant.slug}/payments`,
      title: 'Pay with proof',
      description: 'Create a Stellar Testnet payment request and keep a public receipt.',
      Icon: FiCreditCard
    },
    {
      href: `/${data.tenant.slug}/transparency`,
      title: 'View transparency',
      description: 'Follow public records, allocations, and verified disbursements.',
      Icon: FiHash
    }
  ];

  return (
    <PublicShell tenant={data.tenant}>
      <HeroSection tenant={data.tenant} categoriesCount={data.categories.length} />

      <section className="px-4 py-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map(({ Icon, ...item }) => (
              <Link key={item.href} href={item.href} className="card-hover rounded-2xl border border-slate-200 bg-white/94 p-5 shadow-[0_18px_42px_rgba(18,32,51,0.07)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-[var(--brand)] ring-1 ring-blue-100">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-100">Open</span>
                </div>
                <h2 className="mt-5 text-lg font-black tracking-[-0.03em] text-slate-950">{item.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Services</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">Most requested services</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">Public services are designed as clear cards with requirements, responsible department, and Stellar-enabled fee options where configured.</p>
            </div>
            <Link href={`/${data.tenant.slug}/services`} className="inline-flex w-fit rounded-full px-4 py-2 text-sm font-black transition btn-secondary">
              Browse all
            </Link>
          </div>
          <ServicesGrid services={data.services.map((service: any) => ({ ...service, feeAmount: service.feeAmount ? String(service.feeAmount) : null }))} tenantSlug={data.tenant.slug} />
        </div>
      </section>

      <section className="px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] brand-panel p-6 shadow-[0_28px_90px_rgba(18,32,51,0.12)] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="section-eyebrow">Stellar civic trust</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">Payments and public records citizens can verify.</h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">The platform stays focused on civic services. Stellar adds proof: transaction hashes for payments, rewards, transparency records, and future tax receipts.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                [FiCreditCard, 'Proof-of-payment', 'Government service fees generate permanent transaction receipts.'],
                [FiAward, 'Civic rewards', 'Verified participation and cleanup actions can be rewarded.'],
                [FiHash, 'Budget transparency', 'Public disbursements can be connected to ledger records.'],
                [FiFileText, 'Tax receipts', 'Property tax records can include verifiable payment proof.']
              ].map(([Icon, title, description]) => {
                const CardIcon = Icon as IconType;
                return (
                  <div key={title as string} className="rounded-2xl border border-white/80 bg-white/82 p-4 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                      <CardIcon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <p className="mt-3 font-black text-slate-950">{title as string}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <HotlinesSection hotlines={data.hotlines} tenantSlug={data.tenant.slug} />

      <section className="page-section">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="section-eyebrow">Official feed</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">Latest announcements</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">A mobile-friendly public feed for service advisories, city updates, and community notices.</p>
            </div>
            <Link href={`/${data.tenant.slug}/news`} className="inline-flex w-fit rounded-full px-4 py-2 text-sm font-black transition btn-secondary">
              View all updates
            </Link>
          </div>
          <NewsGrid posts={data.newsPosts} tenantSlug={data.tenant.slug} />
        </div>
      </section>
    </PublicShell>
  );
}
