import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { TrackReport } from '@/components/public/track-report';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function TrackPage({
  params,
  searchParams
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ reference?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const { reference = '' } = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <PublicShell tenant={tenant}>
      <main className="page-section">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 max-w-3xl">
            <p className="section-eyebrow">Track Request</p>
            <h1 className="heading-display mt-4 text-4xl md:text-6xl">Follow your report progress</h1>
            <p className="mt-4 text-base font-medium leading-7 text-slate-600">Enter the reference number given after submitting your report.</p>
          </div>
          <TrackReport tenantSlug={tenant.slug} initialReference={reference} />
        </div>
      </main>
    </PublicShell>
  );
}
