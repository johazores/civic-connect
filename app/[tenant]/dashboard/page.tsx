import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { CitizenDashboard } from '@/components/public/citizen-dashboard';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function CitizenDashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <PublicShell tenant={tenant} title="My account" subtitle="Reports, updates, receipts">
      <main className="page-section pad-b">
        <CitizenDashboard tenantSlug={tenant.slug} cityEmail={tenant.email} cityPhone={tenant.phone} />
      </main>
    </PublicShell>
  );
}
