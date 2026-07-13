import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { IncomeCertificateView } from '@/components/public/income-certificate-view';
import { getTenantCopy } from '@/lib/tenant-copy';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function IncomeCertificatePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const copy = getTenantCopy(tenant.orgType);

  return (
    <PublicShell
      tenant={tenant}
      flow
      title={copy.incomeCertificateLabel}
      subtitle="Verified payment history"
      backHref={`/${tenant.slug}/dashboard`}
    >
      <main className="page-section pb-6">
        <IncomeCertificateView tenantSlug={tenant.slug} certificateLabel={copy.incomeCertificateLabel} />
      </main>
    </PublicShell>
  );
}
