'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiArrowLeft,
  FiArrowRight,
  FiCamera,
  FiCheck,
  FiCheckCircle,
  FiCopy,
  FiFlag,
  FiMapPin,
  FiSend,
  FiUser,
  FiX
} from 'react-icons/fi';
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

const steps = [
  { label: 'Category', hint: 'What kind of concern is it?', icon: FiFlag },
  { label: 'Details', hint: 'Describe it and tell us where.', icon: FiMapPin },
  { label: 'Contact', hint: 'How can the city reach you?', icon: FiUser },
  { label: 'Review', hint: 'Check everything, then submit.', icon: FiCheckCircle }
];

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Unable to read photo.'));
    reader.readAsDataURL(file);
  });
}

export function ReportForm({ tenantSlug, categories }: { tenantSlug: string; categories: Category[] }) {
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdReport, setCreatedReport] = useState<CreatedReport | null>(null);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '');
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [copied, setCopied] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
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

  const progress = Math.round(((step + 1) / steps.length) * 100);
  const CurrentIcon = steps[step].icon;

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function validateStep(nextStep = step) {
    if (nextStep === 0 && !selectedCategoryId) {
      return 'Choose the report category that best matches your concern.';
    }

    if (nextStep === 1) {
      if (!form.title.trim()) return 'Add a short title for the concern.';
      if (!form.description.trim()) return 'Describe the concern before continuing.';
      if (!form.locationText.trim()) return 'Add the street, landmark, barangay, or area.';
    }

    if (nextStep === 2 && !form.reporterName.trim()) {
      return 'Add your name so the city team can identify the report.';
    }

    return '';
  }

  function goNext() {
    const validationError = validateStep();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setError('');
    setStep((current) => Math.max(current - 1, 0));
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

  function removePhoto() {
    setPhoto(null);
    if (photoInputRef.current) {
      photoInputRef.current.value = '';
    }
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

    for (const item of [0, 1, 2]) {
      const validationError = validateStep(item);

      if (validationError) {
        setError(validationError);
        setStep(item);
        return;
      }
    }

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
      setStep(0);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit report.');
    }

    setIsLoading(false);
  }

  async function copyReference() {
    if (!createdReport) return;

    try {
      await navigator.clipboard.writeText(createdReport.referenceCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (categories.length === 0) {
    return (
      <Card>
        <p className="text-sm font-semibold text-[var(--ink-2)]">Reporting is not available because no report categories are active.</p>
      </Card>
    );
  }

  if (createdReport) {
    return (
      <Card className="fade-up p-6">
        <div className="grid h-14 w-14 place-items-center rounded-[18px] bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]">
          <FiCheckCircle aria-hidden="true" className="h-7 w-7" />
        </div>
        <h2 className="mt-4 font-display text-xl font-bold text-[var(--ink)]">Your report was received</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">Keep this reference number to follow the request from your phone.</p>

        <div className="mt-5 flex items-center gap-3 rounded-[16px] bg-[var(--surface-2)] p-4">
          <p className="min-w-0 flex-1 break-all font-display text-lg font-bold text-[var(--ink)]">{createdReport.referenceCode}</p>
          <button type="button" onClick={copyReference} className="app-icon-btn" aria-label="Copy reference number">
            {copied ? <FiCheck aria-hidden="true" className="h-5 w-5 text-[#0f806d]" /> : <FiCopy aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>

        <div className="mt-5 grid gap-2.5">
          <Link href={`/${tenantSlug}/track?reference=${encodeURIComponent(createdReport.referenceCode)}`} className="app-btn btn-primary">
            Track this report
          </Link>
          {citizen ? (
            <Link href={`/${tenantSlug}/dashboard`} className="app-btn btn-outline">
              View dashboard
            </Link>
          ) : null}
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[var(--surface-2)] text-[var(--navy)]">
            <CurrentIcon aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">
              Step {step + 1} of {steps.length}
            </p>
            <h2 className="font-display text-lg font-bold text-[var(--ink)]">{steps[step].label}</h2>
          </div>
        </div>

        <div className="heatbar mt-4" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <i style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-[13px] font-medium text-[var(--muted)]">{steps[step].hint}</p>

        <div key={step} className="fade-up mt-5">
          {step === 0 ? (
            <div className="menu-group mb-0">
              {categories.map((category) => {
                const isSelected = selectedCategoryId === category.id;

                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(category.id);
                      setError('');
                    }}
                    className={`menu-item ${isSelected ? 'on' : ''}`.trim()}
                    aria-pressed={isSelected}
                  >
                    <span className="mi-tx">
                      <b>{category.name}</b>
                      <span>{category.description || 'Submit this type of city concern.'}</span>
                    </span>
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-[1.6px] transition ${
                        isSelected ? 'border-[var(--navy)] bg-[var(--navy)] text-white' : 'border-[var(--line-strong)] text-transparent'
                      }`}
                    >
                      <FiCheck aria-hidden="true" className="h-3.5 w-3.5" />
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <div className="field">
                <label className="input-label" htmlFor="report-title">Report title</label>
                <Input id="report-title" required value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Summarize the concern clearly" />
              </div>
              <div className="field">
                <label className="input-label" htmlFor="report-description">Description</label>
                <Textarea id="report-description" required value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="What happened, when you noticed it, and any safety concerns." />
              </div>
              <div className="field mb-0">
                <label className="input-label" htmlFor="report-location">Location</label>
                <Input id="report-location" required value={form.locationText} onChange={(event) => updateField('locationText', event.target.value)} placeholder="Street, landmark, barangay, or area" />
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <div
                className={`mb-4 rounded-[18px] p-4 ${
                  citizen ? 'bg-[color-mix(in_srgb,var(--navy)_8%,var(--surface))]' : 'bg-[color-mix(in_srgb,var(--heat-2)_16%,var(--surface))]'
                }`}
              >
                <p className="text-sm font-bold text-[var(--ink)]">{citizen ? `Signed in as ${citizen.name}` : 'Submitting without an account'}</p>
                <p className="mt-1 text-[13px] font-medium leading-5 text-[var(--ink-2)]">
                  {citizen ? 'This report will be saved to your dashboard.' : 'You can still track the request with the reference number.'}
                </p>
              </div>
              <div className="field">
                <label className="input-label" htmlFor="reporter-name">Your name</label>
                <Input id="reporter-name" required value={form.reporterName} onChange={(event) => updateField('reporterName', event.target.value)} placeholder="Enter your full name" autoComplete="name" />
              </div>
              <div className="field">
                <label className="input-label" htmlFor="reporter-email">Email <span className="font-medium text-[var(--muted)]">(optional)</span></label>
                <Input id="reporter-email" type="email" value={form.reporterEmail} onChange={(event) => updateField('reporterEmail', event.target.value)} placeholder="Enter your email address" autoComplete="email" />
              </div>
              <div className="field mb-0">
                <label className="input-label" htmlFor="reporter-phone">Phone <span className="font-medium text-[var(--muted)]">(optional)</span></label>
                <Input id="reporter-phone" value={form.reporterPhone} onChange={(event) => updateField('reporterPhone', event.target.value)} placeholder="Enter your mobile number" autoComplete="tel" />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4">
              <div>
                <input
                  ref={photoInputRef}
                  id="report-photo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handlePhotoChange}
                  className="sr-only"
                />
                {photo ? (
                  <div className="overflow-hidden rounded-[18px] border border-[var(--line)] bg-[var(--surface)]">
                    <img src={photo.previewUrl} alt="Selected report photo" className="h-48 w-full object-cover" />
                    <div className="flex items-center gap-3 p-3">
                      <p className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--ink-2)]">{photo.fileName}</p>
                      <button type="button" onClick={removePhoto} className="app-icon-btn" aria-label="Remove photo">
                        <FiX aria-hidden="true" className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="report-photo"
                    className="flex min-h-[76px] cursor-pointer items-center gap-3 rounded-[18px] border-[1.6px] border-dashed border-[var(--line-strong)] bg-[var(--surface-2)] p-4 transition active:scale-[.985]"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[var(--surface)] text-[var(--navy)] shadow-sm">
                      <FiCamera aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[var(--ink)]">Add a photo (optional)</span>
                      <span className="mt-0.5 block text-xs font-medium text-[var(--muted)]">JPG, PNG, WEBP, or GIF · max 4MB</span>
                    </span>
                  </label>
                )}
              </div>

              <div>
                <p className="group-label">Review</p>
                <div className="menu-group mb-0">
                  <SummaryRow label="Category" value={selectedCategory?.name || 'Not selected'} />
                  <SummaryRow label="Title" value={form.title || 'Missing title'} />
                  <SummaryRow label="Location" value={form.locationText || 'Missing location'} />
                  <SummaryRow label="Reporter" value={form.reporterName || 'Missing name'} />
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="mt-4 rounded-[16px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{error}</p>
        ) : null}

        <div className="mt-5 grid gap-2.5 border-t border-[var(--line)] pt-4">
          {step < steps.length - 1 ? (
            <button type="button" onClick={goNext} className="app-btn btn-primary">
              Continue <FiArrowRight aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : (
            <Button type="submit" disabled={isLoading}>
              <FiSend aria-hidden="true" className="h-4 w-4" />
              {isLoading ? 'Submitting...' : 'Submit report'}
            </Button>
          )}
          {step > 0 ? (
            <button type="button" onClick={goBack} className="app-btn btn-outline">
              <FiArrowLeft aria-hidden="true" className="h-4 w-4" /> Back
            </button>
          ) : null}
        </div>
      </Card>
    </form>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="menu-item">
      <span className="mi-tx">
        <span className="!mt-0 text-[11px] font-extrabold uppercase tracking-[0.12em]">{label}</span>
        <b className="mt-0.5 break-words">{value}</b>
      </span>
    </div>
  );
}
