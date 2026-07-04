import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { LedgerExplorer } from '@/components/public/ledger-explorer';
import { getCivicLedger } from '@/services/civic-stellar-service';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function LedgerPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const ledger = await getCivicLedger(tenant.slug);

  return (
    <PublicShell tenant={tenant} title="Public records" subtitle="Civic payments, rewards, and receipts" backHref={`/${tenant.slug}`}>
      <main className="page-section">
        <LedgerExplorer ledger={ledger} />
      </main>
    </PublicShell>
  );
}
