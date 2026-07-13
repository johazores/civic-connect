'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  FiCheck,
  FiChevronRight,
  FiCopy,
  FiCreditCard,
  FiDroplet,
  FiExternalLink,
  FiFileText,
  FiFilter,
  FiGrid,
  FiLogOut,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiSettings,
  FiShield,
  FiX
} from 'react-icons/fi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';
import { StellarProgramsDashboard } from '@/components/admin/stellar-programs-dashboard';
import { formatDate } from '@/lib/format';

const reportStatuses = ['SUBMITTED', 'REVIEWING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const reportPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const mainTabs = ['reports', 'payments', 'stellar-programs', 'content', 'settings'] as const;
const contentTabs = ['services', 'hotlines', 'news', 'categories', 'departments', 'users'] as const;

type MainTab = (typeof mainTabs)[number];
type ContentTab = (typeof contentTabs)[number];

type TenantSettings = {
  id: string;
  slug: string;
  name: string;
  cityName: string;
  tagline: string;
  description: string;
  address: string | null;
  email: string | null;
  phone: string | null;
  primaryColor: string;
  stellarReceivingPublicKey: string | null;
  stellarNetwork: string;
  stellarNetworkPassphrase: string;
  stellarHorizonUrl: string;
  stellarFriendbotUrl: string;
  stellarDefaultAssetCode: string;
  stellarDefaultAssetIssuer: string | null;
  stellarWalletStatus: string;
  stellarWalletLastCheckedAt: string | null;
  stellarWalletLastFundedAt: string | null;
  stellarWalletError: string | null;
};

type AdminReport = {
  id: string;
  referenceCode: string;
  reporterName: string;
  reporterEmail: string | null;
  reporterPhone: string | null;
  title: string;
  description: string;
  locationText: string;
  status: string;
  priority: string;
  submittedAt: string;
  category: { id: string; name: string };
  department: { id: string; name: string } | null;
  attachments: Array<{ id: string; imageUrl: string }>;
  updates: Array<{
    id: string;
    status: string;
    message: string;
    isPublic: boolean;
    createdAt: string;
  }>;
};

type Category = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

type Department = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
};

type Stats = {
  total: number;
  submitted: number;
  reviewing: number;
  assigned: number;
  inProgress: number;
  resolved: number;
  urgent: number;
  unassigned: number;
};

type ContentItem = Record<string, string | number | boolean | null> & { id: string };

type FormField = {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'checkbox' | 'date' | 'select' | 'password';
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
};

const emptyStats: Stats = {
  total: 0,
  submitted: 0,
  reviewing: 0,
  assigned: 0,
  inProgress: 0,
  resolved: 0,
  urgent: 0,
  unassigned: 0
};

const contentConfig: Record<ContentTab, { label: string; endpoint: string; listUrl?: string; fields: FormField[]; empty: ContentItem }> = {
  services: {
    label: 'Services',
    endpoint: 'services',
    listUrl: 'services?includeInactive=true',
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'department', label: 'Department label' },
      { name: 'linkUrl', label: 'Link URL' },
      { name: 'sortOrder', label: 'Sort order', type: 'number' },
      { name: 'serviceKind', label: 'Service kind', type: 'select', options: ['STANDARD', 'DONATION', 'MEMBERSHIP', 'CAMPAIGN'] },
      { name: 'campaignGoalAmount', label: 'Campaign goal amount', type: 'number' },
      { name: 'paymentRequired', label: 'Collect online payment', type: 'checkbox' },
      { name: 'feeAmount', label: 'Payment amount', type: 'number' },
      { name: 'feeAssetCode', label: 'Payment currency (XLM or USDC)' },
      { name: 'feeAssetIssuer', label: 'Token issuer address' },
      { name: 'receivingPublicKey', label: 'Where this service payment goes' },
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    empty: { id: '', title: '', description: '', department: '', linkUrl: '', sortOrder: 0, serviceKind: 'STANDARD', campaignGoalAmount: 0, paymentRequired: false, feeAmount: 0, feeAssetCode: 'XLM', feeAssetIssuer: '', receivingPublicKey: '', isActive: true }
  },
  hotlines: {
    label: 'Hotlines',
    endpoint: 'hotlines',
    listUrl: 'hotlines?includeInactive=true',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'phone', label: 'Phone', required: true },
      { name: 'sortOrder', label: 'Sort order', type: 'number' },
      { name: 'isEmergency', label: 'Emergency hotline', type: 'checkbox' },
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    empty: { id: '', name: '', description: '', phone: '', sortOrder: 0, isEmergency: false, isActive: true }
  },
  news: {
    label: 'News',
    endpoint: 'news',
    listUrl: 'news?includeUnpublished=true',
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', required: true },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'imageUrl', label: 'Image URL' },
      { name: 'publishedAt', label: 'Publish date', type: 'date' },
      { name: 'isPublished', label: 'Published', type: 'checkbox' }
    ],
    empty: { id: '', title: '', excerpt: '', content: '', imageUrl: '', publishedAt: '', isPublished: true }
  },
  categories: {
    label: 'Report Categories',
    endpoint: 'categories',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    empty: { id: '', name: '', description: '', isActive: true }
  },
  departments: {
    label: 'Departments',
    endpoint: 'departments',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'email', label: 'Email' },
      { name: 'phone', label: 'Phone' },
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    empty: { id: '', name: '', email: '', phone: '', isActive: true }
  },
  users: {
    label: 'Staff Users',
    endpoint: 'users',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'email', label: 'Email', required: true },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'role', label: 'Role', type: 'select', options: [
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Staff', value: 'STAFF' }
      ] },
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    empty: { id: '', name: '', email: '', password: '', role: 'STAFF', isActive: true }
  }
};

function niceLabel(value: string) {
  return value.replaceAll('-', ' ').replaceAll('_', ' ');
}

function toInputDate(value: unknown) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  return value.slice(0, 10);
}

const adminTabMeta: Record<MainTab, { label: string; title: string; description: string }> = {
  reports: {
    label: 'Reports',
    title: 'Report operations',
    description: 'Triage reports and keep the queue moving'
  },
  payments: {
    label: 'Payments',
    title: 'Service payments',
    description: 'Verify fee intents and receipts'
  },
  'stellar-programs': {
    label: 'Civic trust',
    title: 'Civic programs',
    description: 'Rewards, public records, and tax receipts'
  },
  content: {
    label: 'Content',
    title: 'Content studio',
    description: 'Services, hotlines, news, and staff'
  },
  settings: {
    label: 'Settings',
    title: 'Workspace settings',
    description: 'Profile, wallet, and approvals'
  }
};

function AdminTabIcon({ tab }: { tab: MainTab }) {
  const className = 'h-6 w-6 shrink-0';
  if (tab === 'reports') return <FiFileText aria-hidden="true" className={className} />;
  if (tab === 'payments') return <FiCreditCard aria-hidden="true" className={className} />;
  if (tab === 'stellar-programs') return <FiShield aria-hidden="true" className={className} />;
  if (tab === 'content') return <FiGrid aria-hidden="true" className={className} />;
  return <FiSettings aria-hidden="true" className={className} />;
}

function createFilterParams(filters: Record<string, string>) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  return params;
}

