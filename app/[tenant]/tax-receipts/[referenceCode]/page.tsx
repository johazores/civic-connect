import { notFound } from 'next/navigation';
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

  return (
    <PublicShell tenant={receipt.tenant}>
      <section className="page-section">
        <div className="mx-auto max-w-4xl">
          <Card>
            <p className="section-eyebrow">Property tax receipt</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-slate-950">{receipt.referenceCode}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">This record is issued by {receipt.tenant.cityName}. If a Stellar transaction hash is attached, the payment proof can be verified through Horizon.</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Info label="Taxpayer" value={receipt.taxpayerName} />
              <Info label="Property index" value={receipt.propertyIndexNumber} />
              <Info label="Property address" value={receipt.propertyAddress} />
              <Info label="Tax year" value={String(receipt.taxYear)} />
              <Info label="Amount" value={`${String(receipt.amount)} ${receipt.assetCode}`} />
              <Info label="Issued" value={formatDate(receipt.issuedAt)} />
            </div>
            {receipt.transactionHash ? (
              <div className="mt-6 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700">Stellar transaction hash</p>
                <p className="mt-2 break-all font-mono text-xs font-bold text-emerald-900">{receipt.transactionHash}</p>
                {receipt.ledger ? <p className="mt-2 text-sm font-bold text-emerald-800">Ledger {receipt.ledger}</p> : null}
              </div>
            ) : (
              <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700 ring-1 ring-amber-200">This receipt is issued in the system but does not yet have a Stellar transaction hash attached.</p>
            )}
          </Card>
        </div>
      </section>
    </PublicShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 font-extrabold text-slate-950">{value}</p></div>;
}
