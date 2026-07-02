'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { formatDate, formatStatus } from '@/lib/format';

const statusSteps = ['SUBMITTED', 'REVIEWING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

type Citizen = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

type CitizenReport = {
  id: string;
  referenceCode: string;
  title: string;
  description: string;
  locationText: string;
  status: string;
  priority: string;
  submittedAt: string;
  category: { name: string };
  department: { name: string } | null;
  updates: Array<{
    id: string;
    status: string;
    message: string;
    createdAt: string;
  }>;
};

type DashboardPayload = {
  citizen: Citizen;
  reports: CitizenReport[];
  stats: {
    total: number;
    active: number;
    resolved: number;
  };
};

function getProgress(status: string) {
  if (status === 'REJECTED') {
    return 100;
  }

  const index = statusSteps.indexOf(status);
  return index >= 0 ? Math.round(((index + 1) / statusSteps.length) * 100) : 20;
}

export function CitizenDashboard({ tenantSlug }: { tenantSlug: string }) {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const level = useMemo(() => {
    const total = data?.stats.total || 0;
    if (total >= 10) return 'Active Citizen';
    if (total >= 5) return 'Community Helper';
    if (total >= 1) return 'First Report Submitted';
    return 'New Citizen';
  }, [data]);

  async function loadDashboard() {
    setIsLoading(true);
    setError('');

    const response = await fetch(`/api/tenant/${tenantSlug}/citizens/reports`);
    const payload = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = `/${tenantSlug}/login`;
        return;
      }

      setError(payload.error || 'Unable to load your dashboard.');
      setIsLoading(false);
      return;
    }

    setData(payload.data);
    setIsLoading(false);
  }

  async function logout() {
    await fetch(`/api/tenant/${tenantSlug}/citizens/logout`, { method: 'POST' });
    window.location.href = `/${tenantSlug}/login`;
  }

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return <Card className="text-sm font-extrabold text-slate-600">Loading your citizen dashboard...</Card>;
  }

  if (error) {
    return <p className="rounded-2xl bg-rose-50 p-4 text-sm font-extrabold text-rose-800 ring-1 ring-rose-200">{error}</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-[2rem] p-6 md:p-8 premium-card">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-100/80 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="section-eyebrow">Citizen dashboard</p>
            <h1 className="heading-display mt-4 text-4xl md:text-6xl">Hi, {data.citizen.name}</h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-600">
              Track your reports, see public updates, and continue helping your city improve one request at a time.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-slate-200 bg-white/82 p-5 text-center shadow-[0_12px_30px_rgba(16,32,51,0.06)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Citizen status</p>
            <p className="mt-2 text-xl font-black text-[var(--brand)]">{level}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total reports" value={data.stats.total} />
        <StatCard label="Active reports" value={data.stats.active} />
        <StatCard label="Resolved" value={data.stats.resolved} />
      </div>

      <div className="flex flex-col gap-3 rounded-[1.5rem] p-4 sm:flex-row sm:items-center sm:justify-between premium-card-subtle">
        <div>
          <p className="text-sm font-black text-slate-900">Need to submit a new concern?</p>
          <p className="text-sm font-medium text-slate-500">Your account details will be attached automatically.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/${tenantSlug}/report`} className="inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold btn-primary">New Report</Link>
          <button onClick={logout} className="inline-flex min-h-11 items-center justify-center rounded-2xl px-5 py-3 text-sm font-extrabold btn-secondary">Logout</button>
        </div>
      </div>

      <section className="grid gap-4">
        <div>
          <p className="section-eyebrow">My reports</p>
          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-900">Report history</h2>
        </div>

        {data.reports.length === 0 ? (
          <Card className="text-center">
            <p className="text-lg font-black text-slate-900">No reports yet.</p>
            <p className="mt-2 text-sm font-medium text-slate-500">Submit your first city concern and it will appear here.</p>
            <Link href={`/${tenantSlug}/report`} className="mt-5 inline-flex rounded-2xl px-5 py-3 text-sm font-extrabold btn-primary">Submit First Report</Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {data.reports.map((report) => {
              const latestUpdate = report.updates[0];
              const progress = getProgress(report.status);

              return (
                <Card key={report.id}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{report.referenceCode}</p>
                      <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-slate-900">{report.title}</h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{report.category.name} • {report.locationText}</p>
                      <p className="mt-1 text-xs font-black text-slate-400">Submitted {formatDate(report.submittedAt)}</p>
                    </div>
                    <Badge value={report.status} />
                  </div>

                  <div className="mt-5 rounded-[1.4rem] border border-slate-200 bg-white/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-extrabold text-slate-700">{formatStatus(report.status)}</p>
                      <p className="text-sm font-black text-slate-900">{progress}%</p>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-cyan-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {latestUpdate ? (
                    <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-white/75 p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Latest update</p>
                      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{latestUpdate.message}</p>
                      <p className="mt-2 text-xs font-black text-slate-400">{formatDate(latestUpdate.createdAt)}</p>
                    </div>
                  ) : null}

                  <Link href={`/${tenantSlug}/track?reference=${encodeURIComponent(report.referenceCode)}`} className="mt-5 inline-flex rounded-2xl px-4 py-2 text-sm font-extrabold btn-secondary">
                    Open tracker
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/88 p-5 shadow-[0_12px_30px_rgba(16,32,51,0.06)]">
      <p className="text-3xl font-black tracking-[-0.03em] text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">{label}</p>
    </div>
  );
}