/* ---------------------------------------------------------------------------
   In-frame bottom sheet helpers (absolute inside .civic-app-frame — never fixed)
--------------------------------------------------------------------------- */

const SHEET_CLOSE_MS = 320;

function useSheet() {
  const [state, setState] = useState<'closed' | 'open' | 'closing'>('closed');
  const timer = useRef<number | undefined>(undefined);

  const open = useCallback(() => {
    window.clearTimeout(timer.current);
    setState('open');
  }, []);

  const close = useCallback(() => {
    setState('closing');
    timer.current = window.setTimeout(() => setState('closed'), SHEET_CLOSE_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return {
    isOpen: state !== 'closed',
    anim: state === 'closing' ? 'out' : 'in',
    open,
    close
  };
}

function BottomSheet({
  title,
  sub,
  anim,
  onClose,
  children
}: {
  title: string;
  sub?: string;
  anim: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <>
      <button type="button" className={`sheet-backdrop backdrop-${anim}`} onClick={onClose} aria-label="Close" tabIndex={-1} />
      <div className={`sheet sheet-${anim}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grab" />
        <div className="sheet-head">
          <div className="min-w-0">
            <h2 className="truncate">{title}</h2>
            {sub ? <p className="sheet-sub truncate">{sub}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="app-icon-btn" aria-label="Close">
            <FiX aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <div className="sheet-scroll">{children}</div>
      </div>
    </>
  );
}

function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return <p className="rounded-[14px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{message}</p>;
}

function SuccessBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-[14px] bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] p-4 text-sm font-semibold leading-5 text-[#0f806d]">
      {message}
    </p>
  );
}

function InfoRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="menu-item">
      <span className="mi-tx">
        <span className="!mt-0 text-[11px] font-extrabold uppercase tracking-[0.12em]">{label}</span>
        <b className="mt-0.5 break-words">{value}</b>
        {note ? <span className="mt-0.5 break-words">{note}</span> : null}
      </span>
    </div>
  );
}

function SwitchRow({ label, sub, checked, onToggle }: { label: string; sub?: string; checked: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="flex min-h-[48px] w-full items-center justify-between gap-3 text-left"
    >
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold text-[var(--ink-2)]">{label}</span>
        {sub ? <span className="mt-0.5 block text-xs font-medium leading-4 text-[var(--muted)]">{sub}</span> : null}
      </span>
      <span className={`switch ${checked ? 'on' : ''}`.trim()} aria-hidden="true" />
    </button>
  );
}

/* ---------------------------------------------------------------------------
   Admin dashboard — phone app shell (appbar + viewport + admin tab bar)
--------------------------------------------------------------------------- */

export function AdminDashboard({ tenantSlug, initialTenantName }: { tenantSlug: string; initialTenantName?: string }) {
  const [activeTab, setActiveTab] = useState<MainTab>('reports');
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [categories, setCategories] = useState<Category[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tenant, setTenant] = useState<TenantSettings | null>(null);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [status, setStatus] = useState('REVIEWING');
  const [priority, setPriority] = useState('NORMAL');
  const [departmentId, setDepartmentId] = useState('');
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: 'ALL', categoryId: 'ALL', departmentId: 'ALL', priority: 'ALL' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const filterSheet = useSheet();
  const reportSheet = useSheet();

  const selectedReport = useMemo(() => {
    return reports.find((report) => report.id === selectedReportId) || reports[0] || null;
  }, [reports, selectedReportId]);

  async function loadReports(nextFilters = filters) {
    setIsLoading(true);
    setError('');

    const params = createFilterParams(nextFilters);

    const response = await fetch(`/api/tenant/${tenantSlug}/reports?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = `/${tenantSlug}/admin/login`;
        return;
      }

      setError(payload.error || 'Unable to load reports.');
      setIsLoading(false);
      return;
    }

    setReports(payload.data.reports);
    setStats(payload.data.stats);
    setCategories(payload.data.categories);
    setDepartments(payload.data.departments);
    setTenant(payload.data.tenant);

    const firstReport = payload.data.reports[0];
    setSelectedReportId((current) => current || firstReport?.id || '');

    if (firstReport && !selectedReportId) {
      setStatus(firstReport.status);
      setPriority(firstReport.priority);
      setDepartmentId(firstReport.department?.id || '');
    }

    setIsLoading(false);
  }

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedReport) {
      return;
    }

    setStatus(selectedReport.status);
    setPriority(selectedReport.priority);
    setDepartmentId(selectedReport.department?.id || '');
  }, [selectedReport]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = `/${tenantSlug}/admin/login`;
  }

  function updateFilters(name: string, value: string) {
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
  }

  async function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadReports(filters);
  }

  async function clearFilter(name: string) {
    const nextFilters = { ...filters, [name]: name === 'search' ? '' : 'ALL' };
    setFilters(nextFilters);
    await loadReports(nextFilters);
  }

  function exportReports() {
    const params = createFilterParams(filters);
    window.location.href = `/api/tenant/${tenantSlug}/reports/export?${params.toString()}`;
  }

  function openReport(report: AdminReport) {
    setError('');
    setSuccess('');
    setSelectedReportId(report.id);
    reportSheet.open();
  }

  async function handleStatusUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedReport) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    const response = await fetch(`/api/tenant/${tenantSlug}/reports/${encodeURIComponent(selectedReport.referenceCode)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        priority,
        departmentId: departmentId || null,
        message: message || `Report moved to ${niceLabel(status).toLowerCase()}.`,
        isPublic
      })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to update report.');
      setIsSaving(false);
      return;
    }

    setMessage('');
    setSuccess('Report updated successfully.');
    await loadReports(filters);
    setSelectedReportId(payload.data.id);
    setIsSaving(false);
  }

  const tenantName = tenant?.name || initialTenantName || 'CivicTrust';

  const activeFilterChips = [
    filters.status !== 'ALL' ? { key: 'status', label: niceLabel(filters.status) } : null,
    filters.categoryId !== 'ALL'
      ? { key: 'categoryId', label: categories.find((item) => item.id === filters.categoryId)?.name || 'Category' }
      : null,
    filters.departmentId !== 'ALL'
      ? {
          key: 'departmentId',
          label: filters.departmentId === 'UNASSIGNED' ? 'Unassigned' : departments.find((item) => item.id === filters.departmentId)?.name || 'Department'
        }
      : null,
    filters.priority !== 'ALL' ? { key: 'priority', label: `${niceLabel(filters.priority)} priority` } : null
  ].filter(Boolean) as Array<{ key: string; label: string }>;

  return (
    <div className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">{tenantName.slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0">
              <h1 className="appbar-title truncate">{adminTabMeta[activeTab].title}</h1>
              <p className="app-subtitle truncate">{adminTabMeta[activeTab].description}</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="app-icon-btn" aria-label="Sign out">
            <FiLogOut aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <main className="civic-viewport">
          <div className="page-section">
            {error || success ? (
              <div className="mb-4 grid gap-3">
                <ErrorBanner message={error} />
                <SuccessBanner message={success} />
              </div>
            ) : null}

            {activeTab === 'reports' ? (
              <section>
                <div className="stat-grid">
                  <StatCard label="Active" value={Math.max(0, stats.total - stats.resolved)} />
                  <StatCard label="Urgent" value={stats.urgent} />
                  <StatCard label="Resolved" value={stats.resolved} />
                  <StatCard label="Unassigned" value={stats.unassigned} />
                </div>

                <form onSubmit={applyFilters} className="mt-4 flex items-center gap-2.5">
                  <div className="searchbar min-w-0 flex-1">
                    <FiSearch aria-hidden="true" />
                    <input
                      value={filters.search}
                      onChange={(event) => updateFilters('search', event.target.value)}
                      placeholder="Search reference, name, issue"
                      aria-label="Search reports"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={filterSheet.open}
                    className="app-icon-btn"
                    style={{ width: 52, height: 52 }}
                    aria-label="Open report filters"
                  >
                    <FiFilter aria-hidden="true" className="h-5 w-5" />
                  </button>
                </form>

                {activeFilterChips.length > 0 ? (
                  <div className="hscroll -mx-5 mt-3">
                    {activeFilterChips.map((chip) => (
                      <button key={chip.key} type="button" onClick={() => clearFilter(chip.key)} className="chip on">
                        {chip.label}
                        <FiX aria-hidden="true" className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="section-head">
                  <h2>Report queue</h2>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={exportReports} className="min-h-[44px] px-2 text-[13px] font-bold text-[var(--ember)]">
                      Export CSV
                    </button>
                    <button type="button" onClick={() => loadReports(filters)} className="app-icon-btn" aria-label="Refresh reports">
                      <FiRefreshCw aria-hidden="true" className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="grid gap-2.5">
                    <div className="skeleton-line w-3/4" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line w-1/2" />
                  </div>
                ) : null}

                {!isLoading && reports.length === 0 ? (
                  <div className="empty">
                    <div className="eart">
                      <FiFileText aria-hidden="true" className="h-9 w-9" />
                    </div>
                    <h3>No reports found</h3>
                    <p>No reports match the current filters.</p>
                  </div>
                ) : null}

                <div className="grid gap-3">
                  {reports.map((report) => (
                    <button key={report.id} type="button" onClick={() => openReport(report)} className="app-feed-card w-full text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-extrabold uppercase tracking-[0.1em] text-[var(--muted)]">{report.referenceCode}</p>
                          <p className="mt-1.5 truncate font-display text-[15px] font-bold text-[var(--ink)]">{report.title}</p>
                        </div>
                        <Badge value={report.status} />
                      </div>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-bold text-[var(--ink-2)]">{report.category.name}</span>
                        <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-bold text-[var(--ink-2)]">{niceLabel(report.priority)}</span>
                        <span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[11px] font-bold text-[var(--ink-2)]">{report.department?.name || 'Unassigned'}</span>
                      </div>
                      <p className="mt-2 truncate text-[13px] font-medium text-[var(--muted)]">{report.locationText}</p>
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            {activeTab === 'payments' ? <PaymentDashboard tenantSlug={tenantSlug} /> : null}

            {activeTab === 'stellar-programs' ? <StellarProgramsDashboard tenantSlug={tenantSlug} /> : null}

            {activeTab === 'content' ? (
              <ContentStudio tenantSlug={tenantSlug} activeTab={activeTab} setError={setError} setSuccess={setSuccess} />
            ) : null}

            {activeTab === 'settings' ? (
              <TenantSettingsPanel tenantSlug={tenantSlug} tenant={tenant} setTenant={setTenant} setError={setError} setSuccess={setSuccess} />
            ) : null}
          </div>
        </main>

        <nav className="tabbar" aria-label="Admin navigation">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`tab ${activeTab === tab ? 'on' : ''}`.trim()}
              aria-current={activeTab === tab ? 'page' : undefined}
            >
              <AdminTabIcon tab={tab} />
              {adminTabMeta[tab].label}
            </button>
          ))}
        </nav>

        {filterSheet.isOpen ? (
          <BottomSheet title="Filter reports" sub="Narrow the report queue" anim={filterSheet.anim} onClose={filterSheet.close}>
            <form
              onSubmit={async (event) => {
                await applyFilters(event);
                filterSheet.close();
              }}
            >
              <div className="field">
                <label className="input-label" htmlFor="report-filter-status">Status</label>
                <Select id="report-filter-status" value={filters.status} onChange={(event) => updateFilters('status', event.target.value)}>
                  <option value="ALL">All statuses</option>
                  {reportStatuses.map((item) => (
                    <option key={item} value={item}>{niceLabel(item)}</option>
                  ))}
                </Select>
              </div>
              <div className="field">
                <label className="input-label" htmlFor="report-filter-category">Category</label>
                <Select id="report-filter-category" value={filters.categoryId} onChange={(event) => updateFilters('categoryId', event.target.value)}>
                  <option value="ALL">All categories</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </div>
              <div className="field">
                <label className="input-label" htmlFor="report-filter-department">Department</label>
                <Select id="report-filter-department" value={filters.departmentId} onChange={(event) => updateFilters('departmentId', event.target.value)}>
                  <option value="ALL">All departments</option>
                  <option value="UNASSIGNED">Unassigned</option>
                  {departments.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </div>
              <div className="field">
                <label className="input-label" htmlFor="report-filter-priority">Priority</label>
                <Select id="report-filter-priority" value={filters.priority} onChange={(event) => updateFilters('priority', event.target.value)}>
                  <option value="ALL">All priorities</option>
                  {reportPriorities.map((item) => (
                    <option key={item} value={item}>{niceLabel(item)}</option>
                  ))}
                </Select>
              </div>
              <Button type="submit" disabled={isLoading} className="btn-block">
                {isLoading ? 'Loading...' : 'Apply filters'}
              </Button>
            </form>
          </BottomSheet>
        ) : null}

        {reportSheet.isOpen && selectedReport ? (
          <BottomSheet
            title={selectedReport.title}
            sub={`${selectedReport.referenceCode} · ${formatDate(selectedReport.submittedAt)}`}
            anim={reportSheet.anim}
            onClose={reportSheet.close}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge value={selectedReport.status} />
              <Badge value={selectedReport.priority} />
            </div>

            <div className="menu-group mt-4">
              <InfoRow label="Citizen" value={selectedReport.reporterName} note={selectedReport.reporterEmail || selectedReport.reporterPhone || 'No contact'} />
              <InfoRow label="Location" value={selectedReport.locationText} note={selectedReport.category.name} />
              <InfoRow label="Owner" value={selectedReport.department?.name || 'Unassigned'} note={`${niceLabel(selectedReport.priority)} priority`} />
            </div>

            <p className="rounded-[16px] bg-[var(--surface-2)] p-4 text-sm font-medium leading-6 text-[var(--ink-2)]">{selectedReport.description}</p>

            {selectedReport.attachments.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {selectedReport.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-[16px] border border-[var(--line)] bg-[var(--surface-2)]"
                  >
                    <img src={attachment.imageUrl} alt="Report attachment" className="h-32 w-full object-cover" />
                  </a>
                ))}
              </div>
            ) : null}

            <form onSubmit={handleStatusUpdate} className="mt-5">
              <p className="group-label">Action panel</p>
              <div className="field">
                <label className="input-label" htmlFor="report-action-status">Status</label>
                <Select id="report-action-status" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {reportStatuses.map((item) => (
                    <option key={item} value={item}>{niceLabel(item)}</option>
                  ))}
                </Select>
              </div>
              <div className="field">
                <label className="input-label" htmlFor="report-action-priority">Priority</label>
                <Select id="report-action-priority" value={priority} onChange={(event) => setPriority(event.target.value)}>
                  {reportPriorities.map((item) => (
                    <option key={item} value={item}>{niceLabel(item)}</option>
                  ))}
                </Select>
              </div>
              <div className="field">
                <label className="input-label" htmlFor="report-action-department">Department</label>
                <Select id="report-action-department" value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                  <option value="">Unassigned</option>
                  {departments.filter((item) => item.isActive).map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </Select>
              </div>
              <div className="field">
                <label className="input-label" htmlFor="report-action-message">Update message</label>
                <Textarea
                  id="report-action-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Write a clear update for the citizen or internal team"
                />
              </div>
              <SwitchRow
                label="Public update"
                sub="Visible to the citizen on the tracking page"
                checked={isPublic}
                onToggle={() => setIsPublic((current) => !current)}
              />

              {error || success ? (
                <div className="mt-3 grid gap-3">
                  <ErrorBanner message={error} />
                  <SuccessBanner message={success} />
                </div>
              ) : null}

              <Button type="submit" disabled={isSaving} className="btn-block mt-4">
                {isSaving ? 'Saving...' : 'Save update'}
              </Button>
            </form>

            <div className="section-head">
              <h3>Timeline</h3>
            </div>
            <div className="grid gap-3 pb-2">
              {selectedReport.updates.map((update) => (
                <div key={update.id} className="rounded-[16px] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge value={update.status} />
                    <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{update.isPublic ? 'Public' : 'Internal'}</span>
                  </div>
                  <p className="mt-2.5 text-sm font-medium leading-6 text-[var(--ink-2)]">{update.message}</p>
                  <p className="mt-2 text-xs font-semibold text-[var(--muted)]">{formatDate(update.createdAt)}</p>
                </div>
              ))}
            </div>
          </BottomSheet>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Payments tab
--------------------------------------------------------------------------- */

type AdminPayment = {
  id: string;
  referenceCode: string;
  payerName: string;
  payerEmail: string | null;
  amount: string;
  assetCode: string;
  status: string;
  transactionHash: string | null;
  ledger: number | null;
  createdAt: string;
  verifiedAt: string | null;
  service: { id: string; title: string };
  citizen: { id: string; name: string; email: string } | null;
};

type PaymentStats = {
  total: number;
  pending: number;
  verified: number;
  failed: number;
  totalVerifiedAmount: number;
};

function paymentPillClass(status: string) {
  if (status === 'VERIFIED') {
    return 'status-pill whitespace-nowrap bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]';
  }
  if (status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED') {
    return 'status-pill whitespace-nowrap bg-[var(--ember-soft)] text-[var(--ember-600)]';
  }
  return 'status-pill whitespace-nowrap bg-[color-mix(in_srgb,var(--heat-2)_18%,var(--surface))] text-[#9a6b00]';
}

function paymentNicClass(status: string) {
  if (status === 'VERIFIED') return 'nic nic-teal';
  if (status === 'FAILED' || status === 'CANCELLED' || status === 'EXPIRED') return 'nic nic-ember';
  return 'nic nic-gold';
}

function PaymentDashboard({ tenantSlug }: { tenantSlug: string }) {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [services, setServices] = useState<Array<{ id: string; title: string }>>([]);
  const [stats, setStats] = useState<PaymentStats>({ total: 0, pending: 0, verified: 0, failed: 0, totalVerifiedAmount: 0 });
  const [filters, setFilters] = useState({ search: '', status: 'ALL', serviceId: 'ALL' });
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const filterSheet = useSheet();
  const detailSheet = useSheet();

  const selectedPayment = payments.find((payment) => payment.id === selectedPaymentId) || null;

  async function loadPayments(nextFilters = filters) {
    setIsLoading(true);
    setError('');
    const params = createFilterParams(nextFilters);
    const response = await fetch(`/api/tenant/${tenantSlug}/payments?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = `/${tenantSlug}/admin/login`;
        return;
      }

      setError(payload.error || 'Unable to load payments.');
      setIsLoading(false);
      return;
    }

    setPayments(payload.data.payments);
    setServices(payload.data.services);
    setStats(payload.data.stats);
    setIsLoading(false);
  }

  useEffect(() => {
    loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateFilters(name: string, value: string) {
    setFilters((current) => ({ ...current, [name]: value }));
  }

  async function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadPayments(filters);
  }

  function exportPayments() {
    const params = createFilterParams(filters);
    window.location.href = `/api/tenant/${tenantSlug}/payments/export?${params.toString()}`;
  }

  return (
    <section>
      <div className="stat-grid">
        <StatCard label="Total payments" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Verified" value={stats.verified} />
        <StatCard label="Verified XLM" value={stats.totalVerifiedAmount.toFixed(2)} />
      </div>

      <form onSubmit={applyFilters} className="mt-4 flex items-center gap-2.5">
        <div className="searchbar min-w-0 flex-1">
          <FiSearch aria-hidden="true" />
          <input
            value={filters.search}
            onChange={(event) => updateFilters('search', event.target.value)}
            placeholder="Search payer, reference, or payment ID"
            aria-label="Search payments"
          />
        </div>
        <button
          type="button"
          onClick={filterSheet.open}
          className="app-icon-btn"
          style={{ width: 52, height: 52 }}
          aria-label="Open payment filters"
        >
          <FiFilter aria-hidden="true" className="h-5 w-5" />
        </button>
      </form>

      {error ? (
        <div className="mt-4">
          <ErrorBanner message={error} />
        </div>
      ) : null}

      <div className="section-head">
        <h2>Payment intents</h2>
        <button type="button" onClick={exportPayments} className="min-h-[44px] shrink-0 px-2 text-[13px] font-bold text-[var(--ember)]">
          Export CSV
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-2.5">
          <div className="skeleton-line w-3/4" />
          <div className="skeleton-line" />
          <div className="skeleton-line w-1/2" />
        </div>
      ) : null}

      {!isLoading && payments.length === 0 ? (
        <div className="empty">
          <div className="eart">
            <FiCreditCard aria-hidden="true" className="h-9 w-9" />
          </div>
          <h3>No payments found</h3>
          <p>No payment records match the current filters.</p>
        </div>
      ) : null}

      <div>
        {payments.map((payment) => (
          <button
            key={payment.id}
            type="button"
            onClick={() => {
              setSelectedPaymentId(payment.id);
              detailSheet.open();
            }}
            className="notif w-full text-left"
          >
            <span className={paymentNicClass(payment.status)}>
              <FiCreditCard aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="nbody">
              <span className="flex items-center justify-between gap-2">
                <b className="min-w-0 truncate">{payment.service.title}</b>
                <span className={paymentPillClass(payment.status)}>{niceLabel(payment.status)}</span>
              </span>
              <span className="mt-0.5 block truncate text-[13px] font-medium text-[var(--ink-2)]">
                {payment.payerName}
                {payment.payerEmail ? ` · ${payment.payerEmail}` : ''}
              </span>
              <span className="nt block">
                {payment.amount} {payment.assetCode} · {formatDate(payment.createdAt)}
              </span>
            </span>
          </button>
        ))}
      </div>

      {filterSheet.isOpen ? (
        <BottomSheet title="Filter payments" sub="Narrow the payment list" anim={filterSheet.anim} onClose={filterSheet.close}>
          <form
            onSubmit={async (event) => {
              await applyFilters(event);
              filterSheet.close();
            }}
          >
            <div className="field">
              <label className="input-label" htmlFor="payment-filter-status">Status</label>
              <Select id="payment-filter-status" value={filters.status} onChange={(event) => updateFilters('status', event.target.value)}>
                <option value="ALL">All statuses</option>
                {['PENDING', 'VERIFIED', 'FAILED', 'CANCELLED', 'EXPIRED'].map((item) => (
                  <option key={item} value={item}>{niceLabel(item)}</option>
                ))}
              </Select>
            </div>
            <div className="field">
              <label className="input-label" htmlFor="payment-filter-service">Service</label>
              <Select id="payment-filter-service" value={filters.serviceId} onChange={(event) => updateFilters('serviceId', event.target.value)}>
                <option value="ALL">All services</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>{service.title}</option>
                ))}
              </Select>
            </div>
            <Button type="submit" disabled={isLoading} className="btn-block">
              {isLoading ? 'Loading...' : 'Apply filters'}
            </Button>
          </form>
        </BottomSheet>
      ) : null}

      {detailSheet.isOpen && selectedPayment ? (
        <BottomSheet
          title={selectedPayment.service.title}
          sub={selectedPayment.referenceCode}
          anim={detailSheet.anim}
          onClose={detailSheet.close}
        >
          <span className={paymentPillClass(selectedPayment.status)}>{niceLabel(selectedPayment.status)}</span>

          <div className="menu-group mt-4">
            <InfoRow label="Payer" value={selectedPayment.payerName} note={selectedPayment.payerEmail || 'No email'} />
            <InfoRow label="Amount" value={`${selectedPayment.amount} ${selectedPayment.assetCode}`} note="Service fee" />
            <InfoRow label="Public record" value={selectedPayment.ledger ? String(selectedPayment.ledger) : 'Pending'} note="Payment check" />
            <InfoRow
              label="Created"
              value={formatDate(selectedPayment.createdAt)}
              note={selectedPayment.verifiedAt ? `Verified ${formatDate(selectedPayment.verifiedAt)}` : 'Awaiting payment'}
            />
          </div>

          {selectedPayment.transactionHash ? (
            <div className="rounded-[16px] bg-[var(--surface-2)] p-4">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Payment ID</p>
              <p className="mt-2 break-all font-mono text-xs font-semibold leading-5 text-[var(--ink-2)]">{selectedPayment.transactionHash}</p>
            </div>
          ) : null}

          <div className="mt-5 grid gap-2.5 pb-2">
            <a href={`/${tenantSlug}/receipts/${selectedPayment.referenceCode}`} className="app-btn btn-primary">
              Receipt
            </a>
            <a href={`/${tenantSlug}/payments/${selectedPayment.referenceCode}`} className="app-btn btn-outline">
              Payment page
            </a>
          </div>
        </BottomSheet>
      ) : null}
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Content tab
--------------------------------------------------------------------------- */

