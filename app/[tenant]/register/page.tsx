import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { CitizenAuthForm } from '@/components/public/citizen-auth-form';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function CitizenRegisterPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <PublicShell tenant={tenant} title="Create account" subtitle="Citizen account" backHref={`/${tenant.slug}`}>
      <main className="page-section pad-b">
        <CitizenAuthForm tenantSlug={tenant.slug} mode="register" />
      </main>
    </PublicShell>
  );
}
