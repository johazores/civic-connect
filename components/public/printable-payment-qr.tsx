'use client';

import { useEffect } from 'react';

export function PrintablePaymentQr({
  tenantName,
  serviceTitle,
  amount,
  assetCode,
  memo,
  referenceCode,
  qrUrl
}: {
  tenantName: string;
  serviceTitle: string;
  amount: string;
  assetCode: string;
  memo: string;
  referenceCode: string;
  qrUrl: string;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="print-sheet mx-auto max-w-md px-6 py-10 text-center">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-sheet,
          .print-sheet * {
            visibility: visible;
          }
          .print-sheet {
            position: absolute;
            inset: 0;
            margin: auto;
          }
        }
      `}</style>
      <h1 className="font-display text-xl font-bold text-[var(--ink)]">{serviceTitle}</h1>
      <p className="mt-2 text-sm font-medium text-[var(--muted)]">{tenantName}</p>
      <p className="mt-4 font-display text-2xl font-bold text-[var(--ink)]">
        {amount} {assetCode}
      </p>
      <img src={qrUrl} alt="Payment QR code" width={280} height={280} className="mx-auto mt-6" />
      <p className="mt-4 text-sm font-medium text-[var(--muted)]">Scan with Freighter, Lobstr, or any Stellar wallet.</p>
      <p className="mt-3 break-all font-mono text-xs font-semibold text-[var(--ink)]">Receipt note: {memo}</p>
      <p className="mt-1 break-all font-mono text-xs font-semibold text-[var(--muted)]">Reference: {referenceCode}</p>
    </div>
  );
}
