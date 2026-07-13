'use client';

import { useMemo, useState } from 'react';
import { FiExternalLink, FiHash, FiLayers } from 'react-icons/fi';
import { formatDate } from '@/lib/format';

type LedgerRow = {
  id: string;
  kind: 'PAYMENT' | 'REWARD' | 'DISBURSEMENT' | 'TAX_RECEIPT';
  kindLabel: string;
  referenceCode: string;
  title: string;
  counterparty: string | null;
  amount: string;
  assetCode: string;
  status: string;
  transactionHash: string | null;
  claimableBalanceId: string | null;
  ledger: number | null;
  proofDigest: string | null;
  occurredAt: string;
  explorerTxUrl: string | null;
  explorerBalanceUrl: string | null;
};

type LedgerData = {
  network: string;
  metrics: {
    totalRecords: number;
    verifiedOnChain: number;
    xlmMoved: string;
    payments: number;
    rewards: number;
    disbursements: number;
    taxReceipts: number;
  };
  rows: LedgerRow[];
};

const FILTERS: Array<{ key: string; label: string }> = [
  { key: 'ALL', label: 'All records' },
  { key: 'PAYMENT', label: 'Payments' },
  { key: 'REWARD', label: 'Rewards' },
  { key: 'DISBURSEMENT', label: 'Disbursements' },
  { key: 'TAX_RECEIPT', label: 'Tax receipts' }
];

function getFilters(isGovernment: boolean) {
  return isGovernment ? FILTERS : FILTERS.filter((filter) => filter.key !== 'TAX_RECEIPT');
}

const kindTone: Record<string, string> = {
  PAYMENT: 'bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]',
  REWARD: 'bg-[color-mix(in_srgb,var(--heat-1)_16%,var(--surface))] text-[#0f806d]',
  DISBURSEMENT: 'bg-[color-mix(in_srgb,var(--heat-3)_18%,var(--surface))] text-[#a45a13]',
  TAX_RECEIPT: 'bg-[color-mix(in_srgb,var(--heat-0)_14%,var(--surface))] text-[var(--heat-0)]'
};

export function LedgerExplorer({ ledger, isGovernment = true }: { ledger: LedgerData | null; isGovernment?: boolean }) {
  const [filter, setFilter] = useState('ALL');
  const filters = getFilters(isGovernment);

  const rows = useMemo(() => {
    if (!ledger) return [];
    return filter === 'ALL' ? ledger.rows : ledger.rows.filter((row) => row.kind === filter);
  }, [ledger, filter]);

  if (!ledger) {
    return (
      <div className="empty">
        <div className="eart">
          <FiLayers aria-hidden="true" className="h-8 w-8" />
        </div>
        <h3>Public records unavailable</h3>
        <p>The public records could not be loaded right now.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="app-pulse-card fade-up p-5">
        <div className="relative z-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#9fc0e6]">Public civic records</p>
          <p className="mt-2 text-[13px] font-medium leading-6 text-[#b9d0ea]">
            Every payment, reward, disbursement, and tax receipt below has a public proof that anyone can check.
          </p>
          <div className="mt-4 flex gap-5 border-t border-white/15 pt-4">
            <Metric value={String(ledger.metrics.totalRecords)} label="Records" />
            <Metric value={String(ledger.metrics.verifiedOnChain)} label="With proof" />
            <Metric value={ledger.metrics.xlmMoved} label="Total paid" />
          </div>
        </div>
      </div>

      <div className="stat-grid mt-4">
        <MiniStat value={ledger.metrics.payments} label="Service payments" />
        <MiniStat value={ledger.metrics.rewards} label="Civic rewards" />
        <MiniStat value={ledger.metrics.disbursements} label="Disbursements" />
        <MiniStat value={ledger.metrics.taxReceipts} label="Tax receipts" />
      </div>

      <div className="hscroll mt-4" style={{ padding: '2px 0' }}>
        {filters.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`chip ${filter === item.key ? 'on' : ''}`.trim()}
          >
            {item.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="empty">
          <div className="eart">
            <FiHash aria-hidden="true" className="h-8 w-8" />
          </div>
          <h3>No records yet</h3>
          <p>Public civic records will appear here as they are created.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {rows.map((row) => (
            <article key={`${row.kind}-${row.id}`} className="card">
              <div className="flex items-start justify-between gap-3">
                <span className={`status-pill ${kindTone[row.kind] || 'bg-[var(--surface-2)] text-[var(--ink-2)]'}`}>{row.kindLabel}</span>
                <p className="shrink-0 font-display text-[15px] font-bold text-[var(--ink)]">
                  {row.amount} <span className="text-[var(--muted)]">{row.assetCode}</span>
                </p>
              </div>

              <h3 className="mt-2 break-words font-display text-[15px] font-bold text-[var(--ink)]">{row.title}</h3>
              <p className="mt-0.5 break-words text-[13px] font-medium text-[var(--muted)]">
                {row.counterparty ? `${row.counterparty} · ` : ''}
                {formatDate(row.occurredAt)}
              </p>

              <p className="mt-3 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Reference</p>
              <p className="break-all font-mono text-[12px] font-semibold text-[var(--ink-2)]">{row.referenceCode}</p>

              {row.transactionHash ? (
                <>
                  <p className="mt-2 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Payment ID</p>
                  <p className="break-all font-mono text-[12px] font-semibold text-[var(--ink)]">{row.transactionHash}</p>
                </>
              ) : null}

              {row.explorerTxUrl || row.explorerBalanceUrl ? (
                <div className="mt-3 grid gap-2">
                  {row.explorerTxUrl ? (
                    <a href={row.explorerTxUrl} target="_blank" rel="noreferrer" className="app-btn btn-outline btn-compact">
                      <FiExternalLink aria-hidden="true" className="h-4 w-4" /> Open public proof
                    </a>
                  ) : null}
                  {row.explorerBalanceUrl ? (
                    <a href={row.explorerBalanceUrl} target="_blank" rel="noreferrer" className="app-btn btn-outline btn-compact">
                      <FiExternalLink aria-hidden="true" className="h-4 w-4" /> Open claim record
                    </a>
                  ) : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <b className="block truncate font-display text-[17px] font-bold text-white">{value}</b>
      <span className="text-[11px] font-semibold text-[#9fc0e6]">{label}</span>
    </div>
  );
}

function MiniStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="app-stat">
      <p className="app-stat-value tabular-nums">{value}</p>
      <p className="app-stat-label">{label}</p>
    </div>
  );
}
