import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { StellarProof } from '@/components/stellar/stellar-proof';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { getPropertyTaxReceiptByReference } from '@/services/civic-stellar-service';

export default async function TaxReceiptDetailPage({ params }: { params: Promise<{ tenant: string; referenceCode: string }> }) {
  const { tenant: tenantSlug, referenceCode } = await params;
  const receipt = await getPropertyTaxReceiptByReference(tenantSlug, referenceCode);

  if (!receipt) {
    notFound();
  }

  return (
    <PublicShell
      tenant={receipt.tenant}
      title="Tax receipt"
      subtitle={`${receipt.tenant.cityName} property tax`}
      backHref={`/${receipt.tenant.slug}/tax-receipts`}
    >
      <main className="page-section grid gap-4">
        <div>
          <span className="inline-flex max-w-full rounded-[14px] bg-[var(--surface-2)] px-3 py-2 font-mono text-[13px] font-bold text-[var(--ink)] break-all">
            {receipt.referenceCode}
          </span>
        </div>

        <div className="stat-grid">
          <div className="stat">
            <p className="sv">{receipt.taxYear}</p>
            <p className="sl">Tax year</p>
          </div>
          <div className="stat">
            <p className="sv">
              {String(receipt.amount)} {receipt.assetCode}
            </p>
            <p className="sl">Amount</p>
          </div>
        </div>

        <Card>
          <div className="divide-y divide-[var(--line)]">
            <DetailRow label="Taxpayer" value={receipt.taxpayerName} />
            <DetailRow label="Property index" value={receipt.propertyIndexNumber} />
            <DetailRow label="Property address" value={receipt.propertyAddress} />
            <DetailRow label="Issued" value={formatDate(receipt.issuedAt)} />
          </div>
        </Card>

        <StellarProof
          transactionHash={receipt.transactionHash}
          ledger={receipt.ledger}
          proofDigest={receipt.proofDigest}
          network={receipt.tenant.stellarNetwork}
        />
      </main>
    </PublicShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
      <p className="mt-1 break-words text-[14px] font-bold text-[var(--ink)]">{value}</p>
    </div>
  );
}
