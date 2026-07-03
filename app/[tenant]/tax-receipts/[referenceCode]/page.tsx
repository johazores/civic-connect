import { notFound } from 'next/navigation';
import { FiCheckCircle, FiExternalLink } from 'react-icons/fi';
import { PublicShell } from '@/components/layout/public-shell';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { getPropertyTaxReceiptByReference } from '@/services/civic-stellar-service';

export default async function TaxReceiptDetailPage({ params }: { params: Promise<{ tenant: string; referenceCode: string }> }) {
  const { tenant: tenantSlug, referenceCode } = await params;
  const receipt = await getPropertyTaxReceiptByReference(tenantSlug, referenceCode);

  if (!receipt) {
    notFound();
  }

  const explorerNetwork = String(receipt.tenant.stellarNetwork || 'TESTNET').toUpperCase() === 'MAINNET' ? 'public' : 'testnet';

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

        {receipt.transactionHash ? (
          <Card>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]">
                <FiCheckCircle aria-hidden="true" className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="font-display text-[15px] font-bold text-[var(--ink)]">Stellar proof</p>
                <p className="text-[12px] font-semibold text-[var(--muted)]">Payment anchored on-chain</p>
              </div>
            </div>
            <div className="mt-4 rounded-[var(--radius-sm)] bg-[var(--surface-2)] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Transaction hash</p>
              <p className="mt-2 break-all font-mono text-[12px] font-bold text-[var(--ink)]">{receipt.transactionHash}</p>
              {receipt.ledger ? (
                <p className="mt-2 text-[12px] font-semibold text-[var(--muted)]">Ledger {receipt.ledger}</p>
              ) : null}
            </div>
            <a
              href={`https://stellar.expert/explorer/${explorerNetwork}/tx/${receipt.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="app-btn btn-outline btn-block mt-4"
            >
              <FiExternalLink aria-hidden="true" className="h-4 w-4" />
              View on Stellar explorer
            </a>
          </Card>
        ) : (
          <div className="rounded-[var(--radius-sm)] bg-[color-mix(in_srgb,var(--heat-2)_18%,var(--surface))] p-4 text-sm font-bold leading-6 text-[#9a6b00]">
            This receipt is issued in the system but does not yet have a Stellar transaction hash attached.
          </div>
        )}
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
