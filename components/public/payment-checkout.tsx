'use client';

import { useState } from 'react';
import { FiCheck, FiCheckCircle, FiClipboard, FiCopy, FiCreditCard, FiPrinter, FiSearch } from 'react-icons/fi';
import { StellarProof } from '@/components/stellar/stellar-proof';
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  async function copyValue(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey((current) => (current === key ? null : current)), 2000);
    } catch {
      setCopiedKey(null);
    }
  }

  async function verifyPayment(event?: React.FormEvent<HTMLFormElement>, mode: 'hash' | 'scan' = 'hash') {
    event?.preventDefault();
    setError('');
    setIsVerifying(true);

    const response = await fetch(`/api/tenant/${tenantSlug}/payments/${payment.referenceCode}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mode === 'hash' ? { transactionHash, mode } : { mode })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to check payment.');
      setIsVerifying(false);
      return;
    }

    setPayment(payload.data);
    setIsVerifying(false);
  }

  const isVerified = payment.status === 'VERIFIED';
  const statusClass = isVerified
    ? 'bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]'
    : payment.status === 'FAILED'
      ? 'bg-[var(--ember-soft)] text-[var(--ember-600)]'
      : 'bg-[color-mix(in_srgb,var(--heat-2)_18%,var(--surface))] text-[#9a6b00]';

  return (
    <div className="payment-checkout">
      <Card>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Payment request</p>
          <span className={`status-pill shrink-0 ${statusClass}`}>{formatStatus(payment.status)}</span>
        </div>
        <h2 className="mt-2 font-display text-[17px] font-bold text-[var(--ink)]">{payment.service.title}</h2>
        <p className="mt-1 text-[13px] font-medium leading-5 text-[var(--muted)]">{payment.service.description}</p>

        <div className="mt-4 rounded-[14px] bg-[var(--surface-2)] p-4">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Amount</p>
          <p className="mt-1 break-words font-display text-[20px] font-bold text-[var(--ink)]">
            {payment.amount} {payment.assetCode}
          </p>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-[14px] border border-[var(--line)] p-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Receipt note</p>
            <p className="mt-0.5 break-all font-mono text-[13px] font-semibold text-[var(--ink)]">{payment.memo}</p>
          </div>
          <button type="button" onClick={() => copyValue('memo', payment.memo)} className="app-icon-btn" aria-label="Copy receipt note">
            {copiedKey === 'memo' ? <FiCheck aria-hidden="true" className="h-5 w-5 text-[#0f806d]" /> : <FiCopy aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-[14px] border border-[var(--line)] p-3.5">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Pay to</p>
            <p className="mt-0.5 break-all font-mono text-xs font-semibold text-[var(--ink)]">{payment.destinationPublicKey}</p>
          </div>
          <button type="button" onClick={() => copyValue('destination', payment.destinationPublicKey)} className="app-icon-btn" aria-label="Copy destination wallet address">
            {copiedKey === 'destination' ? <FiCheck aria-hidden="true" className="h-5 w-5 text-[#0f806d]" /> : <FiCopy aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </Card>

      <div className="grid gap-4">
      <Card>
        <h3 className="font-display text-[17px] font-bold text-[var(--ink)]">Pay with your wallet</h3>
        <p className="mt-1 text-[13px] font-medium leading-5 text-[var(--muted)]">
          Scan or open this payment request in your wallet. Keep the receipt note unchanged so the payment can be matched.
        </p>

        <div className="mt-5 flex justify-center rounded-[16px] border border-[var(--line)] bg-[#fff] p-4">
          <img
            src={`/api/tenant/${tenantSlug}/payments/${payment.referenceCode}/qr`}
            alt="Payment QR code"
            width={200}
            height={200}
            className="h-[200px] w-[200px]"
          />
        </div>

        <div className="mt-4 grid gap-2.5">
          <a href={payment.sep7Uri} className="app-btn btn-primary">
            <FiCreditCard aria-hidden="true" className="h-4 w-4" /> Open wallet payment
          </a>
          <button type="button" onClick={() => copyValue('uri', payment.sep7Uri)} className="app-btn btn-outline">
            {copiedKey === 'uri' ? (
              <>
                <FiCheck aria-hidden="true" className="h-4 w-4 text-[#0f806d]" /> Copied
              </>
            ) : (
              <>
                <FiClipboard aria-hidden="true" className="h-4 w-4" /> Copy payment link
              </>
            )}
          </button>
          <a
            href={`/${tenantSlug}/payments/${payment.referenceCode}/print`}
            target="_blank"
            rel="noreferrer"
            className="app-btn btn-outline"
          >
            <FiPrinter aria-hidden="true" className="h-4 w-4" /> Print QR for posters
          </a>
          <p className="text-xs font-medium leading-5 text-[var(--muted)]">
            Created {formatDate(payment.createdAt)}. CivicTrust prepares the payment; your wallet approves and sends it.
          </p>
        </div>
      </Card>

      {isVerified ? (
        <div className="rounded-[22px] bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] p-5 shadow-sm">
          <p className="text-[15px] font-bold text-[#0f806d]">Payment confirmed</p>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[#0f806d]">
            This receipt now includes a permanent public payment ID.
          </p>
          <div className="mt-4">
            <StellarProof
              transactionHash={payment.transactionHash}
              ledger={payment.ledger}
              network="TESTNET"
            />
          </div>
          <div className="mt-4 grid">
            <a href={`/${tenantSlug}/receipts/${payment.referenceCode}`} className="app-btn btn-primary">
              <FiCheckCircle aria-hidden="true" className="h-4 w-4" /> View public receipt
            </a>
          </div>
        </div>
      ) : (
        <Card>
          <h3 className="font-display text-[17px] font-bold text-[var(--ink)]">Check your payment</h3>
          <p className="mt-1 text-[13px] font-medium leading-5 text-[var(--muted)]">
            Paste the payment ID from your wallet, or let CivicTrust search for the matching receipt note.
          </p>

          <form onSubmit={(event) => verifyPayment(event, 'hash')} className="mt-4">
            <div className="field">
              <label className="input-label" htmlFor="transaction-hash">Payment ID</label>
              <Input
                id="transaction-hash"
                required
                value={transactionHash}
                onChange={(event) => setTransactionHash(event.target.value)}
                placeholder="Paste payment ID"
                className="break-all font-mono text-[13px]"
              />
            </div>

            {payment.failureReason ? (
              <p className="mb-4 rounded-[14px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{payment.failureReason}</p>
            ) : null}
            {error ? (
              <p className="mb-4 rounded-[14px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{error}</p>
            ) : null}

            <div className="grid gap-2.5">
              <Button type="submit" className="btn-block" disabled={isVerifying}>
                <FiCheckCircle aria-hidden="true" className="h-4 w-4" />
                {isVerifying ? 'Checking payment...' : 'Check payment ID'}
              </Button>
              <button
                type="button"
                disabled={isVerifying}
                onClick={() => verifyPayment(undefined, 'scan')}
                className="app-btn btn-outline disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSearch aria-hidden="true" className="h-4 w-4" /> Search by receipt note
              </button>
            </div>
          </form>
        </Card>
      )}
      </div>
    </div>
  );
}
