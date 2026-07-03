'use client';

import { useState } from 'react';
import {
  FiAward,
  FiCheck,
  FiCheckCircle,
  FiClipboard,
  FiCopy,
  FiHash,
  FiPlus,
  FiSend,
  FiUserCheck,
  FiX
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type CivicAction = {
  id: string;
  type: string;
  title: string;
  status: string;
  rewardMemo: string | null;
  rewardAmount: string;
  rewardAssetCode: string;
};

const howItWorks = [
  { icon: FiSend, label: 'Submit action evidence', sub: 'Attendance, cleanups, volunteer work' },
  { icon: FiClipboard, label: 'Staff reviews and approves', sub: 'The city team verifies your proof' },
  { icon: FiAward, label: 'Reward is paid through Stellar', sub: 'Sent from the tenant Testnet wallet' },
  { icon: FiHash, label: 'Transaction hash becomes the proof', sub: 'Ledger-verified, publicly checkable' }
];

export function CivicActionForm({ tenantSlug }: { tenantSlug: string }) {
  const [form, setForm] = useState({
    type: 'PARTICIPATION',
    title: '',
    description: '',
    locationText: '',
    latitude: '',
    longitude: '',
    photoUrl: '',
    participantName: '',
    participantEmail: '',
    participantPhone: '',
    rewardDestinationPublicKey: ''
  });
  const [created, setCreated] = useState<CivicAction | null>(null);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showGps, setShowGps] = useState(false);
  const [copied, setCopied] = useState(false);

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submitAction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setCreated(null);

    const response = await fetch(`/api/tenant/${tenantSlug}/civic-actions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to submit civic action.');
      setIsSaving(false);
      return;
    }

    setCreated(payload.data);
    setIsSaving(false);
  }

  async function copyMemo() {
    if (!created?.rewardMemo) return;

    try {
      await navigator.clipboard.writeText(created.rewardMemo);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (created) {
    return (
      <Card className="fade-up p-6">
        <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]">
          <FiCheckCircle aria-hidden="true" className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-[19px] font-bold text-[var(--ink)]">Submitted for review</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">
          Staff will verify your evidence. Once approved, the reward is paid to your Stellar wallet.
        </p>

        <div className="mt-4">
          <span className="status-pill bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]">
            {created.status.replaceAll('_', ' ')}
          </span>
        </div>

        {created.rewardMemo ? (
          <div className="mt-4">
            <p className="group-label">Reference memo</p>
            <div className="flex items-center gap-3 rounded-[16px] bg-[var(--surface-2)] p-4">
              <p className="min-w-0 flex-1 break-all font-mono text-sm font-bold text-[var(--ink)]">{created.rewardMemo}</p>
              <button type="button" onClick={copyMemo} className="app-icon-btn" aria-label="Copy reference memo">
                {copied ? <FiCheck aria-hidden="true" className="h-5 w-5 text-[#0f806d]" /> : <FiCopy aria-hidden="true" className="h-5 w-5" />}
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-2.5">
          <button type="button" onClick={() => setCreated(null)} className="app-btn btn-outline">
            Submit another action
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 pb-6">
      <form onSubmit={submitAction}>
        <Card>
          {error ? (
            <p className="mb-4 rounded-[16px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{error}</p>
          ) : null}

          <p className="group-label">Action</p>
          <div className="field">
            <label className="input-label" htmlFor="action-type">Action type</label>
            <Select id="action-type" value={form.type} onChange={(event) => update('type', event.target.value)}>
              <option value="PARTICIPATION">Civic participation / attendance</option>
              <option value="CLEANUP">Environmental cleanup</option>
            </Select>
          </div>
          <div className="field">
            <label className="input-label" htmlFor="action-title">Title</label>
            <Input id="action-title" required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Barangay river cleanup, public hearing" />
          </div>
          <div className="field">
            <label className="input-label" htmlFor="action-details">Details</label>
            <Textarea id="action-details" required value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe what happened and what proof is attached." />
          </div>

          <p className="group-label mt-5">Location</p>
          <div className="field">
            <label className="input-label" htmlFor="action-location">Where it happened</label>
            <Input id="action-location" required value={form.locationText} onChange={(event) => update('locationText', event.target.value)} placeholder="Street, barangay, venue, or landmark" />
          </div>
          {showGps ? (
            <div>
              <div className="field">
                <label className="input-label" htmlFor="action-lat">Latitude</label>
                <Input id="action-lat" inputMode="decimal" value={form.latitude} onChange={(event) => update('latitude', event.target.value)} placeholder="Optional GPS latitude" />
              </div>
              <div className="field">
                <label className="input-label" htmlFor="action-lng">Longitude</label>
                <Input id="action-lng" inputMode="decimal" value={form.longitude} onChange={(event) => update('longitude', event.target.value)} placeholder="Optional GPS longitude" />
              </div>
              <button
                type="button"
                onClick={() => setShowGps(false)}
                className="mb-4 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-[var(--muted)]"
              >
                <FiX aria-hidden="true" className="h-4 w-4" /> Hide GPS coordinates
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowGps(true)}
              className="mb-4 inline-flex min-h-11 items-center gap-2 text-[13px] font-bold text-[var(--navy)]"
            >
              <FiPlus aria-hidden="true" className="h-4 w-4" /> Add GPS coordinates (optional)
            </button>
          )}

          <p className="group-label mt-1">Evidence</p>
          <div className="field">
            <label className="input-label" htmlFor="action-photo">Photo / proof URL <span className="font-medium text-[var(--muted)]">(optional)</span></label>
            <Input id="action-photo" type="url" value={form.photoUrl} onChange={(event) => update('photoUrl', event.target.value)} placeholder="Image URL for evidence" />
          </div>

          <p className="group-label mt-5">Contact</p>
          <div className="field">
            <label className="input-label" htmlFor="action-name">Your name</label>
            <Input id="action-name" required value={form.participantName} onChange={(event) => update('participantName', event.target.value)} placeholder="Enter your full name" autoComplete="name" />
          </div>
          <div className="field">
            <label className="input-label" htmlFor="action-email">Email <span className="font-medium text-[var(--muted)]">(optional)</span></label>
            <Input id="action-email" type="email" value={form.participantEmail} onChange={(event) => update('participantEmail', event.target.value)} placeholder="Enter your email address" autoComplete="email" />
          </div>

          <p className="group-label mt-5">Reward wallet</p>
          <div className="field">
            <label className="input-label" htmlFor="action-wallet">Stellar public key</label>
            <Input
              id="action-wallet"
              className="font-mono"
              inputMode="text"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={form.rewardDestinationPublicKey}
              onChange={(event) => update('rewardDestinationPublicKey', event.target.value)}
              placeholder="G... Testnet wallet address"
            />
            <p className="mt-2 text-xs font-semibold leading-5 text-[var(--muted)]">
              This is where the reward is sent after staff approval. The app never asks for your secret key.
            </p>
          </div>

          <Button type="submit" disabled={isSaving} className="btn-block mt-1">
            <FiAward aria-hidden="true" className="h-4 w-4" />
            {isSaving ? 'Submitting...' : 'Submit for review'}
          </Button>
        </Card>
      </form>

      <div>
        <p className="group-label">How rewards work</p>
        <div className="menu-group mb-0">
          {howItWorks.map((item) => (
            <div key={item.label} className="menu-item">
              <span className="mi-ic">
                <item.icon aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="mi-tx">
                <b>{item.label}</b>
                <span>{item.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
