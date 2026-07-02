'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    return <Card className="bg-white/90 text-sm font-bold text-slate-600 shadow-xl">Loading your citizen dashboard...</Card>;
  }

  if (error) {
    return <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{error}</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-6 shadow-sm md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="section-eyebrow">Citizen dashboard</p>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-5xl">Hi, {data.citizen.name}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Track your reports, see public updates, and continue helping your city improve one request at a time.
            </p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Citizen status</p>
            <p className="mt-2 text-xl font-bold text-[var(--brand)]">{level}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total reports" value={data.stats.total} />
        <StatCard label="Active reports" value={data.stats.active} />
        <StatCard label="Resolved" value={data.stats.resolved} />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Need to submit a new concern?</p>
          <p className="text-sm text-slate-500">Your account details will be attached automatically.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={`/${tenantSlug}/report`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-sm">New Report</Link>
          <button onClick={logout} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm">Logout</button>
        </div>
      </div>

      <section className="grid gap-4">
        <div>
          <p className="section-eyebrow">My reports</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Report history</h2>
        </div>

        {data.reports.length === 0 ? (
          <Card className="text-center shadow-md shadow-slate-900/[0.04]">
            <p className="text-lg font-bold text-slate-950">No reports yet.</p>
            <p className="mt-2 text-sm text-slate-500">Submit your first city concern and it will appear here.</p>
            <Link href={`/${tenantSlug}/report`} className="mt-5 inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white">Submit First Report</Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {data.reports.map((report) => {
              const latestUpdate = report.updates[0];
              const progress = getProgress(report.status);

              return (
                <Card key={report.id} className="shadow-sm shadow-slate-900/[0.04]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{report.referenceCode}</p>
                      <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{report.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{report.category.name} • {report.locationText}</p>
                      <p className="mt-1 text-xs font-medium text-slate-400">Submitted {formatDate(report.submittedAt)}</p>
                    </div>
                    <Badge value={report.status} />
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-700">{formatStatus(report.status)}</p>
                      <p className="text-sm font-bold text-slate-950">{progress}%</p>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  {latestUpdate ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Latest update</p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{latestUpdate.message}</p>
                      <p className="mt-2 text-xs font-medium text-slate-400">{formatDate(latestUpdate.createdAt)}</p>
                    </div>
                  ) : null}

                  <Link href={`/${tenantSlug}/track?reference=${encodeURIComponent(report.referenceCode)}`} className="mt-5 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
    </div>
  );
}
