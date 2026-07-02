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
    <PublicShell tenant={tenant}>
      <main className="page-section">
        <div className="mx-auto max-w-7xl">
          <CitizenDashboard tenantSlug={tenant.slug} />
        </div>
      </main>
    </PublicShell>
  );
}
