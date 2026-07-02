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
      <main className="px-4 py-12 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 max-w-3xl">
            <p className="section-eyebrow">Track Request</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Follow your report progress</h1>
            <p className="mt-3 text-slate-600">Enter the reference number given after submitting your report.</p>
          </div>
          <TrackReport tenantSlug={tenant.slug} initialReference={reference} />
        </div>
      </main>
    </PublicShell>
  );
}
