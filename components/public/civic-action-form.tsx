'use client';

import { useState } from 'react';
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

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <p className="section-eyebrow">Civic rewards</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 md:text-5xl">Submit verified civic work.</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Use this flow for attendance, cleanups, volunteer work, and other verified civic actions. Approved actions can receive a real Stellar Testnet reward from the tenant wallet.
        </p>
        <div className="mt-6 grid gap-3">
          {['Submit action evidence', 'Staff reviews and approves', 'Reward is paid through Stellar', 'Transaction hash becomes the proof'].map((item, index) => (
            <div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-extrabold text-white">{index + 1}</span>
              <p className="text-sm font-bold text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <form onSubmit={submitAction} className="grid gap-4">
          {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}
          {created ? (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">
              Submitted successfully. Reference memo: <span className="font-mono">{created.rewardMemo}</span>. Status: {created.status}.
            </div>
          ) : null}
          <div>
            <label className="text-sm font-extrabold text-slate-700">Action type</label>
            <Select value={form.type} onChange={(event) => update('type', event.target.value)}>
              <option value="PARTICIPATION">Civic participation / attendance</option>
              <option value="CLEANUP">Environmental cleanup</option>
            </Select>
          </div>
          <div>
            <label className="text-sm font-extrabold text-slate-700">Title</label>
            <Input required value={form.title} onChange={(event) => update('title', event.target.value)} placeholder="Barangay river cleanup, public hearing attendance" />
          </div>
          <div>
            <label className="text-sm font-extrabold text-slate-700">Details</label>
            <Textarea required value={form.description} onChange={(event) => update('description', event.target.value)} placeholder="Describe what happened and what proof is attached." />
          </div>
          <div>
            <label className="text-sm font-extrabold text-slate-700">Location</label>
            <Input required value={form.locationText} onChange={(event) => update('locationText', event.target.value)} placeholder="Street, barangay, venue, or landmark" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-extrabold text-slate-700">Latitude</label>
              <Input value={form.latitude} onChange={(event) => update('latitude', event.target.value)} placeholder="Optional GPS latitude" />
            </div>
            <div>
              <label className="text-sm font-extrabold text-slate-700">Longitude</label>
              <Input value={form.longitude} onChange={(event) => update('longitude', event.target.value)} placeholder="Optional GPS longitude" />
            </div>
          </div>
          <div>
            <label className="text-sm font-extrabold text-slate-700">Photo / proof URL</label>
            <Input value={form.photoUrl} onChange={(event) => update('photoUrl', event.target.value)} placeholder="Optional image URL for evidence" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-extrabold text-slate-700">Your name</label>
              <Input required value={form.participantName} onChange={(event) => update('participantName', event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-extrabold text-slate-700">Email</label>
              <Input type="email" value={form.participantEmail} onChange={(event) => update('participantEmail', event.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-extrabold text-slate-700">Reward wallet public key</label>
            <Input value={form.rewardDestinationPublicKey} onChange={(event) => update('rewardDestinationPublicKey', event.target.value)} placeholder="G... Stellar Testnet wallet address" />
            <p className="mt-2 text-xs font-semibold text-slate-500">This is where the reward is sent after staff approval. The app never asks for your secret key.</p>
          </div>
          <Button disabled={isSaving}>{isSaving ? 'Submitting...' : 'Submit for review'}</Button>
        </form>
      </Card>
    </div>
  );
}
