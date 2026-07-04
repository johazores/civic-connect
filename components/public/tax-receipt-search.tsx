'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiChevronRight, FiFileText, FiSearch } from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
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
  const [hasSearched, setHasSearched] = useState(false);

  async function findReceipts(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const response = await fetch(`/api/tenant/${tenantSlug}/tax-receipts?${params.toString()}`);
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || 'Unable to search tax receipts.');
        return;
      }

      setReceipts(payload.data);
      setHasSearched(true);
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <form onSubmit={findReceipts}>
          <div className="field mb-0">
            <label className="input-label" htmlFor="tax-receipt-search">
              Receipt reference or taxpayer
            </label>
            <div className="relative">
              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]"
              />
              <Input
                id="tax-receipt-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. TAX-2025-000123"
                className="pl-12"
              />
            </div>
          </div>
          <Button disabled={isLoading} className="btn-block mt-4">
            <FiSearch aria-hidden="true" className="h-4 w-4" />
            {isLoading ? 'Searching...' : 'Search receipts'}
          </Button>
        </form>
        {error ? (
          <p className="mt-4 rounded-[var(--radius-sm)] bg-[var(--ember-soft)] p-4 text-sm font-bold text-[var(--ember-600)]">
            {error}
          </p>
        ) : null}
      </Card>

      {isLoading ? (
        <div className="grid gap-3">
          <Card>
            <div className="skeleton-line w-1/3" />
            <div className="skeleton-line mt-3 w-2/3" />
            <div className="skeleton-line mt-3 w-1/2" />
          </Card>
          <Card>
            <div className="skeleton-line w-1/3" />
            <div className="skeleton-line mt-3 w-2/3" />
            <div className="skeleton-line mt-3 w-1/2" />
          </Card>
        </div>
      ) : null}

      {!isLoading && !hasSearched && receipts.length === 0 ? (
        <Card className="p-0">
          <div className="empty">
            <div className="eart">
              <FiFileText aria-hidden="true" className="h-6 w-6" />
            </div>
            <h3>Verify a receipt</h3>
            <p>Search by reference, taxpayer, email, or property index.</p>
          </div>
        </Card>
      ) : null}

      {!isLoading && hasSearched && receipts.length === 0 ? (
        <Card className="p-0">
          <div className="empty">
            <div className="eart">
              <FiSearch aria-hidden="true" className="h-6 w-6" />
            </div>
            <h3>No receipts found</h3>
            <p>Check the reference or try a different search term.</p>
          </div>
        </Card>
      ) : null}

      {!isLoading && receipts.length > 0 ? (
        <>
          <div className="section-head">
            <h2>
              {receipts.length} {receipts.length === 1 ? 'receipt' : 'receipts'} found
            </h2>
          </div>
          <div className="grid gap-3">
            {receipts.map((receipt) => (
              <Link
                key={receipt.id}
                href={`/${tenantSlug}/tax-receipts/${receipt.referenceCode}`}
                className="card card-hover block p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-all font-mono text-[13px] font-bold text-[var(--ink-2)]">
                      {receipt.referenceCode}
                    </p>
                    <h3 className="font-display mt-1 break-words text-[16px] font-bold text-[var(--ink)]">
                      {receipt.taxpayerName}
                    </h3>
                    <p className="mt-1 break-words text-[13px] leading-5 text-[var(--muted)]">
                      {receipt.propertyAddress}
                    </p>
                  </div>
                  <span className="shrink-0">
                    <Badge value={receipt.status} />
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
                  <p className="min-w-0 truncate text-[12px] font-semibold text-[var(--muted)]">
                    FY {receipt.taxYear} &middot; {receipt.amount} {receipt.assetCode} &middot;{' '}
                    {receipt.transactionHash ? 'Public proof' : 'No proof yet'}
                  </p>
                  <FiChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
