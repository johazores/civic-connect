'use client';

import { useEffect } from 'react';
import { paymentRequestLabel } from '@/lib/tenant-copy';

export function PrintablePaymentQr({
  tenantName,
  serviceTitle,
  serviceKind,
  amount,
  assetCode,
  memo,
  referenceCode,
  qrUrl,
  autoPrint = true
}: {
  tenantName: string;
  serviceTitle: string;
  serviceKind?: string | null;
  amount: string;
  assetCode: string;
  memo: string;
  referenceCode: string;
  qrUrl: string;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  return (
    <div className="print-sheet mx-auto max-w-md px-6 py-10 text-center">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">
        {paymentRequestLabel(serviceKind)}
      </p>
      <h1 className="mt-2 font-display text-xl font-bold text-[var(--ink)]">{serviceTitle}</h1>
      <p className="mt-2 text-sm font-medium text-[var(--muted)]">{tenantName}</p>
      <p className="mt-4 font-display text-2xl font-bold text-[var(--ink)]">
        {amount} {assetCode}
      </p>
      <img src={qrUrl} alt="Payment QR code" width={280} height={280} className="mx-auto mt-6" />
      <p className="mt-4 text-sm font-medium text-[var(--muted)]">Scan with Freighter, Lobstr, or any Stellar wallet.</p>
      <p className="mt-3 break-all font-mono text-xs font-semibold text-[var(--ink)]">Receipt note: {memo}</p>
      <p className="mt-1 break-all font-mono text-xs font-semibold text-[var(--muted)]">Reference: {referenceCode}</p>
      <button type="button" onClick={() => window.print()} className="app-btn btn-primary mt-6 print:hidden">
        Print QR
      </button>
    </div>
  );
}
