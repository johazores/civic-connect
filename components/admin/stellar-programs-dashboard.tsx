'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';
import { formatDate } from '@/lib/format';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  async function loadAll() {
    setIsLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (actionFilter.status !== 'ALL') params.set('status', actionFilter.status);
    if (actionFilter.type !== 'ALL') params.set('type', actionFilter.type);

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
      setError(actionsPayload.error || transparencyPayload.error || taxPayload.error || 'Unable to load Stellar civic programs.');
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
        rewardDestinationPublicKey: action.rewardDestinationPublicKey || ''
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
      setError(payload.error || 'Unable to send Stellar reward.');
      return;
    }

    setSuccess(`Reward sent. Transaction: ${payload.data.rewardTransactionHash}`);
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

    setSuccess(`Disbursement published on Stellar: ${payload.data.transactionHash}`);
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
    await loadAll();
  }

  const approvedActions = actions.filter((item) => item.status === 'APPROVED').length;
  const rewardedActions = actions.filter((item) => item.status === 'REWARDED').length;
  const verifiedTransparency = transparencyEntries.filter((item) => item.transactionHash).length;
  const stellarTaxReceipts = taxReceipts.filter((item) => item.transactionHash).length;

  return (
    <section className="grid gap-6">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-eyebrow">Stellar civic programs</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">Rewards, transparency, and verifiable receipts.</h2>
            <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-600">
              Manage the StellarX expansion without turning the product into a generic crypto app. Each record remains tied to civic services, staff review, and public verification.
            </p>
          </div>
          <button onClick={loadAll} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary">Refresh</button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Submitted Actions" value={actions.length} />
          <StatCard label="Approved Rewards" value={approvedActions} />
          <StatCard label="Ledger Records" value={verifiedTransparency} />
          <StatCard label="Tax Receipts" value={stellarTaxReceipts} />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_10px_24px_rgba(16,24,40,0.05)]">
        {[
          ['actions', 'Civic Rewards'],
          ['transparency', 'Transparency Ledger'],
          ['tax', 'Tax Receipts']
        ].map(([key, label]) => (
          <button key={key} onClick={() => setActiveProgram(key as any)} className={`rounded-2xl px-4 py-3 text-sm font-extrabold transition ${activeProgram === key ? 'btn-primary' : 'text-slate-600 hover:bg-blue-50 hover:text-[var(--brand)]'}`}>
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-extrabold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}
      {success ? <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-200">{success}</p> : null}

      {activeProgram === 'actions' ? (
        <section className="grid gap-4">
          <Card>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
              <div>
                <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Status</label>
                <Select value={actionFilter.status} onChange={(event) => setActionFilter((current) => ({ ...current, status: event.target.value }))}>
                  {actionStatuses.map((status) => <option key={status} value={status}>{nice(status)}</option>)}
                </Select>
              </div>
              <div>
                <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Type</label>
                <Select value={actionFilter.type} onChange={(event) => setActionFilter((current) => ({ ...current, type: event.target.value }))}>
                  {actionTypes.map((type) => <option key={type} value={type}>{nice(type)}</option>)}
                </Select>
              </div>
              <Button onClick={loadAll}>Apply</Button>
            </div>
          </Card>
          {isLoading ? <Card><p className="text-sm text-slate-500">Loading civic actions...</p></Card> : null}
          {actions.map((action) => (
            <Card key={action.id} className="card-hover">
              <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700 ring-1 ring-blue-200">{nice(action.type)}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700">{nice(action.status)}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-extrabold text-slate-950">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{action.description}</p>
                  <p className="mt-3 text-sm font-bold text-slate-700">{action.participantName} · {action.locationText}</p>
                  {action.rewardTransactionHash ? <p className="mt-4 break-all rounded-2xl bg-emerald-50 p-4 font-mono text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">{action.rewardTransactionHash}</p> : null}
                </div>
                <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-100">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input value={action.rewardAmount} onChange={(event) => patchAction(action.id, 'rewardAmount', event.target.value)} placeholder="Reward amount" />
                    <Input value={action.rewardAssetCode} onChange={(event) => patchAction(action.id, 'rewardAssetCode', event.target.value)} placeholder="Asset code" />
                  </div>
                  <Input value={action.rewardAssetIssuer || ''} onChange={(event) => patchAction(action.id, 'rewardAssetIssuer', event.target.value)} placeholder="Asset issuer, required for USDC/custom assets" />
                  <Input value={action.rewardDestinationPublicKey || ''} onChange={(event) => patchAction(action.id, 'rewardDestinationPublicKey', event.target.value)} placeholder="Participant G... reward wallet" />
                  <Textarea value={action.verificationNote || ''} onChange={(event) => patchAction(action.id, 'verificationNote', event.target.value)} placeholder="Review note" />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => updateAction(action, 'APPROVED')} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-primary">Approve</button>
                    <button onClick={() => updateAction(action, 'REJECTED')} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary">Reject</button>
                    <button disabled={action.status !== 'APPROVED'} onClick={() => payReward(action)} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary disabled:opacity-50">Send reward</button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </section>
      ) : null}

      {activeProgram === 'transparency' ? (
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <p className="section-eyebrow">Transparency ledger</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Create public record</h3>
            <form onSubmit={saveTransparency} className="mt-5 grid gap-4">
              <Input required value={transparencyForm.title} onChange={(event) => setTransparencyForm({ ...transparencyForm, title: event.target.value })} placeholder="Title" />
              <Textarea required value={transparencyForm.description} onChange={(event) => setTransparencyForm({ ...transparencyForm, description: event.target.value })} placeholder="Description" />
              <Select value={transparencyForm.entryType} onChange={(event) => setTransparencyForm({ ...transparencyForm, entryType: event.target.value })}>{entryTypes.map((type) => <option key={type} value={type}>{nice(type)}</option>)}</Select>
              <Select value={transparencyForm.status} onChange={(event) => setTransparencyForm({ ...transparencyForm, status: event.target.value })}>{entryStatuses.map((status) => <option key={status} value={status}>{nice(status)}</option>)}</Select>
              <Input value={transparencyForm.department} onChange={(event) => setTransparencyForm({ ...transparencyForm, department: event.target.value })} placeholder="Department" />
              <Input value={transparencyForm.recipientName} onChange={(event) => setTransparencyForm({ ...transparencyForm, recipientName: event.target.value })} placeholder="Recipient name" />
              <Input value={transparencyForm.recipientPublicKey} onChange={(event) => setTransparencyForm({ ...transparencyForm, recipientPublicKey: event.target.value })} placeholder="Recipient G... public key for Stellar disbursement" />
              <div className="grid gap-3 md:grid-cols-2"><Input value={transparencyForm.amount} onChange={(event) => setTransparencyForm({ ...transparencyForm, amount: event.target.value })} placeholder="Amount" /><Input value={transparencyForm.assetCode} onChange={(event) => setTransparencyForm({ ...transparencyForm, assetCode: event.target.value })} placeholder="Asset code" /></div>
              <Input value={transparencyForm.assetIssuer} onChange={(event) => setTransparencyForm({ ...transparencyForm, assetIssuer: event.target.value })} placeholder="Asset issuer for non-XLM assets" />
              <Input value={transparencyForm.transactionHash} onChange={(event) => setTransparencyForm({ ...transparencyForm, transactionHash: event.target.value })} placeholder="Existing transaction hash, optional" />
              <Button>{editingTransparencyId ? 'Save Changes' : 'Create Record'}</Button>
            </form>
          </Card>
          <div className="grid gap-4">
            {transparencyEntries.map((entry) => (
              <Card key={entry.id} className="card-hover">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{entry.referenceCode}</p><h3 className="mt-2 text-xl font-extrabold text-slate-950">{entry.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{entry.description}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-700">{nice(entry.status)}</span></div>
                <div className="mt-4 grid gap-3 md:grid-cols-3"><Mini label="Amount" value={`${entry.amount} ${entry.assetCode}`} /><Mini label="Recipient" value={entry.recipientName || 'Public record'} /><Mini label="Date" value={formatDate(entry.occurredAt)} /></div>
                {entry.transactionHash ? <p className="mt-4 break-all rounded-2xl bg-slate-50 p-4 font-mono text-xs font-bold text-slate-600 ring-1 ring-slate-100">{entry.transactionHash}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => editTransparency(entry)} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-primary">Edit</button><button disabled={Boolean(entry.transactionHash)} onClick={() => sendTransparencyDisbursement(entry)} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary disabled:opacity-50">Send Stellar disbursement</button><button onClick={() => archiveTransparency(entry)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700">Archive</button></div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {activeProgram === 'tax' ? (
        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <p className="section-eyebrow">Tax receipts</p>
            <h3 className="mt-2 text-2xl font-extrabold text-slate-950">Issue receipt record</h3>
            <form onSubmit={saveTaxReceipt} className="mt-5 grid gap-4">
              <Input required value={taxForm.taxpayerName} onChange={(event) => setTaxForm({ ...taxForm, taxpayerName: event.target.value })} placeholder="Taxpayer name" />
              <Input value={taxForm.taxpayerEmail} onChange={(event) => setTaxForm({ ...taxForm, taxpayerEmail: event.target.value })} placeholder="Taxpayer email" />
              <Input required value={taxForm.propertyIndexNumber} onChange={(event) => setTaxForm({ ...taxForm, propertyIndexNumber: event.target.value })} placeholder="Property index number" />
              <Textarea required value={taxForm.propertyAddress} onChange={(event) => setTaxForm({ ...taxForm, propertyAddress: event.target.value })} placeholder="Property address" />
              <div className="grid gap-3 md:grid-cols-2"><Input value={taxForm.taxYear} onChange={(event) => setTaxForm({ ...taxForm, taxYear: event.target.value })} placeholder="Tax year" /><Input value={taxForm.amount} onChange={(event) => setTaxForm({ ...taxForm, amount: event.target.value })} placeholder="Amount" /></div>
              <div className="grid gap-3 md:grid-cols-2"><Input value={taxForm.assetCode} onChange={(event) => setTaxForm({ ...taxForm, assetCode: event.target.value })} placeholder="Asset code" /><Input value={taxForm.ledger} onChange={(event) => setTaxForm({ ...taxForm, ledger: event.target.value })} placeholder="Ledger number" /></div>
              <Input value={taxForm.transactionHash} onChange={(event) => setTaxForm({ ...taxForm, transactionHash: event.target.value })} placeholder="Verified Stellar transaction hash" />
              <Button>{editingTaxId ? 'Save Changes' : 'Issue Receipt'}</Button>
            </form>
          </Card>
          <div className="grid gap-4">
            {taxReceipts.map((receipt) => (
              <Card key={receipt.id} className="card-hover">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{receipt.referenceCode}</p><h3 className="mt-2 text-xl font-extrabold text-slate-950">{receipt.taxpayerName}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{receipt.propertyAddress}</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">{nice(receipt.status)}</span></div>
                <div className="mt-4 grid gap-3 md:grid-cols-3"><Mini label="Property" value={receipt.propertyIndexNumber} /><Mini label="Year" value={String(receipt.taxYear)} /><Mini label="Amount" value={`${receipt.amount} ${receipt.assetCode}`} /></div>
                {receipt.transactionHash ? <p className="mt-4 break-all rounded-2xl bg-slate-50 p-4 font-mono text-xs font-bold text-slate-600 ring-1 ring-slate-100">{receipt.transactionHash}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => editTax(receipt)} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-primary">Edit</button><a href={`/${tenantSlug}/tax-receipts/${receipt.referenceCode}`} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary">Public receipt</a><button onClick={() => voidTaxReceipt(receipt)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700">Void</button></div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 font-extrabold text-slate-950">{value}</p></div>;
}
