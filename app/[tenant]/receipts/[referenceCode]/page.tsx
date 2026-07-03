import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { Card } from '@/components/ui/card';
import { formatDate, formatStatus } from '@/lib/format';
import { getPaymentIntentByReference } from '@/services/payment-service';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function ReceiptPage({ params }: { params: Promise<{ tenant: string; referenceCode: string }> }) {
  const { tenant: tenantSlug, referenceCode } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const payment = await getPaymentIntentByReference(tenantSlug, referenceCode);

  if (!payment) {
    notFound();
  }

  const isVerified = payment.status === 'VERIFIED';

  return (
    <PublicShell tenant={tenant}>
      <main className="page-section">
        <div className="mx-auto max-w-5xl">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-6">
              <div>
                <p className="section-eyebrow">Public receipt</p>
                <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.04em] text-slate-950 md:text-6xl">{payment.referenceCode}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">This receipt verifies a government service payment request and its matching Stellar Testnet transaction details.</p>
              </div>
              <span className={`rounded-full px-4 py-2 text-sm font-extrabold ${isVerified ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
                {formatStatus(payment.status)}
              </span>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Service</p>
                <p className="mt-2 text-xl font-extrabold text-slate-950">{payment.service.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{payment.service.description}</p>
              </div>
              <div className="rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-100">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">Amount paid</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-950">{String(payment.amount)} {payment.assetCode}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Network: {payment.tenant.stellarNetwork}</p>
              </div>
            </div>

            <dl className="mt-8 grid gap-4 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="font-bold text-slate-500">Payer</dt>
                <dd className="mt-1 font-extrabold text-slate-950">{payment.payerName}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="font-bold text-slate-500">Memo</dt>
                <dd className="mt-1 break-all font-extrabold text-slate-950">{payment.memo}</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <dt className="font-bold text-slate-500">Transaction hash</dt>
                <dd className="mt-1 break-all font-mono text-xs font-bold text-slate-700">{payment.transactionHash || 'Pending verification'}</dd>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <dt className="font-bold text-slate-500">Ledger</dt>
                  <dd className="mt-1 font-extrabold text-slate-950">{payment.ledger || 'Pending'}</dd>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <dt className="font-bold text-slate-500">Verified at</dt>
                  <dd className="mt-1 font-extrabold text-slate-950">{payment.verifiedAt ? formatDate(payment.verifiedAt) : 'Pending verification'}</dd>
                </div>
              </div>
            </dl>
          </Card>
        </div>
      </main>
    </PublicShell>
  );
}
