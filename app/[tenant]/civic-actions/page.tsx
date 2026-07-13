import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { CivicActionForm } from '@/components/public/civic-action-form';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function CivicActionsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <PublicShell tenant={tenant} title="Programs & rewards" subtitle="Volunteer, participate, and earn verified rewards" backHref={`/${tenant.slug}`}>
      <main className="page-section">
        <CivicActionForm tenantSlug={tenant.slug} />
      </main>
    </PublicShell>
  );
}
