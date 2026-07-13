'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiLogOut,
  FiMail,
  FiMapPin,
  FiMessageSquare,
  FiPhone,
  FiPlus,
  FiRefreshCw,
  FiShield
} from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
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
    <div>
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="skeleton-line w-24" />
          <div className="mt-3 skeleton-line h-5 w-40" />
        </div>
        <div className="skeleton-line h-[46px] w-[46px] shrink-0" />
      </div>
      <div className="stat-grid mt-4">
        {[1, 2].map((item) => (
          <div key={item} className="app-stat">
            <div className="skeleton-line h-6 w-12" />
            <div className="mt-3 skeleton-line w-20" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-3">
        {[1, 2].map((item) => (
          <div key={item} className="card">
            <div className="skeleton-line w-28" />
            <div className="mt-3 skeleton-line h-5 w-3/4" />
            <div className="mt-3 skeleton-line w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyReports({ tenantSlug }: { tenantSlug: string }) {
  return (
    <div className="empty">
      <div className="eart">
        <FiFileText aria-hidden="true" className="h-8 w-8" />
      </div>
      <h3>No reports yet</h3>
      <p>Submit your first city concern and track status, updates, and receipts right here.</p>
      <Link href={`/${tenantSlug}/report`} className="app-btn btn-ember mt-5 px-6">
        <FiPlus aria-hidden="true" className="h-4 w-4" /> Submit first report
      </Link>
    </div>
  );
}

function ReportCard({ report, tenantSlug }: { report: CitizenReport; tenantSlug: string }) {
  const latestUpdate = report.updates[0];
  const progress = getProgress(report.status);

  return (
    <article className="card">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate pt-0.5 text-xs font-semibold text-[var(--muted)]">
          {report.referenceCode} · {report.category.name}
        </p>
        <Badge value={report.status} />
      </div>

      <h3 className="mt-2 font-display text-base font-bold tracking-[-0.01em] text-[var(--ink)]">{report.title}</h3>
      <p className="mt-1.5 flex items-start gap-1.5 text-[13px] leading-5 text-[var(--ink-2)]">
        <FiMapPin aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[var(--muted)]" />
        <span className="min-w-0">{report.locationText}</span>
      </p>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <p className="font-semibold text-[var(--ink-2)]">{formatStatus(report.status)}</p>
          <p className="font-bold text-[var(--ink)]">{progress}%</p>
        </div>
        <div className="heatbar mt-2">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>

      {latestUpdate ? (
        <div className="mt-4 rounded-[14px] bg-[var(--surface-2)] p-3.5">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            <FiMessageSquare aria-hidden="true" className="h-3.5 w-3.5" /> Latest update
          </div>
          <p className="mt-1.5 text-[13px] leading-5 text-[var(--ink-2)]">{latestUpdate.message}</p>
          <p className="mt-1.5 text-[11.5px] font-semibold text-[var(--muted)]">{formatDate(latestUpdate.createdAt)}</p>
        </div>
      ) : null}

      <p className="mt-4 text-xs font-semibold text-[var(--muted)]">Submitted {formatDate(report.submittedAt)}</p>
      <Link
        href={`/${tenantSlug}/track?reference=${encodeURIComponent(report.referenceCode)}`}
        className="app-btn btn-outline btn-compact btn-block mt-3"
      >
        Open tracker <FiChevronRight aria-hidden="true" className="h-4 w-4" />
      </Link>
    </article>
  );
}

export function CitizenDashboard({
  tenantSlug,
  cityEmail = null,
  cityPhone = null
}: {
  tenantSlug: string;
  cityEmail?: string | null;
  cityPhone?: string | null;
}) {
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return <div className="rounded-[14px] bg-[var(--ember-soft)] px-4 py-3 text-sm font-semibold text-[var(--ember-600)]">{error}</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-[var(--muted)]">Welcome back,</p>
          <p className="truncate font-display text-[21px] font-bold tracking-[-0.01em] text-[var(--ink)]">
            {data.citizen.name.split(' ')[0]}
          </p>
        </div>
        <div className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-[15px] bg-gradient-to-br from-[var(--navy)] to-[var(--navy-900)] font-display text-[17px] font-bold text-white shadow-[0_8px_18px_rgba(26,73,123,0.3)]">
          {getInitials(data.citizen.name)}
        </div>
      </div>

      <div className="stat-grid mt-4">
        <StatCard label="Active reports" value={data.stats.active} icon={<FiClock />} />
        <StatCard label="Resolved" value={data.stats.resolved} icon={<FiCheckCircle />} />
        <StatCard label="Total reports" value={data.stats.total} icon={<FiFileText />} />
      </div>

      <div className="section-head">
        <h3>Quick actions</h3>
      </div>
      <nav className="menu-group">
        <Link href={`/${tenantSlug}/report`} className="menu-item">
          <span className="mi-ic">
            <FiPlus aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="mi-tx">
            <b>New report</b>
            <span>Submit a concern with location and photo</span>
          </span>
          <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
        </Link>
        <Link href={`/${tenantSlug}/payments`} className="menu-item">
          <span className="mi-ic">
            <FiShield aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="mi-tx">
            <b>Payments & donations</b>
            <span>Receipts with public proof</span>
          </span>
          <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
        </Link>
        <a href={`/api/tenant/${tenantSlug}/payments/income-certificate`} className="menu-item" target="_blank" rel="noreferrer">
          <span className="mi-ic">
            <FiFileText aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="mi-tx">
            <b>Payment certificate</b>
            <span>Export verified payment history</span>
          </span>
          <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
        </a>
        <Link href={`/${tenantSlug}/track`} className="menu-item">
          <span className="mi-ic">
            <FiRefreshCw aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="mi-tx">
            <b>Track request</b>
            <span>Look up status by reference number</span>
          </span>
          <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
        </Link>
      </nav>

      <div className="section-head">
        <h3>My reports</h3>
        <Link href={`/${tenantSlug}/report`}>New report</Link>
      </div>
      {data.reports.length === 0 ? (
        <EmptyReports tenantSlug={tenantSlug} />
      ) : (
        <div className="grid gap-3">
          {data.reports.map((report) => (
            <ReportCard key={report.id} report={report} tenantSlug={tenantSlug} />
          ))}
        </div>
      )}

      <p className="group-label mt-6">Account</p>
      <div className="menu-group">
        <div className="menu-item">
          <span className="mi-ic">
            <FiMail aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="mi-tx">
            <b>Email</b>
            <span className="break-all">{data.citizen.email}</span>
          </span>
        </div>
        <div className="menu-item">
          <span className="mi-ic">
            <FiPhone aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="mi-tx">
            <b>Phone</b>
            <span>{data.citizen.phone || 'Not provided'}</span>
          </span>
        </div>
        <button type="button" onClick={logout} className="menu-item">
          <span className="mi-ic" style={{ background: 'var(--ember-soft)', color: 'var(--ember-600)' }}>
            <FiLogOut aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="mi-tx">
            <b className="text-[var(--ember-600)]">Sign out</b>
            <span>End this session on this device</span>
          </span>
          <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
        </button>
      </div>

      {cityEmail || cityPhone ? (
        <>
          <p className="group-label">City contact</p>
          <div className="menu-group">
            {cityEmail ? (
              <a href={`mailto:${cityEmail}`} className="menu-item">
                <span className="mi-ic">
                  <FiMail aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="mi-tx">
                  <b>Email the city</b>
                  <span className="break-all">{cityEmail}</span>
                </span>
                <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
              </a>
            ) : null}
            {cityPhone ? (
              <a href={`tel:${cityPhone}`} className="menu-item">
                <span className="mi-ic">
                  <FiPhone aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="mi-tx">
                  <b>Call the city</b>
                  <span>{cityPhone}</span>
                </span>
                <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
              </a>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
