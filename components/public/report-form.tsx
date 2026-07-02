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
        <p className="text-sm font-semibold text-slate-600">Reporting is not available because no report categories are active.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <Card className="lg:sticky lg:top-28">
        <p className="section-eyebrow">Report progress</p>
        <div className="mt-6 flex items-end justify-between gap-3">
          <div>
            <p className="text-4xl font-extrabold tracking-[-0.03em] text-slate-950">{completionScore}%</p>
            <p className="mt-1 text-sm font-bold text-slate-500">Form completion</p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[var(--brand)] ring-1 ring-blue-100">In progress</span>
        </div>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-[var(--brand)] transition-all" style={{ width: `${completionScore}%` }} />
        </div>
        <div className="mt-6 grid gap-3">
          {[
            ['Category', selectedCategory?.name || 'Select a category'],
            ['Issue details', form.title || 'Add a short title'],
            ['Location', form.locationText || 'Add the street or landmark'],
            ['Reference number', 'Created after submission']
          ].map(([title, text], index) => (
            <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_26px_rgba(18,32,51,0.04)]">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Step {index + 1}</p>
              <p className="mt-1 font-extrabold text-slate-950">{title}</p>
              <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        {createdReport ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Submitted</p>
            <h2 className="mt-2 text-2xl font-extrabold text-emerald-950">Your report was received.</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-emerald-800">Save this reference number to track your request.</p>
            <p className="mt-4 rounded-xl bg-white p-4 text-xl font-extrabold tracking-[-0.03em] text-emerald-950 shadow-sm">{createdReport.referenceCode}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href={`/${tenantSlug}/track?reference=${encodeURIComponent(createdReport.referenceCode)}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white">
                Track this report
              </Link>
              {citizen ? (
                <Link href={`/${tenantSlug}/dashboard`} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-bold text-emerald-800">
                  View dashboard
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className={`mb-5 rounded-2xl border p-4 ${citizen ? 'border-blue-100 bg-blue-50' : 'border-amber-200 bg-amber-50'}`}>
          <p className={`text-sm font-bold ${citizen ? 'text-slate-950' : 'text-amber-950'}`}>{citizen ? `Signed in as ${citizen.name}` : 'Submitting without an account'}</p>
          <p className={`mt-1 text-sm font-medium ${citizen ? 'text-slate-600' : 'text-amber-800'}`}>{citizen ? 'This report will be saved to your dashboard.' : 'You can still track the request using the reference number after submission.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <div>
            <label className="input-label">Report category</label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedCategoryId === category.id
                      ? 'border-[var(--brand)] bg-blue-50 ring-4 ring-blue-100'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-extrabold text-slate-950">{category.name}</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{category.description || 'Submit this type of city concern.'}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="input-label">Your name</label>
              <Input required value={form.reporterName} onChange={(event) => updateField('reporterName', event.target.value)} placeholder="Enter your full name" autoComplete="name" />
            </div>
            <div>
              <label className="input-label">Email</label>
              <Input type="email" value={form.reporterEmail} onChange={(event) => updateField('reporterEmail', event.target.value)} placeholder="Enter your email address" autoComplete="email" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="input-label">Phone</label>
              <Input value={form.reporterPhone} onChange={(event) => updateField('reporterPhone', event.target.value)} placeholder="Enter your mobile number" autoComplete="tel" />
            </div>
            <div>
              <label className="input-label">Report title</label>
              <Input required value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Summarize the concern clearly" />
            </div>
          </div>

          <div>
            <label className="input-label">Description</label>
            <Textarea required value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe what happened, when you noticed it, and any safety concerns." />
          </div>

          <div>
            <label className="input-label">Location</label>
            <Input required value={form.locationText} onChange={(event) => updateField('locationText', event.target.value)} placeholder="Street, landmark, barangay, or area" />
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <label className="input-label">Optional photo</label>
            <Input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handlePhotoChange} className="mt-3 bg-white" />
            <p className="mt-2 text-xs font-medium text-slate-500">JPG, PNG, WEBP, or GIF. Max 4MB.</p>
            {photo ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img src={photo.previewUrl} alt="Selected report photo" className="h-56 w-full object-cover" />
              </div>
            ) : null}
          </div>

          {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-800 ring-1 ring-rose-200">{error}</p> : null}

          <Button disabled={isLoading}>{isLoading ? 'Submitting...' : 'Submit report'}</Button>
        </form>
      </Card>
    </div>
  );
}
