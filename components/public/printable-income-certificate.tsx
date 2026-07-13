'use client';

import { useEffect } from 'react';
import { formatDate } from '@/lib/format';
import type { IncomeCertificate } from '@/services/payment-certificate-service';

export function PrintableIncomeCertificate({
  certificate,
  certificateLabel = 'Payment certificate',
  autoPrint = false
}: {
  certificate: IncomeCertificate;
  certificateLabel?: string;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  return (
    <div className="print-sheet mx-auto max-w-2xl px-6 py-10">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">{certificateLabel}</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-[var(--ink)]">{certificate.tenantName}</h1>
      <p className="mt-2 text-sm font-medium text-[var(--muted)]">
        Verified payment history for {certificate.payerName}
        {certificate.payerEmail ? ` · ${certificate.payerEmail}` : ''}
      </p>
      <p className="mt-1 text-xs font-semibold text-[var(--muted)]">Generated {formatDate(certificate.generatedAt)}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {certificate.totalsByAsset.map((total) => (
          <div key={total.assetCode} className="rounded-[14px] bg-[var(--surface-2)] p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Total verified</p>
            <p className="mt-1 font-display text-xl font-bold text-[var(--ink)]">
              {total.totalAmount} {total.assetCode}
            </p>
          </div>
        ))}
        <div className="rounded-[14px] bg-[var(--surface-2)] p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Payments</p>
          <p className="mt-1 font-display text-xl font-bold text-[var(--ink)]">{certificate.paymentCount}</p>
        </div>
      </div>

      <table className="mt-8 w-full border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">
            <th className="py-2 pr-3">Reference</th>
            <th className="py-2 pr-3">Service</th>
            <th className="py-2 pr-3">Amount</th>
            <th className="py-2">Verified</th>
          </tr>
        </thead>
        <tbody>
          {certificate.entries.map((entry) => (
            <tr key={entry.referenceCode} className="border-b border-[var(--line)]">
              <td className="py-3 pr-3 font-mono text-xs font-semibold">{entry.referenceCode}</td>
              <td className="py-3 pr-3 font-medium text-[var(--ink)]">{entry.serviceTitle}</td>
              <td className="py-3 pr-3 font-bold text-[var(--ink)]">
                {entry.amount} {entry.assetCode}
              </td>
              <td className="py-3 text-xs font-medium text-[var(--muted)]">
                {entry.verifiedAt ? formatDate(entry.verifiedAt) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-8 text-xs font-medium leading-5 text-[var(--muted)]">
        Each payment above was verified on the Stellar network. Transaction hashes and public proofs are available in your payment history.
      </p>

      <button type="button" onClick={() => window.print()} className="app-btn btn-primary mt-6 print:hidden">
        Print certificate
      </button>
    </div>
  );
}
