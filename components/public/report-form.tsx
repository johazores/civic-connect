'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';

const maxUploadBytes = 4 * 1024 * 1024;

type Category = {
  id: string;
  name: string;
  description: string | null;
};

type CreatedReport = {
  referenceCode: string;
};

type Citizen = {
  name: string;
  email: string;
  phone: string | null;
};

type SelectedPhoto = {
  fileName: string;
  mimeType: string;
  dataUrl: string;
  previewUrl: string;
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read photo.'));
    reader.readAsDataURL(file);
  });
}

export function ReportForm({ tenantSlug, categories }: { tenantSlug: string; categories: Category[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdReport, setCreatedReport] = useState<CreatedReport | null>(null);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [form, setForm] = useState({
    reporterName: '',
    reporterEmail: '',
    reporterPhone: '',
    title: '',
    description: '',
    locationText: ''
  });

  useEffect(() => {
    let isMounted = true;

    async function loadCitizen() {
      const response = await fetch(`/api/tenant/${tenantSlug}/citizens/me`);

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const nextCitizen = payload.data.citizen as Citizen;

      if (!isMounted) {
        return;
      }

      setCitizen(nextCitizen);
      setForm((current) => ({
        ...current,
        reporterName: current.reporterName || nextCitizen.name,
        reporterEmail: current.reporterEmail || nextCitizen.email,
        reporterPhone: current.reporterPhone || nextCitizen.phone || ''
      }));
    }

    loadCitizen();

    return () => {
      isMounted = false;
    };
  }, [tenantSlug]);

  const selectedCategory = useMemo(() => {
    return categories.find((category) => category.id === selectedCategoryId) || categories[0];
  }, [categories, selectedCategoryId]);

  const completionScore = useMemo(() => {
    const requiredValues = [selectedCategoryId, form.reporterName, form.title, form.description, form.locationText];
    const completed = requiredValues.filter((value) => value.trim().length > 0).length;
    return Math.round((completed / requiredValues.length) * 100);
  }, [form, selectedCategoryId]);

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setPhoto(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Please upload a JPG, PNG, WEBP, or GIF photo.');
      event.target.value = '';
      return;
    }

    if (file.size > maxUploadBytes) {
      setError('Photo must be 4MB or smaller.');
      event.target.value = '';
      return;
    }

    const dataUrl = await readFileAsDataUrl(file);
    setError('');
    setPhoto({ fileName: file.name, mimeType: file.type, dataUrl, previewUrl: dataUrl });
  }

  async function uploadPhoto() {
    if (!photo) {
      return '';
    }

    const response = await fetch('/api/uploads/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: photo.fileName, mimeType: photo.mimeType, dataUrl: photo.dataUrl })
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error || 'Unable to upload photo.');
    }

    return payload.data.imageUrl as string;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setCreatedReport(null);

    try {
      const imageUrl = await uploadPhoto();
      const response = await fetch(`/api/tenant/${tenantSlug}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, categoryId: selectedCategoryId, imageUrl })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Unable to submit report.');
      }

      setCreatedReport(payload.data);
      setForm({ reporterName: '', reporterEmail: '', reporterPhone: '', title: '', description: '', locationText: '' });
      setSelectedCategoryId(categories[0]?.id || '');
      setPhoto(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit report.');
    }

    setIsLoading(false);
  }

  if (categories.length === 0) {
    return (
      <Card>
        <p className="text-sm font-black text-slate-600">Reporting is not available yet because no report categories are active.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
      <Card className="lg:sticky lg:top-28">
        <p className="section-eyebrow">Report checklist</p>
        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-4xl font-black tracking-[-0.03em] text-slate-900">{completionScore}%</p>
            <p className="mt-1 text-sm font-black text-slate-500">Completion</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-[var(--brand)] ring-1 ring-blue-100">Draft</span>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-cyan-500 transition-all" style={{ width: `${completionScore}%` }} />
        </div>
        <div className="mt-6 grid gap-3">
          {[
            ['1', 'Choose category', selectedCategory?.name || 'Pending'],
            ['2', 'Describe issue', form.title || 'Pending'],
            ['3', 'Add location', form.locationText || 'Pending'],
            ['4', 'Submit and track', 'A reference number is created after submission']
          ].map(([number, title, text]) => (
            <div key={number} className="rounded-[1.4rem] border border-slate-200 bg-white/72 p-4 shadow-[0_10px_26px_rgba(16,32,51,0.04)]">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Step {number}</p>
              <p className="mt-1 font-black text-slate-900">{title}</p>
              <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        {createdReport ? (
          <div className="mb-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-800">Submitted</p>
            <h2 className="mt-2 text-2xl font-black text-emerald-950">Your report was received.</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-emerald-800">Save this reference number to track your request. Signed-in reports also appear in your citizen dashboard.</p>
            <p className="mt-4 rounded-2xl bg-white p-4 text-xl font-black tracking-[-0.03em] text-emerald-950 shadow-sm">{createdReport.referenceCode}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href={`/${tenantSlug}/track?reference=${encodeURIComponent(createdReport.referenceCode)}`} className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white">
                Track this report
              </Link>
              {citizen ? (
                <Link href={`/${tenantSlug}/dashboard`} className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-extrabold text-emerald-800">
                  View dashboard
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        {citizen ? (
          <div className="mb-5 rounded-[1.5rem] border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm font-black text-slate-900">Signed in as {citizen.name}</p>
            <p className="mt-1 text-sm font-medium text-slate-600">This report will be saved to your citizen dashboard.</p>
          </div>
        ) : (
          <div className="mb-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-black text-amber-950">Guest report mode</p>
            <p className="mt-1 text-sm font-medium text-amber-800">You can still submit a report, but creating an account makes tracking easier.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <label className="text-sm font-extrabold text-slate-700">Report category</label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`rounded-[1.4rem] border p-4 text-left transition ${
                    selectedCategoryId === category.id
                      ? 'border-[var(--brand)] bg-blue-50 ring-4 ring-blue-100'
                      : 'border-slate-200 bg-white/86 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <p className="font-black text-slate-900">{category.name}</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-500">{category.description || 'Submit this type of city concern.'}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-extrabold text-slate-700">Your name</label>
              <Input required value={form.reporterName} onChange={(event) => updateField('reporterName', event.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="text-sm font-extrabold text-slate-700">Email</label>
              <Input type="email" value={form.reporterEmail} onChange={(event) => updateField('reporterEmail', event.target.value)} placeholder="email@example.com" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-extrabold text-slate-700">Phone</label>
              <Input value={form.reporterPhone} onChange={(event) => updateField('reporterPhone', event.target.value)} placeholder="Optional phone number" />
            </div>
            <div>
              <label className="text-sm font-extrabold text-slate-700">Report title</label>
              <Input required value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Example: Broken streetlight" />
            </div>
          </div>

          <div>
            <label className="text-sm font-extrabold text-slate-700">Description</label>
            <Textarea required value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe the concern clearly." />
          </div>

          <div>
            <label className="text-sm font-extrabold text-slate-700">Location</label>
            <Input required value={form.locationText} onChange={(event) => updateField('locationText', event.target.value)} placeholder="Street, landmark, barangay, or area" />
          </div>

          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-5">
            <label className="text-sm font-extrabold text-slate-700">Optional photo</label>
            <Input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePhotoChange} className="mt-3 bg-white" />
            <p className="mt-2 text-xs font-medium text-slate-500">JPG, PNG, WEBP, or GIF. Max 4MB.</p>
            {photo ? (
              <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.previewUrl} alt="Selected report photo" className="h-56 w-full object-cover" />
              </div>
            ) : null}
          </div>

          {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-extrabold text-rose-800 ring-1 ring-rose-200">{error}</p> : null}

          <Button disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit Report'}</Button>
        </form>
      </Card>
    </div>
  );
}
