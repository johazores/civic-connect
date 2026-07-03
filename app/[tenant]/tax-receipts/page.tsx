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
    <PublicShell
      tenant={tenant}
      title="Tax receipts"
      subtitle="Verify property tax records on Stellar"
      backHref={`/${tenant.slug}`}
    >
      <main className="page-section">
        <TaxReceiptSearch tenantSlug={tenant.slug} />
      </main>
    </PublicShell>
  );
}
