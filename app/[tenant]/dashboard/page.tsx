import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { CitizenDashboard } from '@/components/public/citizen-dashboard';
import { getTenantCopy } from '@/lib/tenant-copy';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function CitizenDashboardPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const copy = getTenantCopy(tenant.orgType);

  return (
    <PublicShell tenant={tenant} title="My account" subtitle={copy.isGovernment ? 'Reports, updates, receipts' : 'Activity, rewards, receipts'}>
      <main className="page-section pad-b">
        <CitizenDashboard tenantSlug={tenant.slug} orgType={tenant.orgType} cityEmail={tenant.email} cityPhone={tenant.phone} />
      </main>
    </PublicShell>
  );
}
