'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate, formatStatus } from '@/lib/format';

type PaymentIntent = {
  referenceCode: string;
  payerName: string;
  payerEmail: string | null;
  amount: string;
  assetCode: string;
  destinationPublicKey: string;
  memo: string;
  sep7Uri: string;
  status: string;
  transactionHash: string | null;
  payerPublicKey: string | null;
  ledger: number | null;
  failureReason: string | null;
  createdAt: string;
  paidAt: string | null;
  verifiedAt: string | null;
  service: { title: string; description: string };
};

export function PaymentCheckout({ tenantSlug, initialPayment }: { tenantSlug: string; initialPayment: PaymentIntent }) {
  const [payment, setPayment] = useState(initialPayment);
  const [transactionHash, setTransactionHash] = useState(initialPayment.transactionHash || '');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  async function verifyPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsVerifying(true);

    const response = await fetch(`/api/tenant/${tenantSlug}/payments/${payment.referenceCode}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionHash })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to verify transaction.');
      setIsVerifying(false);
      return;
    }

    setPayment(payload.data);
    setIsVerifying(false);
  }

  const isVerified = payment.status === 'VERIFIED';

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="section-eyebrow">Payment request</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 md:text-5xl">{payment.referenceCode}</h1>
          </div>
          <span className={`rounded-full px-4 py-2 text-xs font-extrabold ${isVerified ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : payment.status === 'FAILED' ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
            {formatStatus(payment.status)}
          </span>
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
          <p className="text-sm font-bold text-slate-500">Service</p>
          <p className="mt-1 text-xl font-extrabold text-slate-950">{payment.service.title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{payment.service.description}</p>
        </div>

        <dl className="mt-5 grid gap-3 text-sm">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <dt className="font-bold text-slate-500">Amount</dt>
            <dd className="mt-1 text-2xl font-extrabold text-slate-950">{payment.amount} {payment.assetCode}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <dt className="font-bold text-slate-500">Memo</dt>
            <dd className="mt-1 break-all font-extrabold text-slate-950">{payment.memo}</dd>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <dt className="font-bold text-slate-500">Destination wallet</dt>
            <dd className="mt-1 break-all font-mono text-xs font-bold text-slate-700">{payment.destinationPublicKey}</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <p className="section-eyebrow">Complete with wallet</p>
        <h2 className="mt-3 text-2xl font-extrabold text-slate-950">Scan or open the SEP-7 payment request</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Use a Stellar-compatible wallet on Testnet. The memo must stay exactly the same so the receipt can be verified.
        </p>

        <div className="mt-6 grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
            <img src={`/api/tenant/${tenantSlug}/payments/${payment.referenceCode}/qr`} alt="SEP-7 payment QR code" className="h-auto w-full rounded-2xl" />
          </div>
          <div className="grid gap-3">
            <a href={payment.sep7Uri} className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold btn-primary">
              Open wallet payment
            </a>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(payment.sep7Uri)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold btn-secondary"
            >
              Copy payment URI
            </button>
            <p className="text-xs leading-5 text-slate-500">Created {formatDate(payment.createdAt)}. The app only generates a request; your wallet signs and submits it.</p>
          </div>
        </div>

        {isVerified ? (
          <div className="mt-6 rounded-[1.5rem] bg-emerald-50 p-5 ring-1 ring-emerald-200">
            <p className="font-extrabold text-emerald-800">Payment verified</p>
            <p className="mt-2 text-sm leading-6 text-emerald-700">Transaction hash and ledger data are permanently stored for this receipt.</p>
            <a href={`/${tenantSlug}/receipts/${payment.referenceCode}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-sm font-bold btn-primary">
              View public receipt
            </a>
          </div>
        ) : (
          <form onSubmit={verifyPayment} className="mt-6 grid gap-4 rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-100">
            <div>
              <label className="text-sm font-extrabold text-slate-700">Transaction hash</label>
              <Input required value={transactionHash} onChange={(event) => setTransactionHash(event.target.value)} placeholder="Paste the Stellar transaction hash after payment" />
            </div>
            {payment.failureReason ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{payment.failureReason}</p> : null}
            {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}
            <Button disabled={isVerifying}>{isVerifying ? 'Verifying on Horizon...' : 'Verify Stellar transaction'}</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
