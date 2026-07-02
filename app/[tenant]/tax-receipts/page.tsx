import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { TaxReceiptSearch } from '@/components/public/tax-receipt-search';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function TaxReceiptsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <PublicShell tenant={tenant}>
      <section className="page-section">
        <div className="mx-auto max-w-7xl">
          <TaxReceiptSearch tenantSlug={tenant.slug} />
        </div>
      </section>
    </PublicShell>
  );
}