function ContentStudio({
  tenantSlug,
  setError,
  setSuccess
}: {
  tenantSlug: string;
  activeTab: MainTab;
  setError: (value: string) => void;
  setSuccess: (value: string) => void;
}) {
  const [activeContent, setActiveContent] = useState<ContentTab>('services');
  const [items, setItems] = useState<ContentItem[]>([]);
  const [form, setForm] = useState<ContentItem>(contentConfig.services.empty);
  const [editingId, setEditingId] = useState('');
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const formSheet = useSheet();

  const config = contentConfig[activeContent];
  const editingItem = items.find((item) => item.id === editingId) || null;
  const stellarFeeFields = ['feeAmount', 'feeAssetCode', 'feeAssetIssuer', 'receivingPublicKey'];

  async function loadItems(tab: ContentTab = activeContent) {
    setIsLoading(true);
    setError('');
    const nextConfig = contentConfig[tab];
    const response = await fetch(`/api/tenant/${tenantSlug}/${nextConfig.listUrl || nextConfig.endpoint}`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || `Unable to load ${nextConfig.label.toLowerCase()}.`);
      setIsLoading(false);
      return;
    }

    setItems(payload.data);
    setIsLoading(false);
  }

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchContent(tab: ContentTab) {
    setActiveContent(tab);
    setForm(contentConfig[tab].empty);
    setEditingId('');
    loadItems(tab);
  }

  function updateForm(name: string, value: string | boolean | number) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function startEdit(item: ContentItem) {
    const nextForm = { ...config.empty, ...item };

    if (typeof nextForm.publishedAt === 'string') {
      nextForm.publishedAt = toInputDate(nextForm.publishedAt);
    }

    if ('password' in nextForm) {
      nextForm.password = '';
    }

    setForm(nextForm);
    setEditingId(item.id);
  }

  function resetForm() {
    setForm(config.empty);
    setEditingId('');
  }

  function openCreate() {
    resetForm();
    setFormError('');
    formSheet.open();
  }

  function openEdit(item: ContentItem) {
    startEdit(item);
    setFormError('');
    formSheet.open();
  }

  function closeFormSheet() {
    resetForm();
    setFormError('');
    formSheet.close();
  }

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');
    setFormError('');

    const nextBody = { ...form };

    if (activeContent === 'users' && !editingId && String(nextBody.password || '').trim().length < 8) {
      setError('Password must be at least 8 characters when creating a staff user.');
      setFormError('Password must be at least 8 characters when creating a staff user.');
      setIsSaving(false);
      return;
    }

    if (editingId && typeof nextBody.password === 'string' && nextBody.password.trim().length === 0) {
      delete nextBody.password;
    }

    const response = await fetch(`/api/tenant/${tenantSlug}/${config.endpoint}${editingId ? `/${editingId}` : ''}`, {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextBody)
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to save item.');
      setFormError(payload.error || 'Unable to save item.');
      setIsSaving(false);
      return;
    }

    setSuccess(`${config.label} saved successfully.`);
    resetForm();
    formSheet.close();
    await loadItems();
    setIsSaving(false);
  }

  async function archiveItem(item: ContentItem) {
    setError('');
    setSuccess('');
    setFormError('');

    const response = await fetch(`/api/tenant/${tenantSlug}/${config.endpoint}/${item.id}`, {
      method: 'DELETE'
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to archive item.');
      setFormError(payload.error || 'Unable to archive item.');
      return;
    }

    setSuccess(`${config.label} archived.`);
    resetForm();
    formSheet.close();
    await loadItems();
  }

  return (
    <section>
      <div className="hscroll -mx-5">
        {contentTabs.map((tab) => (
          <button key={tab} type="button" onClick={() => switchContent(tab)} className={`chip ${activeContent === tab ? 'on' : ''}`.trim()}>
            {contentConfig[tab].label}
          </button>
        ))}
      </div>

      <div className="section-head">
        <h2>{config.label}</h2>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => loadItems()} className="app-icon-btn" aria-label={`Refresh ${config.label.toLowerCase()}`}>
            <FiRefreshCw aria-hidden="true" className="h-4 w-4" />
          </button>
          <button type="button" onClick={openCreate} className="app-icon-btn" aria-label={`Create ${config.label.toLowerCase()}`}>
            <FiPlus aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-2.5">
          <div className="skeleton-line w-3/4" />
          <div className="skeleton-line" />
          <div className="skeleton-line w-1/2" />
        </div>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <div className="empty">
          <div className="eart">
            <FiGrid aria-hidden="true" className="h-9 w-9" />
          </div>
          <h3>Nothing here yet</h3>
          <p>Tap the plus button to create the first item.</p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <div className="menu-group">
          {items.map((item) => {
            const title = String(item.title || item.name || 'Untitled');
            const description = String(item.description || item.excerpt || item.email || item.phone || item.role || 'No description');
            const isActive = item.isActive ?? item.isPublished ?? true;

            return (
              <button key={item.id} type="button" onClick={() => openEdit(item)} className="menu-item">
                <span className="mi-tx">
                  <b className="truncate">{title}</b>
                  <span className="truncate">{description}</span>
                </span>
                <span
                  className={`status-pill shrink-0 whitespace-nowrap ${
                    isActive
                      ? 'bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]'
                      : 'bg-[var(--surface-2)] text-[var(--muted)]'
                  }`}
                >
                  {isActive ? 'Live' : 'Archived'}
                </span>
                <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
              </button>
            );
          })}
        </div>
      ) : null}

      {formSheet.isOpen ? (
        <BottomSheet title={editingId ? 'Edit item' : 'Create item'} sub={config.label} anim={formSheet.anim} onClose={closeFormSheet}>
          <form onSubmit={saveItem}>
            {config.fields.map((field) => {
              if (activeContent === 'services' && stellarFeeFields.includes(field.name) && !form.paymentRequired) {
                return null;
              }

              if (field.type === 'checkbox') {
                return (
                  <div key={field.name} className="mb-4">
                    <SwitchRow
                      label={field.label}
                      checked={Boolean(form[field.name])}
                      onToggle={() => updateForm(field.name, !form[field.name])}
                    />
                  </div>
                );
              }

              return (
                <div key={field.name} className="field">
                  <label className="input-label" htmlFor={`content-${field.name}`}>
                    {field.label}
                    {activeContent === 'users' && field.name === 'password'
                      ? editingId
                        ? ' (leave blank to keep current)'
                        : ' (required for new user)'
                      : ''}
                  </label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={`content-${field.name}`}
                      required={field.required}
                      value={String(form[field.name] ?? '')}
                      onChange={(event) => updateForm(field.name, event.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <Select
                      id={`content-${field.name}`}
                      required={field.required}
                      value={String(form[field.name] ?? '')}
                      onChange={(event) => updateForm(field.name, event.target.value)}
                    >
                      {(field.options || []).map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      id={`content-${field.name}`}
                      type={field.type || 'text'}
                      required={field.required}
                      value={field.type === 'date' ? toInputDate(form[field.name]) : String(form[field.name] ?? '')}
                      onChange={(event) => updateForm(field.name, field.type === 'number' ? Number(event.target.value) : event.target.value)}
                    />
                  )}
                </div>
              );
            })}

            <ErrorBanner message={formError} />

            <div className="mt-4 grid gap-2.5 pb-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Create'}
              </Button>
              {editingId && editingItem ? (
                <button type="button" onClick={() => archiveItem(editingItem)} className="app-btn btn-outline text-[var(--ember-600)]">
                  Archive
                </button>
              ) : null}
              <button type="button" onClick={closeFormSheet} className="app-btn btn-ghost">
                Cancel
              </button>
            </div>
          </form>
        </BottomSheet>
      ) : null}
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Settings tab — Stellar wallet
--------------------------------------------------------------------------- */

type StellarWallet = {
  tenantId: string;
  network: string;
  networkPassphrase: string;
  horizonUrl: string;
  friendbotUrl: string | null;
  receivingPublicKey: string | null;
  hasStoredSecret: boolean;
  status: string;
  balances: Array<{ assetType: string; assetCode: string; balance: string }>;
  lastCheckedAt: string | null;
  lastFundedAt: string | null;
  error: string | null;
};

type ApprovalPolicy = {
  enabled: boolean;
  signerCount: number;
  requiredApprovals: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

function StellarWalletPanel({ tenantSlug }: { tenantSlug: string }) {
  const [wallet, setWallet] = useState<StellarWallet | null>(null);
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [network, setNetwork] = useState('TESTNET');
  const [horizonUrl, setHorizonUrl] = useState('https://horizon-testnet.stellar.org');
  const [friendbotUrl, setFriendbotUrl] = useState('https://friendbot.stellar.org');
  const [networkPassphrase, setNetworkPassphrase] = useState('Test SDF Network ; September 2015');
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const advancedSheet = useSheet();

  function syncWallet(nextWallet: StellarWallet) {
    setWallet(nextWallet);
    setPublicKey(nextWallet.receivingPublicKey || '');
    setNetwork(nextWallet.network || 'TESTNET');
    setHorizonUrl(nextWallet.horizonUrl || 'https://horizon-testnet.stellar.org');
    setFriendbotUrl(nextWallet.friendbotUrl || 'https://friendbot.stellar.org');
    setNetworkPassphrase(nextWallet.networkPassphrase || 'Test SDF Network ; September 2015');
    setSecretKey('');
  }

  async function loadWallet() {
    setError('');
    const response = await fetch(`/api/tenant/${tenantSlug}/stellar/wallet`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to load wallet settings.');
      return;
    }

    syncWallet(payload.data);
  }

  useEffect(() => {
    loadWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  async function walletAction(path: string, body?: Record<string, unknown>, message = 'Wallet updated.') {
    setIsBusy(true);
    setError('');
    setSuccess('');

    const response = await fetch(`/api/tenant/${tenantSlug}/stellar/wallet${path}`, {
      method: path ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to update wallet.');
      setIsBusy(false);
      return;
    }

    syncWallet(payload.data);
    setSuccess(message);
    setIsBusy(false);
  }

  async function copyKey() {
    if (!wallet?.receivingPublicKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(wallet.receivingPublicKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const hasWallet = Boolean(wallet?.receivingPublicKey);

  return (
    <div>
      <p className="group-label">Organization wallet</p>
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[15px] font-bold text-[var(--ink)]">LGU receiving wallet</h3>
            <p className="mt-1 text-xs font-medium leading-5 text-[var(--muted)]">
              {wallet ? `${wallet.network === 'TESTNET' ? 'Practice network' : 'Live network'} - Private key ${wallet.hasStoredSecret ? 'protected' : 'not stored'}` : 'Official payment address for this LGU.'}
            </p>
          </div>
          <span className="status-pill shrink-0 whitespace-nowrap bg-[var(--surface-2)] text-[var(--ink-2)]">
            {wallet?.status ? niceLabel(wallet.status) : 'Loading'}
          </span>
        </div>

        {error || success || wallet?.error ? (
          <div className="mt-4 grid gap-3">
            <ErrorBanner message={error} />
            <SuccessBanner message={success} />
            {wallet?.error ? (
              <p className="rounded-[14px] bg-[color-mix(in_srgb,var(--heat-2)_18%,var(--surface))] p-4 text-sm font-semibold leading-5 text-[#9a6b00]">
                {wallet.error}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-4 flex items-start gap-3 rounded-[16px] bg-[var(--surface-2)] p-4">
          <p className="min-w-0 flex-1 break-all font-mono text-xs font-semibold leading-5 text-[var(--ink)]">
            {wallet?.receivingPublicKey || 'Not configured yet.'}
          </p>
          {hasWallet ? (
            <button type="button" onClick={copyKey} className="app-icon-btn" aria-label="Copy wallet address">
              {copied ? <FiCheck aria-hidden="true" className="h-5 w-5 text-[#0f806d]" /> : <FiCopy aria-hidden="true" className="h-5 w-5" />}
            </button>
          ) : null}
        </div>

        {wallet?.balances?.length ? (
          <div className="stat-grid mt-4">
            {wallet.balances.map((balance, index) => (
              <StatCard key={`${balance.assetCode}-${index}`} label={balance.assetCode || balance.assetType} value={balance.balance} />
            ))}
          </div>
        ) : null}

        {!hasWallet ? (
          <>
            <p className="mt-4 text-[13px] font-medium leading-5 text-[var(--muted)]">
              Creates a practice wallet and adds play money for testing.
            </p>
            <Button
              type="button"
              disabled={isBusy}
              onClick={() => walletAction('/generate', { fund: true }, 'Practice wallet created and funded.')}
              className="btn-block mt-4"
            >
              Create practice wallet
            </Button>
          </>
        ) : null}

        <div className="menu-group mb-0 mt-4">
          <button type="button" onClick={advancedSheet.open} className="menu-item">
            <span className="mi-ic">
              <FiSettings aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="mi-tx">
              <b>Advanced wallet settings</b>
              <span>Import a wallet or change network services</span>
            </span>
            <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => walletAction('/check', {}, 'Wallet checked.')}
            className="menu-item disabled:opacity-50"
          >
            <span className="mi-ic">
              <FiRefreshCw aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="mi-tx">
              <b>Check wallet</b>
              <span>{wallet?.lastCheckedAt ? `Last checked ${formatDate(wallet.lastCheckedAt)}` : 'Not checked yet'}</span>
            </span>
            <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={isBusy || !hasWallet}
            onClick={() => walletAction('/fund', {}, 'Play money added.')}
            className="menu-item disabled:opacity-50"
          >
            <span className="mi-ic">
              <FiDroplet aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="mi-tx">
              <b>Add play money</b>
              <span>{wallet?.lastFundedAt ? `Added ${formatDate(wallet.lastFundedAt)}` : 'Add test funds'}</span>
            </span>
            <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
          </button>
        </div>
      </Card>

      {advancedSheet.isOpen ? (
        <BottomSheet title="Advanced wallet settings" sub="Import wallet and network services" anim={advancedSheet.anim} onClose={advancedSheet.close}>
          {error || success ? (
            <div className="mb-4 grid gap-3">
              <ErrorBanner message={error} />
              <SuccessBanner message={success} />
            </div>
          ) : null}

          <div className="field">
            <label className="input-label" htmlFor="wallet-public-key">Wallet address</label>
            <Input
              id="wallet-public-key"
              value={publicKey}
              onChange={(event) => setPublicKey(event.target.value)}
              placeholder="Wallet address"
            />
            <p className="mt-2 text-xs font-medium leading-4 text-[var(--muted)]">Normal setup fills this automatically after generation.</p>
          </div>
          <div className="field">
            <label className="input-label" htmlFor="wallet-secret-key">Private key import</label>
            <Input
              id="wallet-secret-key"
              type="password"
              value={secretKey}
              onChange={(event) => setSecretKey(event.target.value)}
              placeholder="Optional private key"
            />
            <p className="mt-2 text-xs font-medium leading-4 text-[var(--muted)]">Stored privately and never shown after saving.</p>
          </div>
          <div className="field">
            <label className="input-label" htmlFor="wallet-network">Network</label>
            <Select id="wallet-network" value={network} onChange={(event) => setNetwork(event.target.value)}>
              <option value="TESTNET">Practice network</option>
              <option value="MAINNET">Live network setup</option>
            </Select>
          </div>
          <div className="field">
            <label className="input-label" htmlFor="wallet-passphrase">Network safety phrase</label>
            <Input id="wallet-passphrase" value={networkPassphrase} onChange={(event) => setNetworkPassphrase(event.target.value)} />
          </div>
          <div className="field">
            <label className="input-label" htmlFor="wallet-horizon">Public record service URL</label>
            <Input id="wallet-horizon" value={horizonUrl} onChange={(event) => setHorizonUrl(event.target.value)} />
          </div>
          <div className="field">
            <label className="input-label" htmlFor="wallet-friendbot">Test funding service URL</label>
            <Input id="wallet-friendbot" value={friendbotUrl} onChange={(event) => setFriendbotUrl(event.target.value)} />
          </div>

          <div className="mt-2 grid gap-2.5 pb-2">
            <Button
              type="button"
              disabled={isBusy}
              onClick={() => walletAction('', { publicKey, secretKey, network, horizonUrl, friendbotUrl, networkPassphrase }, 'Wallet settings saved.')}
            >
              Save advanced settings
            </Button>
            <button
              type="button"
              disabled={isBusy}
              onClick={() => walletAction('/generate', { fund: true }, 'Practice wallet created and funded.')}
              className="app-btn btn-outline disabled:opacity-60"
            >
              Create new practice wallet
            </button>
            <button
              type="button"
              disabled={isBusy}
              onClick={async () => {
                setIsBusy(true);
                setError('');
                setSuccess('');
                const response = await fetch(`/api/tenant/${tenantSlug}/stellar/sponsor-reserve`, { method: 'POST' });
                const payload = await response.json();
                setIsBusy(false);
                if (!response.ok) {
                  setError(payload.error || 'Unable to sponsor member reserve.');
                  return;
                }
                setSuccess(`Member wallet sponsored · ${payload.data.publicKey}`);
              }}
              className="app-btn btn-outline disabled:opacity-60"
            >
              Sponsor member reserve (Testnet)
            </button>
          </div>
        </BottomSheet>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Settings tab — organization form
--------------------------------------------------------------------------- */

function ApprovalPolicyPanel({ tenantSlug }: { tenantSlug: string }) {
  const [policy, setPolicy] = useState<ApprovalPolicy | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [signerCount, setSignerCount] = useState(10);
  const [requiredApprovals, setRequiredApprovals] = useState(6);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function syncPolicy(nextPolicy: ApprovalPolicy) {
    setPolicy(nextPolicy);
    setEnabled(nextPolicy.enabled);
    setSignerCount(nextPolicy.signerCount);
    setRequiredApprovals(nextPolicy.requiredApprovals);
    setNote(nextPolicy.note || '');
  }

  async function loadPolicy() {
    setError('');
    const response = await fetch(`/api/tenant/${tenantSlug}/approvals/policy`);
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to load approval settings.');
      return;
    }

    syncPolicy(payload.data);
  }

  useEffect(() => {
    loadPolicy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantSlug]);

  async function savePolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    const response = await fetch(`/api/tenant/${tenantSlug}/approvals/policy`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled, signerCount, requiredApprovals, note })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to save approval settings.');
      setIsSaving(false);
      return;
    }

    syncPolicy(payload.data);
    setSuccess('Approval rule saved.');
    setIsSaving(false);
  }

  const cappedRequired = Math.min(requiredApprovals, Math.max(1, signerCount));

  return (
    <form onSubmit={savePolicy}>
      <p className="group-label">Release approvals</p>
      <Card className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-[15px] font-bold text-[var(--ink)]">Majority approval</h3>
            <p className="mt-1 text-xs font-medium leading-5 text-[var(--muted)]">
              Rewards and public releases wait for enough staff approvals before money leaves the organization wallet.
            </p>
          </div>
          <span className={`status-pill shrink-0 ${enabled ? 'bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]' : 'bg-[var(--surface-2)] text-[var(--ink-2)]'}`}>
            {enabled ? 'On' : 'Off'}
          </span>
        </div>

        {error || success ? (
          <div className="mt-4 grid gap-3">
            <ErrorBanner message={error} />
            <SuccessBanner message={success} />
          </div>
        ) : null}

        <div className="mt-4 rounded-[16px] bg-[var(--surface-2)] p-4">
          <SwitchRow
            label="Require more than one approval"
            sub="Example: 10 reviewers, 6 needed to release funds."
            checked={enabled}
            onToggle={() => setEnabled((current) => !current)}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="field mb-0">
            <label className="input-label" htmlFor="approval-signers">Reviewers</label>
            <Input
              id="approval-signers"
              type="number"
              min={1}
              max={50}
              value={signerCount}
              onChange={(event) => setSignerCount(Number(event.target.value))}
            />
          </div>
          <div className="field mb-0">
            <label className="input-label" htmlFor="approval-required">Needed</label>
            <Input
              id="approval-required"
              type="number"
              min={1}
              max={Math.max(1, signerCount)}
              value={requiredApprovals}
              onChange={(event) => setRequiredApprovals(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="field mt-4">
          <label className="input-label" htmlFor="approval-note">Plain-language note</label>
          <Textarea
            id="approval-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Example: Six staff members must approve before the organization wallet sends money."
          />
        </div>

        <div className="rounded-[16px] border border-[var(--line)] p-4">
          <p className="text-sm font-bold text-[var(--ink)]">
            {enabled ? `${cappedRequired} of ${Math.max(1, signerCount)} approvals required` : 'Single approval mode'}
          </p>
          <p className="mt-1 text-xs font-medium leading-5 text-[var(--muted)]">
            This controls outgoing rewards and public disbursements. Service payments still go directly to the LGU receiving wallet.
          </p>
        </div>

        <Button type="submit" disabled={isSaving || !policy} className="btn-block mt-4">
          {isSaving ? 'Saving...' : 'Save approval rule'}
        </Button>
      </Card>
    </form>
  );
}

function TenantSettingsPanel({
  tenantSlug,
  tenant,
  setTenant,
  setError,
  setSuccess
}: {
  tenantSlug: string;
  tenant: TenantSettings | null;
  setTenant: (tenant: TenantSettings) => void;
  setError: (value: string) => void;
  setSuccess: (value: string) => void;
}) {
  const [form, setForm] = useState<TenantSettings | null>(tenant);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm(tenant);
  }, [tenant]);

  function updateForm(name: keyof TenantSettings, value: string) {
    setForm((current) => (current ? { ...current, [name]: value } : current));
  }

  async function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form) {
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    const response = await fetch(`/api/tenant/${tenantSlug}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to save tenant settings.');
      setIsSaving(false);
      return;
    }

    setTenant(payload.data);
    setSuccess('Organization settings saved.');
    setIsSaving(false);
  }

  if (!form) {
    return (
      <Card>
        <p className="text-sm font-semibold text-[var(--muted)]">Loading organization settings...</p>
      </Card>
    );
  }

  return (
    <section>
      <p className="group-label">Workspace</p>
      <div className="menu-group">
        <a href={`/${tenantSlug}`} className="menu-item">
          <span className="mi-ic">
            <FiExternalLink aria-hidden="true" className="h-5 w-5" />
          </span>
          <span className="mi-tx">
            <b>Public site</b>
            <span>Open the public portal</span>
          </span>
          <FiChevronRight aria-hidden="true" className="mi-chev h-4 w-4" />
        </a>
      </div>

      <StellarWalletPanel tenantSlug={tenantSlug} />
      <ApprovalPolicyPanel tenantSlug={tenantSlug} />

      <form onSubmit={saveSettings}>
        <p className="group-label">Organization</p>
        <Card className="mb-4">
          <div className="field">
            <label className="input-label" htmlFor="settings-name">Tenant name</label>
            <Input id="settings-name" required value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
          </div>
          <div className="field">
            <label className="input-label" htmlFor="settings-city">Display name / region</label>
            <Input id="settings-city" required value={form.cityName} onChange={(event) => updateForm('cityName', event.target.value)} />
          </div>
          <div className="field">
            <label className="input-label" htmlFor="settings-tagline">Tagline</label>
            <Input id="settings-tagline" required value={form.tagline} onChange={(event) => updateForm('tagline', event.target.value)} />
          </div>
          <div className="field mb-0">
            <label className="input-label" htmlFor="settings-description">Description</label>
            <Textarea id="settings-description" required value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
          </div>
        </Card>

        <p className="group-label">Contact</p>
        <Card className="mb-4">
          <div className="field">
            <label className="input-label" htmlFor="settings-email">Email</label>
            <Input id="settings-email" value={form.email || ''} onChange={(event) => updateForm('email', event.target.value)} />
          </div>
          <div className="field">
            <label className="input-label" htmlFor="settings-phone">Phone</label>
            <Input id="settings-phone" value={form.phone || ''} onChange={(event) => updateForm('phone', event.target.value)} />
          </div>
          <div className="field mb-0">
            <label className="input-label" htmlFor="settings-address">Address</label>
            <Input id="settings-address" value={form.address || ''} onChange={(event) => updateForm('address', event.target.value)} />
          </div>
        </Card>

        <p className="group-label">Branding</p>
        <Card className="mb-4">
          <div className="field mb-0">
            <label className="input-label" htmlFor="settings-color">Primary color</label>
            <Input id="settings-color" value={form.primaryColor} onChange={(event) => updateForm('primaryColor', event.target.value)} />
          </div>
        </Card>

        <p className="group-label">Default payment currency</p>
        <Card className="mb-5">
          <div className="field">
            <label className="input-label" htmlFor="settings-asset-code">Currency code</label>
            <Input
              id="settings-asset-code"
              value={form.stellarDefaultAssetCode || 'XLM'}
              onChange={(event) => updateForm('stellarDefaultAssetCode', event.target.value)}
              placeholder="XLM or USDC"
            />
            <p className="mt-2 text-xs font-medium leading-4 text-[var(--muted)]">Use a stable token like USDC when the fee should stay close to a peso or dollar value.</p>
          </div>
          <div className="field mb-0">
            <label className="input-label" htmlFor="settings-asset-issuer">Token issuer address</label>
            <Input
              id="settings-asset-issuer"
              value={form.stellarDefaultAssetIssuer || ''}
              onChange={(event) => updateForm('stellarDefaultAssetIssuer', event.target.value)}
              placeholder="Required for USDC or other non-XLM tokens"
            />
          </div>
        </Card>

        <Button type="submit" disabled={isSaving} className="btn-block">
          {isSaving ? 'Saving...' : 'Save settings'}
        </Button>
      </form>
    </section>
  );
}
