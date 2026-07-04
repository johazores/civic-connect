'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { FiAward, FiExternalLink, FiFileText, FiHash, FiPlus, FiRefreshCw, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';
import { formatDate } from '@/lib/format';
import { stellarExpertTxUrl } from '@/lib/stellar/explorer';

type PayoutMethod = 'DIRECT' | 'CLAIMABLE';

type ApprovalSummary = {
  enabled: boolean;
  signerCount: number;
  requiredApprovals: number;
  approvalCount: number;
  remainingApprovals: number;
  approvedByCurrentUser: boolean;
  approvers: Array<{ name: string; email: string; approvedAt: string }>;
};

type CivicAction = {
  id: string;
  type: string;
  title: string;
  description: string;
  locationText: string;
  participantName: string;
  participantEmail: string | null;
  rewardDestinationPublicKey: string | null;
  rewardAmount: string;
  rewardAssetCode: string;
  rewardAssetIssuer: string | null;
  rewardMemo: string | null;
  status: string;
  verificationNote: string | null;
  rewardTransactionHash: string | null;
  rewardPaidAt: string | null;
  proofDigest: string | null;
  payoutMethod: PayoutMethod;
  rewardClaimableBalanceId: string | null;
  approvalSummary?: ApprovalSummary;
  createdAt: string;
};

type TransparencyEntry = {
  id: string;
  referenceCode: string;
  entryType: string;
  status: string;
  title: string;
  description: string;
  department: string | null;
  recipientName: string | null;
  recipientPublicKey: string | null;
  amount: string;
  assetCode: string;
  assetIssuer: string | null;
  memo: string | null;
  transactionHash: string | null;
  ledger: number | null;
  approvalSummary?: ApprovalSummary;
  occurredAt: string;
};

type TaxReceipt = {
  id: string;
  referenceCode: string;
  taxpayerName: string;
  taxpayerEmail: string | null;
  propertyIndexNumber: string;
  propertyAddress: string;
  taxYear: number;
  amount: string;
  assetCode: string;
  assetIssuer: string | null;
  transactionHash: string | null;
  ledger: number | null;
  status: string;
  issuedAt: string;
};

const actionStatuses = ['ALL', 'SUBMITTED', 'REVIEWING', 'APPROVED', 'REJECTED', 'REWARDED'];
const actionTypes = ['ALL', 'PARTICIPATION', 'CLEANUP'];
const entryTypes = ['BUDGET_ALLOCATION', 'PUBLIC_DISBURSEMENT', 'PROCUREMENT', 'GRANT', 'OPERATING_EXPENSE'];
const entryStatuses = ['DRAFT', 'PUBLISHED', 'VERIFIED_ON_STELLAR', 'ARCHIVED'];

