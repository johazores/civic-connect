import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { StellarProof } from '@/components/stellar/stellar-proof';
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
    <PublicShell tenant={tenant} title="Receipt" subtitle={payment.referenceCode} backHref={`/${tenant.slug}/payments`}>
      <main className="page-section">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Public receipt</p>
              <h2 className="mt-1 font-display text-[17px] font-bold text-[var(--ink)]">{payment.service.title}</h2>
            </div>
            <span
              className={`status-pill shrink-0 ${
                isVerified
                  ? 'bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]'
                  : 'bg-[color-mix(in_srgb,var(--heat-2)_18%,var(--surface))] text-[#9a6b00]'
              }`}
            >
              {formatStatus(payment.status)}
            </span>
          </div>
          <p className="mt-2 text-[13px] font-medium leading-5 text-[var(--muted)]">{payment.service.description}</p>

          <div className="mt-4 border-t border-[var(--line)] pt-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Amount paid</p>
            <p className="mt-1 break-words font-display text-[28px] font-bold tracking-[-0.02em] text-[var(--ink)]">
              {String(payment.amount)} {payment.assetCode}
            </p>
            <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Public proof: {payment.transactionHash ? 'Saved' : 'Pending'}</p>
          </div>
        </Card>

        <p className="group-label mt-6">Verification details</p>
        <div className="menu-group">
          <div className="menu-item">
            <span className="mi-tx">
              <span className="!mt-0 text-[11px] font-extrabold uppercase tracking-[0.12em]">Payer</span>
              <b className="mt-0.5 break-words">{payment.payerName}</b>
            </span>
          </div>
          <div className="menu-item">
            <span className="mi-tx">
              <span className="!mt-0 text-[11px] font-extrabold uppercase tracking-[0.12em]">Receipt note</span>
              <b className="mt-0.5 break-all font-mono text-[13px]">{payment.memo}</b>
            </span>
          </div>
        </div>

        <div className="mt-4">
          <StellarProof
            transactionHash={payment.transactionHash}
            ledger={payment.ledger}
            network={payment.tenant.stellarNetwork}
          />
        </div>

        <div className="stat-grid">
          <div className="stat">
            <p className="sv">{payment.ledger || '—'}</p>
            <p className="sl">Public record</p>
          </div>
          <div className="stat">
            <p className="break-words font-display text-[15px] font-bold leading-snug text-[var(--ink)]">
              {payment.verifiedAt ? formatDate(payment.verifiedAt) : 'Pending'}
            </p>
            <p className="sl">Confirmed on</p>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium leading-5 text-[var(--muted)]">
          This receipt matches a government service payment with its public proof.
        </p>
      </main>
    </PublicShell>
  );
}
