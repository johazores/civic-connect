import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { LedgerExplorer } from '@/components/public/ledger-explorer';
import { getTenantCopy } from '@/lib/tenant-copy';
import { getCivicLedger } from '@/services/civic-ledger';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function LedgerPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const copy = getTenantCopy(tenant.orgType);
  const ledger = await getCivicLedger(tenant.slug);

  return (
    <PublicShell tenant={tenant} title="Public records" subtitle={copy.isGovernment ? 'Payments, rewards, and receipts' : 'Payments, rewards, and fund releases'} backHref={`/${tenant.slug}`}>
      <main className="page-section">
        <LedgerExplorer ledger={ledger} isGovernment={copy.isGovernment} />
      </main>
    </PublicShell>
  );
}
