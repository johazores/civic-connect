'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Receipt = {
  id: string;
  referenceCode: string;
  taxpayerName: string;
  propertyIndexNumber: string;
  propertyAddress: string;
  taxYear: number;
  amount: string;
  assetCode: string;
  status: string;
  transactionHash: string | null;
};

export function TaxReceiptSearch({ tenantSlug }: { tenantSlug: string }) {
  const [search, setSearch] = useState('');
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function findReceipts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    const response = await fetch(`/api/tenant/${tenantSlug}/tax-receipts?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to search tax receipts.');
      setIsLoading(false);
      return;
    }

    setReceipts(payload.data);
    setIsLoading(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <p className="section-eyebrow">Digital tax receipts</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 md:text-5xl">Verify property tax records.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">Search by receipt reference, taxpayer name, email, or property index number. Stellar-backed receipts include the permanent transaction hash.</p>
        <form onSubmit={findReceipts} className="mt-6 grid gap-3">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="TAX reference, taxpayer, property index" />
          <Button disabled={isLoading}>{isLoading ? 'Searching...' : 'Search receipts'}</Button>
        </form>
        {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}
      </Card>
      <div className="grid gap-4">
        {!isLoading && receipts.length === 0 ? <Card><p className="text-sm text-slate-500">Enter a receipt reference or property identifier to verify a receipt.</p></Card> : null}
        {receipts.map((receipt) => (
          <Card key={receipt.id} className="card-hover">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{receipt.referenceCode}</p>
                <h2 className="mt-2 text-xl font-extrabold text-slate-950">{receipt.taxpayerName}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{receipt.propertyAddress}</p>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">{receipt.status}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Info label="Tax year" value={String(receipt.taxYear)} />
              <Info label="Amount" value={`${receipt.amount} ${receipt.assetCode}`} />
              <Info label="Stellar proof" value={receipt.transactionHash ? 'Available' : 'Not linked'} />
            </div>
            <Link href={`/${tenantSlug}/tax-receipts/${receipt.referenceCode}`} className="mt-4 inline-flex rounded-xl px-4 py-2 text-sm font-extrabold btn-primary">Open receipt</Link>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 font-extrabold text-slate-950">{value}</p></div>;
}
