import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { CitizenAuthForm } from '@/components/public/citizen-auth-form';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function CitizenLoginPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <PublicShell tenant={tenant}>
      <main className="px-4 py-12 md:px-6">
        <div className="mx-auto max-w-6xl">
          <CitizenAuthForm tenantSlug={tenant.slug} mode="login" />
        </div>
      </main>
    </PublicShell>
  );
}
