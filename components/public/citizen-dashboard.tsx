'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiLogOut,
  FiMapPin,
  FiMessageSquare,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
  FiUser
} from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
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
  if (status === 'REJECTED') return 100;
  const index = statusSteps.indexOf(status);
  return index >= 0 ? Math.round(((index + 1) / statusSteps.length) * 100) : 20;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CC';
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-5">
      <div className="dashboard-card p-6">
        <div className="skeleton-line w-32" />
        <div className="mt-5 skeleton-line h-9 w-2/3" />
        <div className="mt-4 skeleton-line w-1/2" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="dashboard-card p-5">
            <div className="skeleton-line h-8 w-16" />
            <div className="mt-3 skeleton-line w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyReports({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div className="dashboard-empty">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
        <FiFileText className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-extrabold tracking-[-0.02em] text-slate-950">No reports yet</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        Submit your first city concern and this dashboard will become your personal tracker for status, updates, and receipts.
      </p>
      <Link href={`/${tenantSlug}/report`} className="mt-5 inline-flex rounded-xl px-4 py-2.5 text-sm font-bold btn-primary">
        Submit first report
      </Link>
    </div>
  );
}

function ReportCard({ report, tenantSlug }: { report: CitizenReport; tenantSlug: string }) {
  const latestUpdate = report.updates[0];
  const progress = getProgress(report.status);

  return (
    <article className="dashboard-card p-4 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_38px_rgba(37,99,235,0.10)] md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-slate-600">{report.referenceCode}</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[0.7rem] font-bold text-blue-700 ring-1 ring-blue-100">{report.category.name}</span>
          </div>
          <h3 className="mt-3 text-lg font-extrabold tracking-[-0.025em] text-slate-950 md:text-xl">{report.title}</h3>
          <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
            <FiMapPin className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
            <span>{report.locationText}</span>
          </p>
        </div>
        <Badge value={report.status} />
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-700">{formatStatus(report.status)}</p>
          <p className="text-sm font-extrabold text-slate-950">{progress}%</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-teal-400 transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1">
          {statusSteps.map((step) => (
            <span key={step} className={`h-1 rounded-full ${statusSteps.indexOf(step) < Math.ceil((progress / 100) * statusSteps.length) ? 'bg-blue-500' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      {latestUpdate ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.10em] text-slate-500">
            <FiMessageSquare className="h-4 w-4" /> Latest update
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{latestUpdate.message}</p>
          <p className="mt-2 text-xs font-semibold text-slate-400">{formatDate(latestUpdate.createdAt)}</p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold text-slate-500">Submitted {formatDate(report.submittedAt)}</p>
        <Link href={`/${tenantSlug}/track?reference=${encodeURIComponent(report.referenceCode)}`} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold btn-secondary">
          Open tracker <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function CitizenDashboard({ tenantSlug }: { tenantSlug: string }) {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

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

  const activeReports = useMemo(() => data?.reports.filter((report) => report.status !== 'RESOLVED' && report.status !== 'REJECTED') || [], [data?.reports]);
  const latestReport = data?.reports[0];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-800 ring-1 ring-rose-200">{error}</p>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-6">
      <section className="dashboard-card overflow-hidden p-0">
        <div className="grid gap-0 lg:grid-cols-[1fr_22rem]">
          <div className="p-5 md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="dashboard-kicker">Citizen dashboard</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 md:text-5xl">Welcome back, {data.citizen.name.split(' ')[0]}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                  A single place to follow your requests, read official updates, and keep verified receipts connected to your account.
                </p>
              </div>
              <button onClick={logout} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold btn-secondary">
                <FiLogOut className="h-4 w-4" /> Sign out
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link href={`/${tenantSlug}/report`} className="group rounded-2xl border border-blue-100 bg-blue-50/80 p-4 transition hover:-translate-y-0.5 hover:bg-blue-50">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white"><FiPlus /></div>
                <p className="mt-3 font-extrabold text-slate-950">New report</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">Submit a concern with location and photo proof.</p>
              </Link>
              <Link href={`/${tenantSlug}/payments`} className="group rounded-2xl border border-teal-100 bg-teal-50/70 p-4 transition hover:-translate-y-0.5 hover:bg-teal-50">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white"><FiShield /></div>
                <p className="mt-3 font-extrabold text-slate-950">Pay service fee</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">Create a Stellar-verifiable payment receipt.</p>
              </Link>
              <Link href={`/${tenantSlug}/track`} className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-blue-200">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700"><FiRefreshCw /></div>
                <p className="mt-3 font-extrabold text-slate-950">Track request</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">Look up status by reference number.</p>
              </Link>
            </div>
          </div>

          <aside className="border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0 md:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-teal-500 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(37,99,235,0.20)]">
                {getInitials(data.citizen.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-extrabold text-slate-950">{data.citizen.name}</p>
                <p className="truncate text-sm font-medium text-slate-500">{data.citizen.email}</p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-[0.10em] text-slate-500">Current activity</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">{activeReports.length}</p>
                <p className="mt-1 text-sm text-slate-500">open requests requiring city action</p>
              </div>
              {latestReport ? (
                <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
                  <p className="text-xs font-bold uppercase tracking-[0.10em] text-slate-500">Latest request</p>
                  <p className="mt-2 font-extrabold text-slate-950">{latestReport.title}</p>
                  <p className="mt-1 text-sm text-slate-500">{formatStatus(latestReport.status)}</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total reports" value={data.stats.total} icon={<FiFileText />} />
        <StatCard label="Active reports" value={data.stats.active} icon={<FiClock />} />
        <StatCard label="Resolved" value={data.stats.resolved} icon={<FiCheckCircle />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="grid gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="dashboard-kicker">My requests</p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-slate-950 md:text-3xl">Report history</h2>
            </div>
            <Link href={`/${tenantSlug}/report`} className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold btn-primary">
              <FiPlus className="h-4 w-4" /> New report
            </Link>
          </div>

          {data.reports.length === 0 ? <EmptyReports tenantSlug={tenantSlug} /> : data.reports.map((report) => <ReportCard key={report.id} report={report} tenantSlug={tenantSlug} />)}
        </section>

        <aside className="grid h-fit gap-4 lg:sticky lg:top-6">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-blue-700">
              <FiTrendingUp className="h-5 w-5" />
              <p className="dashboard-kicker">Next best action</p>
            </div>
            <h3 className="mt-3 dashboard-section-title">Keep every request traceable</h3>
            <p className="mt-2 dashboard-section-copy">Use the tracker link when following up with city staff. It keeps the reference number, timeline, and public updates in one place.</p>
            <Link href={`/${tenantSlug}/track`} className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold btn-secondary">
              Open tracker <FiArrowRight className="h-4 w-4" />
            </Link>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-teal-700">
              <FiUser className="h-5 w-5" />
              <p className="dashboard-kicker text-teal-700">Account</p>
            </div>
            <dl className="mt-4 grid gap-3 text-sm">
              <div>
                <dt className="font-bold text-slate-500">Email</dt>
                <dd className="mt-1 break-all font-semibold text-slate-900">{data.citizen.email}</dd>
              </div>
              <div>
                <dt className="font-bold text-slate-500">Phone</dt>
                <dd className="mt-1 font-semibold text-slate-900">{data.citizen.phone || 'Not provided'}</dd>
              </div>
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}
