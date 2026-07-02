import Link from 'next/link';
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

  const quickLinks = [
    {
      href: `/${data.tenant.slug}/services`,
      title: 'Find a service',
      description: 'Permits, clearances, forms, payments, and public requirements.',
      icon: '▣'
    },
    {
      href: `/${data.tenant.slug}/report`,
      title: 'Submit a concern',
      description: 'Send location, category, notes, and photos to the right team.',
      icon: '+'
    },
    {
      href: `/${data.tenant.slug}/payments`,
      title: 'Pay with proof',
      description: 'Create a Stellar Testnet payment request and keep a public receipt.',
      icon: '◎'
    },
    {
      href: `/${data.tenant.slug}/transparency`,
      title: 'View transparency',
      description: 'Follow public records, allocations, and verified disbursements.',
      icon: '⌁'
    }
  ];

  return (
    <PublicShell tenant={data.tenant}>
      <HeroSection tenant={data.tenant} categoriesCount={data.categories.length} />

      <section className="px-4 py-4 md:px-6 md:py-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="card-hover rounded-[1.75rem] border border-slate-200 bg-white/92 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.07)] backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-[var(--brand)] ring-1 ring-blue-100">{item.icon}</span>
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
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_28px_90px_rgba(15,23,42,0.22)] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Stellar civic trust</p>
              <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] md:text-4xl">Payments and public records citizens can verify.</h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-300">The platform stays focused on civic services. Stellar adds proof: transaction hashes for payments, rewards, transparency records, and future tax receipts.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ['Proof-of-payment', 'Government service fees generate permanent transaction receipts.'],
                ['Civic rewards', 'Verified participation and cleanup actions can be rewarded.'],
                ['Budget transparency', 'Public disbursements can be connected to ledger records.'],
                ['Tax receipts', 'Property tax records can include verifiable payment proof.']
              ].map(([title, description]) => (
                <div key={title} className="rounded-[1.5rem] bg-white/8 p-4 ring-1 ring-white/10">
                  <p className="font-black text-white">{title}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-300">{description}</p>
                </div>
              ))}
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
