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
    <PublicShell tenant={tenant} title="Track request" subtitle="Enter your reference number">
      <main className="page-section">
        <TrackReport tenantSlug={tenant.slug} initialReference={reference} />
      </main>
    </PublicShell>
  );
}