function nice(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function shortHash(hash: string) {
  return hash.length > 14 ? `${hash.slice(0, 6)}…${hash.slice(-6)}` : hash;
}

function approvalSuccess(summary?: ApprovalSummary) {
  if (!summary?.enabled) {
    return 'Approval saved.';
  }

  if (summary.remainingApprovals <= 0) {
    return 'Enough approvals collected. Releasing funds now.';
  }

  return `Approval saved. ${summary.remainingApprovals} more needed before funds are released.`;
}

function ApprovalProgress({ summary }: { summary?: ApprovalSummary }) {
  if (!summary?.enabled) {
    return null;
  }

  return (
    <div className="mt-4 rounded-[16px] border border-[var(--line)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-[var(--ink)]">{summary.approvalCount} of {summary.requiredApprovals} approved</p>
        <span className="status-pill whitespace-nowrap bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]">
          {summary.remainingApprovals === 0 ? 'Ready' : `${summary.remainingApprovals} left`}
        </span>
      </div>
      <p className="mt-1 text-xs font-medium leading-5 text-[var(--muted)]">
        {summary.remainingApprovals === 0 ? 'The required staff approvals are complete.' : 'Money stays in the LGU wallet until enough staff approve.'}
      </p>
      {summary.approvers.length ? (
        <div className="mt-3 grid gap-1.5">
          {summary.approvers.map((approver) => (
            <p key={`${approver.email}-${approver.approvedAt}`} className="truncate text-xs font-semibold text-[var(--ink-2)]">
              {approver.name} approved {formatDate(approver.approvedAt)}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function programPill(status: string) {
  if (status === 'REWARDED' || status === 'VERIFIED_ON_STELLAR' || status === 'ISSUED') {
    return 'status-pill whitespace-nowrap bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]';
  }
  if (status === 'REJECTED' || status === 'VOIDED' || status === 'ARCHIVED') {
    return 'status-pill whitespace-nowrap bg-[var(--ember-soft)] text-[var(--ember-600)]';
  }
  if (status === 'APPROVED' || status === 'PUBLISHED') {
    return 'status-pill whitespace-nowrap bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]';
  }
  return 'status-pill whitespace-nowrap bg-[color-mix(in_srgb,var(--heat-2)_18%,var(--surface))] text-[#9a6b00]';
}

function programNic(status: string) {
  if (status === 'REWARDED' || status === 'VERIFIED_ON_STELLAR' || status === 'ISSUED') return 'nic nic-teal';
  if (status === 'REJECTED' || status === 'VOIDED' || status === 'ARCHIVED') return 'nic nic-ember';
  return 'nic nic-navy';
}

function createEmptyTransparency(): Record<string, string> {
  return {
    title: '',
    description: '',
    entryType: 'PUBLIC_DISBURSEMENT',
    status: 'PUBLISHED',
    department: '',
    recipientName: '',
    recipientPublicKey: '',
    amount: '0',
    assetCode: 'XLM',
    assetIssuer: '',
    memo: '',
    transactionHash: '',
    occurredAt: new Date().toISOString().slice(0, 10)
  };
}

function createEmptyTaxReceipt(): Record<string, string> {
  return {
    taxpayerName: '',
    taxpayerEmail: '',
    propertyIndexNumber: '',
    propertyAddress: '',
    taxYear: String(new Date().getFullYear()),
    amount: '0',
    assetCode: 'XLM',
    assetIssuer: '',
    transactionHash: '',
    ledger: '',
    status: 'ISSUED',
    issuedAt: new Date().toISOString().slice(0, 10)
  };
}

/* In-frame bottom sheet helpers (absolute inside .civic-app-frame — never fixed) */

const SHEET_CLOSE_MS = 320;

function useSheet() {
  const [state, setState] = useState<'closed' | 'open' | 'closing'>('closed');
  const timer = useRef<number | undefined>(undefined);

  const open = useCallback(() => {
    window.clearTimeout(timer.current);
    setState('open');
  }, []);

  const close = useCallback(() => {
    setState('closing');
    timer.current = window.setTimeout(() => setState('closed'), SHEET_CLOSE_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return {
    isOpen: state !== 'closed',
    anim: state === 'closing' ? 'out' : 'in',
    open,
    close
  };
}

function BottomSheet({
  title,
  sub,
  anim,
  onClose,
  children
}: {
  title: string;
  sub?: string;
  anim: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <button type="button" className={`sheet-backdrop backdrop-${anim}`} onClick={onClose} aria-label="Close" tabIndex={-1} />
      <div className={`sheet sheet-${anim}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="min-w-0">
            <h2 className="truncate">{title}</h2>
            {sub ? <p className="sheet-sub truncate">{sub}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="app-icon-btn" aria-label="Close">
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="sheet-scroll">{children}</div>
      </div>
    </>
  );
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return <p className="rounded-[14px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{message}</p>;
}

function SuccessBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-[14px] bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] p-4 text-sm font-semibold leading-5 text-[#0f806d]">
      {message}
    </p>
  );
}

export function StellarProgramsDashboard({ tenantSlug }: { tenantSlug: string }) {
  const [activeProgram, setActiveProgram] = useState<'actions' | 'transparency' | 'tax'>('actions');
  const [actions, setActions] = useState<CivicAction[]>([]);
  const [transparencyEntries, setTransparencyEntries] = useState<TransparencyEntry[]>([]);
  const [taxReceipts, setTaxReceipts] = useState<TaxReceipt[]>([]);
  const [actionFilter, setActionFilter] = useState({ status: 'ALL', type: 'ALL' });
  const [transparencyForm, setTransparencyForm] = useState(createEmptyTransparency());
  const [taxForm, setTaxForm] = useState(createEmptyTaxReceipt());
  const [editingTransparencyId, setEditingTransparencyId] = useState('');
  const [editingTaxId, setEditingTaxId] = useState('');
  const [selectedActionId, setSelectedActionId] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>('DIRECT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const actionSheet = useSheet();
  const transparencySheet = useSheet();
  const taxSheet = useSheet();

  const selectedAction = actions.find((item) => item.id === selectedActionId) || null;
  const editingTransparencyEntry = transparencyEntries.find((item) => item.id === editingTransparencyId) || null;
  const editingTaxReceipt = taxReceipts.find((item) => item.id === editingTaxId) || null;

  async function loadAll(nextActionFilter = actionFilter) {
    setIsLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (nextActionFilter.status !== 'ALL') params.set('status', nextActionFilter.status);
    if (nextActionFilter.type !== 'ALL') params.set('type', nextActionFilter.type);

    const [actionsResponse, transparencyResponse, taxResponse] = await Promise.all([
      fetch(`/api/tenant/${tenantSlug}/civic-actions?${params.toString()}`),
      fetch(`/api/tenant/${tenantSlug}/transparency?includeDrafts=true`),
      fetch(`/api/tenant/${tenantSlug}/tax-receipts?includeVoided=true`)
    ]);

    const [actionsPayload, transparencyPayload, taxPayload] = await Promise.all([
      actionsResponse.json(),
      transparencyResponse.json(),
      taxResponse.json()
    ]);

    if (!actionsResponse.ok || !transparencyResponse.ok || !taxResponse.ok) {
      setError(actionsPayload.error || transparencyPayload.error || taxPayload.error || 'Unable to load civic programs.');
      setIsLoading(false);
      return;
    }

    setActions(actionsPayload.data);
    setTransparencyEntries(transparencyPayload.data);
    setTaxReceipts(taxPayload.data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeActionFilter(name: 'status' | 'type', value: string) {
    const next = { ...actionFilter, [name]: value };
    setActionFilter(next);
    loadAll(next);
  }

  async function updateAction(action: CivicAction, status: string) {
    setError('');
    setSuccess('');
    const response = await fetch(`/api/tenant/${tenantSlug}/civic-actions/${action.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        verificationNote: action.verificationNote || '',
        rewardAmount: action.rewardAmount,
        rewardAssetCode: action.rewardAssetCode,
        rewardAssetIssuer: action.rewardAssetIssuer || '',
        rewardDestinationPublicKey: action.rewardDestinationPublicKey || '',
        payoutMethod
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to update civic action.');
      return;
    }

    setSuccess('Civic action updated.');
    await loadAll();
  }

  async function payReward(action: CivicAction) {
    setError('');
    setSuccess('');
    const response = await fetch(`/api/tenant/${tenantSlug}/civic-actions/${action.id}`, { method: 'POST' });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to send reward.');
      return;
    }

    setSuccess(
      payload.data.rewardTransactionHash
        ? `Reward sent · ${shortHash(String(payload.data.rewardTransactionHash || ''))}`
        : approvalSuccess(payload.data.approvalSummary)
    );
    await loadAll();
  }

  function patchAction(id: string, name: keyof CivicAction, value: string) {
    setActions((items) => items.map((item) => (item.id === id ? { ...item, [name]: value } : item)));
  }

  function editTransparency(entry: TransparencyEntry) {
    setEditingTransparencyId(entry.id);
    setTransparencyForm({
      title: entry.title,
      description: entry.description,
      entryType: entry.entryType,
      status: entry.status,
      department: entry.department || '',
      recipientName: entry.recipientName || '',
      recipientPublicKey: entry.recipientPublicKey || '',
      amount: entry.amount,
      assetCode: entry.assetCode,
      assetIssuer: entry.assetIssuer || '',
      memo: entry.memo || '',
      transactionHash: entry.transactionHash || '',
      occurredAt: entry.occurredAt.slice(0, 10)
    });
  }

  function openTransparencyCreate() {
    setEditingTransparencyId('');
    setTransparencyForm(createEmptyTransparency());
    transparencySheet.open();
  }

  function openTransparencyEdit(entry: TransparencyEntry) {
    editTransparency(entry);
    transparencySheet.open();
  }

  async function saveTransparency(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const response = await fetch(`/api/tenant/${tenantSlug}/transparency${editingTransparencyId ? `/${editingTransparencyId}` : ''}`, {
      method: editingTransparencyId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transparencyForm)
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to save transparency entry.');
      return;
    }

    setSuccess('Transparency entry saved.');
    setEditingTransparencyId('');
    setTransparencyForm(createEmptyTransparency());
    transparencySheet.close();
    await loadAll();
  }

  async function sendTransparencyDisbursement(entry: TransparencyEntry) {
    setError('');
    setSuccess('');
    const response = await fetch(`/api/tenant/${tenantSlug}/transparency/${entry.id}`, { method: 'POST' });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to send transparency disbursement.');
      return;
    }

    setSuccess(
      payload.data.transactionHash
        ? `Disbursement sent - ${shortHash(String(payload.data.transactionHash || ''))}`
        : approvalSuccess(payload.data.approvalSummary)
    );
    await loadAll();
  }

  async function archiveTransparency(entry: TransparencyEntry) {
    const response = await fetch(`/api/tenant/${tenantSlug}/transparency/${entry.id}`, { method: 'DELETE' });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to archive transparency entry.');
      return;
    }

    setSuccess('Transparency entry archived.');
    transparencySheet.close();
    await loadAll();
  }

  function editTax(receipt: TaxReceipt) {
    setEditingTaxId(receipt.id);
    setTaxForm({
      taxpayerName: receipt.taxpayerName,
      taxpayerEmail: receipt.taxpayerEmail || '',
      propertyIndexNumber: receipt.propertyIndexNumber,
      propertyAddress: receipt.propertyAddress,
      taxYear: String(receipt.taxYear),
      amount: receipt.amount,
      assetCode: receipt.assetCode,
      assetIssuer: receipt.assetIssuer || '',
      transactionHash: receipt.transactionHash || '',
      ledger: receipt.ledger ? String(receipt.ledger) : '',
      status: receipt.status,
      issuedAt: receipt.issuedAt.slice(0, 10)
    });
  }

  function openTaxCreate() {
    setEditingTaxId('');
    setTaxForm(createEmptyTaxReceipt());
    taxSheet.open();
  }

  function openTaxEdit(receipt: TaxReceipt) {
    editTax(receipt);
    taxSheet.open();
  }

  async function saveTaxReceipt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const response = await fetch(`/api/tenant/${tenantSlug}/tax-receipts${editingTaxId ? `/${editingTaxId}` : ''}`, {
      method: editingTaxId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taxForm)
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to save property tax receipt.');
      return;
    }

    setSuccess('Property tax receipt saved.');
    setEditingTaxId('');
    setTaxForm(createEmptyTaxReceipt());
    taxSheet.close();
    await loadAll();
  }

  async function voidTaxReceipt(receipt: TaxReceipt) {
    const response = await fetch(`/api/tenant/${tenantSlug}/tax-receipts/${receipt.id}`, { method: 'DELETE' });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to void tax receipt.');
      return;
    }

    setSuccess('Property tax receipt voided.');
    taxSheet.close();
    await loadAll();
  }

  const approvedActions = actions.filter((item) => item.status === 'APPROVED').length;
  const verifiedTransparency = transparencyEntries.filter((item) => item.transactionHash).length;
  const stellarTaxReceipts = taxReceipts.filter((item) => item.transactionHash).length;

  return (
    <section>
      <div className="section-head !mt-0">
        <h2>Civic programs</h2>
        <button type="button" onClick={() => loadAll()} className="flex min-h-[44px] shrink-0 items-center gap-1.5 px-2 text-[13px] font-bold text-[var(--ember)]">
          <FiRefreshCw aria-hidden="true" className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="stat-grid">
        <StatCard label="Submitted actions" value={actions.length} />
        <StatCard label="Approved rewards" value={approvedActions} />
        <StatCard label="Public records" value={verifiedTransparency} />
        <StatCard label="Tax receipts" value={stellarTaxReceipts} />
      </div>

      <div className="seg mt-4">
        {(
          [
            ['actions', 'Rewards'],
            ['transparency', 'Public records'],
            ['tax', 'Receipts']
          ] as Array<['actions' | 'transparency' | 'tax', string]>
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveProgram(key)}
            className={activeProgram === key ? 'on' : ''}
            aria-pressed={activeProgram === key}
          >
            {label}
          </button>
        ))}
      </div>

      {error || success ? (
        <div className="mt-4 grid gap-3">
          <ErrorBanner message={error} />
          <SuccessBanner message={success} />
        </div>
      ) : null}

      {activeProgram === 'actions' ? (
        <div className="mt-4">
          <div className="hscroll -mx-5">
            {actionStatuses.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => changeActionFilter('status', status)}
                className={`chip ${actionFilter.status === status ? 'on' : ''}`.trim()}
              >
                {nice(status)}
              </button>
            ))}
          </div>
          <div className="hscroll -mx-5 mt-2.5">
            {actionTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => changeActionFilter('type', type)}
                className={`chip ${actionFilter.type === type ? 'on' : ''}`.trim()}
              >
                {nice(type)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="mt-4 grid gap-2.5">
              <div className="skeleton-line w-3/4" />
              <div className="skeleton-line" />
              <div className="skeleton-line w-1/2" />
            </div>
          ) : null}

          {!isLoading && actions.length === 0 ? (
            <div className="empty">
              <div className="eart">
                <FiAward aria-hidden="true" className="h-9 w-9" />
              </div>
              <h3>No civic actions</h3>
              <p>No actions match the current filters.</p>
            </div>
          ) : null}

          <div className="mt-4">
            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => {
                  setSelectedActionId(action.id);
                  setPayoutMethod(action.payoutMethod === 'CLAIMABLE' ? 'CLAIMABLE' : 'DIRECT');
                  actionSheet.open();
                }}
                className="notif w-full text-left"
              >
                <span className={programNic(action.status)}>
                  <FiAward aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="nbody">
                  <span className="flex items-center justify-between gap-2">
                    <b className="min-w-0 truncate">{action.title}</b>
                    <span className={programPill(action.status)}>{nice(action.status)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] font-medium text-[var(--ink-2)]">
                    {action.participantName} · {action.locationText}
                  </span>
                  <span className="nt block">
                    {nice(action.type)} · {formatDate(action.createdAt)}
                  </span>
                  {action.approvalSummary?.enabled && !action.rewardTransactionHash ? (
                    <span className="nt block">
                      Release approvals: {action.approvalSummary.approvalCount}/{action.approvalSummary.requiredApprovals}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeProgram === 'transparency' ? (
        <div className="mt-4">
          <Button type="button" onClick={openTransparencyCreate} className="btn-block">
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Create record
          </Button>

          {isLoading ? (
            <div className="mt-4 grid gap-2.5">
              <div className="skeleton-line w-3/4" />
              <div className="skeleton-line" />
              <div className="skeleton-line w-1/2" />
            </div>
          ) : null}

          {!isLoading && transparencyEntries.length === 0 ? (
            <div className="empty">
              <div className="eart">
                <FiHash aria-hidden="true" className="h-9 w-9" />
              </div>
              <h3>No public records</h3>
              <p>Create the first public transparency record.</p>
            </div>
          ) : null}

          <div className="mt-4">
            {transparencyEntries.map((entry) => (
              <button key={entry.id} type="button" onClick={() => openTransparencyEdit(entry)} className="notif w-full text-left">
                <span className={programNic(entry.status)}>
                  <FiHash aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="nbody">
                  <span className="flex items-center justify-between gap-2">
                    <b className="min-w-0 truncate">{entry.title}</b>
                    <span className={programPill(entry.status)}>{nice(entry.status)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] font-medium text-[var(--ink-2)]">{entry.referenceCode}</span>
                  <span className="nt block">
                    {entry.amount} {entry.assetCode} · {formatDate(entry.occurredAt)}
                  </span>
                  {entry.approvalSummary?.enabled && !entry.transactionHash ? (
                    <span className="nt block">
                      Release approvals: {entry.approvalSummary.approvalCount}/{entry.approvalSummary.requiredApprovals}
                    </span>
                  ) : null}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {activeProgram === 'tax' ? (
        <div className="mt-4">
          <Button type="button" onClick={openTaxCreate} className="btn-block">
            <FiPlus aria-hidden="true" className="h-4 w-4" />
            Issue receipt
          </Button>

          {isLoading ? (
            <div className="mt-4 grid gap-2.5">
              <div className="skeleton-line w-3/4" />
              <div className="skeleton-line" />
              <div className="skeleton-line w-1/2" />
            </div>
          ) : null}

          {!isLoading && taxReceipts.length === 0 ? (
            <div className="empty">
              <div className="eart">
                <FiFileText aria-hidden="true" className="h-9 w-9" />
              </div>
              <h3>No tax receipts</h3>
              <p>Issue the first property tax receipt record.</p>
            </div>
          ) : null}

          <div className="mt-4">
            {taxReceipts.map((receipt) => (
              <button key={receipt.id} type="button" onClick={() => openTaxEdit(receipt)} className="notif w-full text-left">
                <span className={programNic(receipt.status)}>
                  <FiFileText aria-hidden="true" className="h-5 w-5" />
                </span>
                <span className="nbody">
                  <span className="flex items-center justify-between gap-2">
                    <b className="min-w-0 truncate">{receipt.taxpayerName}</b>
                    <span className={programPill(receipt.status)}>{nice(receipt.status)}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[13px] font-medium text-[var(--ink-2)]">{receipt.propertyAddress}</span>
                  <span className="nt block">
                    PIN {receipt.propertyIndexNumber} · {receipt.taxYear} · {receipt.amount} {receipt.assetCode}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {actionSheet.isOpen && selectedAction ? (
        <BottomSheet
          title={selectedAction.title}
          sub={`${nice(selectedAction.type)} · ${selectedAction.participantName}`}
          anim={actionSheet.anim}
          onClose={actionSheet.close}
        >
          <span className={programPill(selectedAction.status)}>{nice(selectedAction.status)}</span>

          <p className="mt-3 text-sm font-medium leading-6 text-[var(--ink-2)]">{selectedAction.description}</p>
          <p className="mt-2 break-words text-[13px] font-semibold text-[var(--muted)]">
            {selectedAction.participantName}
            {selectedAction.participantEmail ? ` · ${selectedAction.participantEmail}` : ''} · {selectedAction.locationText}
          </p>

          {error || success ? (
            <div className="mt-4 grid gap-3">
              <ErrorBanner message={error} />
              <SuccessBanner message={success} />
            </div>
          ) : null}

          <ApprovalProgress summary={selectedAction.approvalSummary} />

          {selectedAction.rewardTransactionHash || selectedAction.rewardClaimableBalanceId || selectedAction.proofDigest ? (
            <div className="mt-4 rounded-[16px] bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] p-4">
              {selectedAction.rewardTransactionHash ? (
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#0f806d]">Reward payment ID</p>
                  <p className="mt-2 break-all font-mono text-xs font-semibold leading-5 text-[#0f806d]">{selectedAction.rewardTransactionHash}</p>
                </div>
              ) : null}

              {selectedAction.rewardClaimableBalanceId ? (
                <div className="mt-3 min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#0f806d]">Claim code</p>
                  <p className="mt-2 break-all font-mono text-xs font-semibold leading-5 text-[#0f806d]">{selectedAction.rewardClaimableBalanceId}</p>
                </div>
              ) : null}

              {selectedAction.proofDigest ? (
                <div className="mt-3 min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#0f806d]">Record check code</p>
                  <p className="mt-2 break-all font-mono text-xs font-semibold leading-5 text-[#0f806d]">{selectedAction.proofDigest}</p>
                </div>
              ) : null}

              {stellarExpertTxUrl(selectedAction.rewardTransactionHash, 'TESTNET') ? (
                <a
                  href={stellarExpertTxUrl(selectedAction.rewardTransactionHash, 'TESTNET') || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="app-btn btn-outline btn-compact mt-3"
                >
                  <FiExternalLink aria-hidden="true" className="h-4 w-4" />
                  Open public proof
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="mt-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label className="input-label" htmlFor="action-reward-amount">Reward amount</label>
                <Input
                  id="action-reward-amount"
                  value={selectedAction.rewardAmount}
                  onChange={(event) => patchAction(selectedAction.id, 'rewardAmount', event.target.value)}
                />
              </div>
              <div className="field">
                <label className="input-label" htmlFor="action-reward-asset">Currency code</label>
                <Input
                  id="action-reward-asset"
                  value={selectedAction.rewardAssetCode}
                  onChange={(event) => patchAction(selectedAction.id, 'rewardAssetCode', event.target.value)}
                />
              </div>
            </div>
            <div className="field">
              <label className="input-label" htmlFor="action-reward-issuer">Token issuer address</label>
              <Input
                id="action-reward-issuer"
                value={selectedAction.rewardAssetIssuer || ''}
                onChange={(event) => patchAction(selectedAction.id, 'rewardAssetIssuer', event.target.value)}
                placeholder="Required for non-XLM assets"
              />
              <p className="mt-2 text-xs font-medium leading-4 text-[var(--muted)]">Needed for USDC or another token.</p>
            </div>
            <div className="field">
              <label className="input-label" htmlFor="action-reward-wallet">Reward wallet</label>
              <Input
                id="action-reward-wallet"
                value={selectedAction.rewardDestinationPublicKey || ''}
                onChange={(event) => patchAction(selectedAction.id, 'rewardDestinationPublicKey', event.target.value)}
                placeholder="Participant G... address"
              />
            </div>
            <div className="field">
              <span className="input-label">Payout method</span>
              <div className="seg mt-1">
                {(
                  [
                    ['DIRECT', 'Direct payment'],
                    ['CLAIMABLE', 'Reserved reward']
                  ] as Array<[PayoutMethod, string]>
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPayoutMethod(key)}
                    className={payoutMethod === key ? 'on' : ''}
                    aria-pressed={payoutMethod === key}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs font-medium leading-4 text-[var(--muted)]">
                Reward is reserved until the citizen claims it. Good when they are still setting up a wallet.
              </p>
            </div>
            <div className="field">
              <label className="input-label" htmlFor="action-review-note">Verification note</label>
              <Textarea
                id="action-review-note"
                value={selectedAction.verificationNote || ''}
                onChange={(event) => patchAction(selectedAction.id, 'verificationNote', event.target.value)}
                placeholder="Review note"
              />
            </div>
          </div>

          <div className="grid gap-2.5 pb-2">
            <Button type="button" onClick={() => updateAction(selectedAction, 'APPROVED')}>
              Approve
            </Button>
            <button type="button" onClick={() => updateAction(selectedAction, 'REJECTED')} className="app-btn btn-outline text-[var(--ember-600)]">
              Reject
            </button>
            <button
              type="button"
              disabled={
                selectedAction.status !== 'APPROVED' ||
                Boolean(selectedAction.approvalSummary?.enabled && selectedAction.approvalSummary.approvedByCurrentUser && selectedAction.approvalSummary.remainingApprovals > 0)
              }
              onClick={() => payReward(selectedAction)}
              className="app-btn btn-accent disabled:opacity-50"
            >
              {selectedAction.approvalSummary?.enabled && !selectedAction.rewardTransactionHash
                ? selectedAction.approvalSummary.approvedByCurrentUser && selectedAction.approvalSummary.remainingApprovals > 0
                  ? 'Approved by you'
                  : 'Approve release'
                : 'Send reward'}
            </button>
          </div>
        </BottomSheet>
      ) : null}

      {transparencySheet.isOpen ? (
        <BottomSheet
          title={editingTransparencyId ? 'Edit record' : 'Create record'}
          sub="Public spending record"
          anim={transparencySheet.anim}
          onClose={transparencySheet.close}
        >
          {error || success ? (
            <div className="mb-4 grid gap-3">
              <ErrorBanner message={error} />
              <SuccessBanner message={success} />
            </div>
          ) : null}

          <form onSubmit={saveTransparency}>
            <div className="field">
              <label className="input-label" htmlFor="ledger-title">Title</label>
              <Input
                id="ledger-title"
                required
                value={transparencyForm.title}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, title: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="ledger-description">Description</label>
              <Textarea
                id="ledger-description"
                required
                value={transparencyForm.description}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, description: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="ledger-entry-type">Entry type</label>
              <Select
                id="ledger-entry-type"
                value={transparencyForm.entryType}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, entryType: event.target.value })}
              >
                {entryTypes.map((type) => (
                  <option key={type} value={type}>{nice(type)}</option>
                ))}
              </Select>
            </div>
            <div className="field">
              <label className="input-label" htmlFor="ledger-status">Status</label>
              <Select
                id="ledger-status"
                value={transparencyForm.status}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, status: event.target.value })}
              >
                {entryStatuses.map((status) => (
                  <option key={status} value={status}>{nice(status)}</option>
                ))}
              </Select>
            </div>
            <div className="field">
              <label className="input-label" htmlFor="ledger-department">Department</label>
              <Input
                id="ledger-department"
                value={transparencyForm.department}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, department: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="ledger-recipient">Recipient name</label>
              <Input
                id="ledger-recipient"
                value={transparencyForm.recipientName}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, recipientName: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="ledger-recipient-key">Recipient wallet address</label>
              <Input
                id="ledger-recipient-key"
                value={transparencyForm.recipientPublicKey}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, recipientPublicKey: event.target.value })}
                placeholder="G... address"
              />
              <p className="mt-2 text-xs font-medium leading-4 text-[var(--muted)]">Used for this payment.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label className="input-label" htmlFor="ledger-amount">Amount</label>
                <Input
                  id="ledger-amount"
                  value={transparencyForm.amount}
                  onChange={(event) => setTransparencyForm({ ...transparencyForm, amount: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="input-label" htmlFor="ledger-asset">Currency code</label>
                <Input
                  id="ledger-asset"
                  value={transparencyForm.assetCode}
                  onChange={(event) => setTransparencyForm({ ...transparencyForm, assetCode: event.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label className="input-label" htmlFor="ledger-issuer">Token issuer address</label>
              <Input
                id="ledger-issuer"
                value={transparencyForm.assetIssuer}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, assetIssuer: event.target.value })}
                placeholder="For non-XLM assets"
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="ledger-hash">Payment ID</label>
              <Input
                id="ledger-hash"
                value={transparencyForm.transactionHash}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, transactionHash: event.target.value })}
                placeholder="Optional payment ID"
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="ledger-date">Occurred on</label>
              <Input
                id="ledger-date"
                type="date"
                value={transparencyForm.occurredAt}
                onChange={(event) => setTransparencyForm({ ...transparencyForm, occurredAt: event.target.value })}
              />
            </div>

            {editingTransparencyEntry?.transactionHash ? (
              <div className="mb-4 rounded-[16px] bg-[var(--surface-2)] p-4">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Public payment ID</p>
                <p className="mt-2 break-all font-mono text-xs font-semibold leading-5 text-[var(--ink-2)]">{editingTransparencyEntry.transactionHash}</p>
              </div>
            ) : null}

            <ApprovalProgress summary={editingTransparencyEntry?.approvalSummary} />

            <div className="grid gap-2.5 pb-2">
              <Button type="submit">{editingTransparencyId ? 'Save changes' : 'Create record'}</Button>
              {editingTransparencyId && editingTransparencyEntry ? (
                <>
                  <button
                    type="button"
                    disabled={
                      Boolean(editingTransparencyEntry.transactionHash) ||
                      Boolean(editingTransparencyEntry.approvalSummary?.enabled && editingTransparencyEntry.approvalSummary.approvedByCurrentUser && editingTransparencyEntry.approvalSummary.remainingApprovals > 0)
                    }
                    onClick={() => sendTransparencyDisbursement(editingTransparencyEntry)}
                    className="app-btn btn-accent disabled:opacity-50"
                  >
                    {editingTransparencyEntry.approvalSummary?.enabled && !editingTransparencyEntry.transactionHash
                      ? editingTransparencyEntry.approvalSummary.approvedByCurrentUser && editingTransparencyEntry.approvalSummary.remainingApprovals > 0
                        ? 'Approved by you'
                        : 'Approve release'
                      : 'Send public release'}
                  </button>
                  <button
                    type="button"
                    onClick={() => archiveTransparency(editingTransparencyEntry)}
                    className="app-btn btn-outline text-[var(--ember-600)]"
                  >
                    Archive
                  </button>
                </>
              ) : null}
            </div>
          </form>
        </BottomSheet>
      ) : null}

      {taxSheet.isOpen ? (
        <BottomSheet
          title={editingTaxId ? 'Edit receipt' : 'Issue receipt'}
          sub="Property tax receipts"
          anim={taxSheet.anim}
          onClose={taxSheet.close}
        >
          {error || success ? (
            <div className="mb-4 grid gap-3">
              <ErrorBanner message={error} />
              <SuccessBanner message={success} />
            </div>
          ) : null}

          <form onSubmit={saveTaxReceipt}>
            <div className="field">
              <label className="input-label" htmlFor="tax-name">Taxpayer name</label>
              <Input
                id="tax-name"
                required
                value={taxForm.taxpayerName}
                onChange={(event) => setTaxForm({ ...taxForm, taxpayerName: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="tax-email">Taxpayer email</label>
              <Input
                id="tax-email"
                value={taxForm.taxpayerEmail}
                onChange={(event) => setTaxForm({ ...taxForm, taxpayerEmail: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="tax-pin">Property index number</label>
              <Input
                id="tax-pin"
                required
                value={taxForm.propertyIndexNumber}
                onChange={(event) => setTaxForm({ ...taxForm, propertyIndexNumber: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="tax-address">Property address</label>
              <Textarea
                id="tax-address"
                required
                value={taxForm.propertyAddress}
                onChange={(event) => setTaxForm({ ...taxForm, propertyAddress: event.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label className="input-label" htmlFor="tax-year">Tax year</label>
                <Input
                  id="tax-year"
                  value={taxForm.taxYear}
                  onChange={(event) => setTaxForm({ ...taxForm, taxYear: event.target.value })}
                />
              </div>
              <div className="field">
                <label className="input-label" htmlFor="tax-amount">Amount</label>
                <Input
                  id="tax-amount"
                  value={taxForm.amount}
                  onChange={(event) => setTaxForm({ ...taxForm, amount: event.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label className="input-label" htmlFor="tax-asset">Currency code</label>
              <Input
                id="tax-asset"
                value={taxForm.assetCode}
                onChange={(event) => setTaxForm({ ...taxForm, assetCode: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="tax-ledger">Public record number</label>
              <Input
                id="tax-ledger"
                value={taxForm.ledger}
                onChange={(event) => setTaxForm({ ...taxForm, ledger: event.target.value })}
              />
            </div>
            <div className="field">
              <label className="input-label" htmlFor="tax-hash">Payment ID</label>
              <Input
                id="tax-hash"
                value={taxForm.transactionHash}
                onChange={(event) => setTaxForm({ ...taxForm, transactionHash: event.target.value })}
                placeholder="Verified payment ID"
              />
              <p className="mt-2 text-xs font-medium leading-4 text-[var(--muted)]">Links this receipt to a confirmed public payment.</p>
            </div>

            <div className="grid gap-2.5 pb-2">
              <Button type="submit">{editingTaxId ? 'Save changes' : 'Issue receipt'}</Button>
              {editingTaxId && editingTaxReceipt ? (
                <>
                  <a href={`/${tenantSlug}/tax-receipts/${editingTaxReceipt.referenceCode}`} className="app-btn btn-outline">
                    Public receipt
                  </a>
                  <button
                    type="button"
                    onClick={() => voidTaxReceipt(editingTaxReceipt)}
                    className="app-btn btn-outline text-[var(--ember-600)]"
                  >
                    Void
                  </button>
                </>
              ) : null}
            </div>
          </form>
        </BottomSheet>
      ) : null}
    </section>
  );
}
