'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/format';

const statusSteps = ['SUBMITTED', 'REVIEWING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

type TrackedReport = {
  referenceCode: string;
  title: string;
  description: string;
  locationText: string;
  status: string;
  priority: string;
  submittedAt: string;
  category: { name: string };
  department: { name: string } | null;
  attachments: Array<{ id: string; imageUrl: string }>;
  updates: Array<{
    id: string;
    status: string;
    message: string;
    createdAt: string;
  }>;
};

function niceLabel(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getProgress(status: string) {
  if (status === 'REJECTED') return 100;
  const index = statusSteps.indexOf(status);
  return index >= 0 ? Math.round(((index + 1) / statusSteps.length) * 100) : 20;
}

export function TrackReport({ tenantSlug, initialReference }: { tenantSlug: string; initialReference?: string }) {
  const [referenceCode, setReferenceCode] = useState(initialReference || '');
  const [report, setReport] = useState<TrackedReport | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const progress = useMemo(() => (report ? getProgress(report.status) : 0), [report]);

  async function loadReport(nextReference = referenceCode) {
    const cleanReference = nextReference.trim();

    if (!cleanReference) {
      return;
    }

    setIsLoading(true);
    setError('');
    setReport(null);

    const response = await fetch(`/api/tenant/${tenantSlug}/reports/${encodeURIComponent(cleanReference)}`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Report was not found.');
      setIsLoading(false);
      return;
    }

    setReport(payload.data);
    setIsLoading(false);
  }

  useEffect(() => {
    if (initialReference) {
      loadReport(initialReference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReference]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loadReport();
  }

  return (
    <div className="grid gap-6">
      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <label className="input-label">Reference number</label>
            <Input required value={referenceCode} onChange={(event) => setReferenceCode(event.target.value)} placeholder="SPC-2026-0001" />
          </div>
          <Button disabled={isLoading}>{isLoading ? 'Searching...' : 'Track request'}</Button>
        </form>
        {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-800 ring-1 ring-rose-200">{error}</p> : null}
      </Card>

      {report ? (
        <Card>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{report.referenceCode}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">{report.title}</h2>
              <p className="mt-2 text-sm font-medium text-slate-600">Submitted {formatDate(report.submittedAt)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge value={report.status} />
              <Badge value={report.priority} />
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-700">Progress</p>
              <p className="text-sm font-extrabold text-slate-950">{progress}%</p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
              <div className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-teal-400" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-5">
              {statusSteps.map((step) => {
                const isActive = statusSteps.indexOf(step) <= statusSteps.indexOf(report.status);
                return (
                  <div key={step} className={`rounded-xl border px-3 py-2 text-center text-xs font-bold ${isActive ? 'border-blue-200 bg-white text-[var(--brand)]' : 'border-slate-200 bg-white/70 text-slate-400'}`}>
                    {niceLabel(step)}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoCard label="Category" value={report.category.name} />
            <InfoCard label="Department" value={report.department?.name || 'Not assigned yet'} />
            <InfoCard label="Location" value={report.locationText} />
          </div>

          <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm font-medium leading-7 text-slate-600">{report.description}</p>

          {report.attachments.length > 0 ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {report.attachments.map((attachment) => (
                <a key={attachment.id} href={attachment.imageUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <img src={attachment.imageUrl} alt="Report attachment" className="h-56 w-full object-cover" />
                </a>
              ))}
            </div>
          ) : null}

          <div className="mt-8">
            <h3 className="text-lg font-extrabold text-slate-950">Update trail</h3>
            <div className="mt-4 grid gap-3">
              {report.updates.map((update, index) => (
                <div key={update.id} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[auto_1fr]">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-extrabold text-slate-700">{report.updates.length - index}</div>
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge value={update.status} />
                      <p className="text-xs font-bold text-slate-500">{formatDate(update.createdAt)}</p>
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{update.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold text-slate-950">{value}</p>
    </div>
  );
}
