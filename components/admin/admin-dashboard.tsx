'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FiCreditCard,
  FiExternalLink,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiSettings,
  FiShield
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
      { name: 'paymentRequired', label: 'Require Stellar payment', type: 'checkbox' },
      { name: 'feeAmount', label: 'Service fee amount', type: 'number' },
      { name: 'feeAssetCode', label: 'Fee asset code' },
      { name: 'feeAssetIssuer', label: 'Asset issuer public key' },
      { name: 'receivingPublicKey', label: 'Service receiving wallet' },
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    empty: { id: '', title: '', description: '', department: '', linkUrl: '', sortOrder: 0, paymentRequired: false, feeAmount: 0, feeAssetCode: 'XLM', feeAssetIssuer: '', receivingPublicKey: '', isActive: true }
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
    description: 'Triage citizen reports, assign departments, publish updates, and keep the queue moving.'
  },
  payments: {
    label: 'Payments',
    title: 'Stellar payments',
    description: 'Monitor service fee intents, verify transaction hashes, and export payment receipts.'
  },
  'stellar-programs': {
    label: 'Civic trust',
    title: 'Stellar civic programs',
    description: 'Manage civic rewards, public transparency records, and verifiable property tax receipts.'
  },
  content: {
    label: 'Content',
    title: 'Content studio',
    description: 'Maintain services, hotlines, announcements, categories, departments, and staff users.'
  },
  settings: {
    label: 'Settings',
    title: 'Workspace settings',
    description: 'Configure tenant profile details, public branding, and Stellar Testnet wallet settings.'
  }
};

function AdminTabIcon({ tab }: { tab: MainTab }) {
  const className = 'h-4 w-4 shrink-0';
  if (tab === 'reports') return <FiFileText className={className} />;
  if (tab === 'payments') return <FiCreditCard className={className} />;
  if (tab === 'stellar-programs') return <FiShield className={className} />;
  if (tab === 'content') return <FiGrid className={className} />;
  return <FiSettings className={className} />;
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

export function AdminDashboard({ tenantSlug }: { tenantSlug: string }) {
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

  function exportReports() {
    const params = createFilterParams(filters);
    window.location.href = `/api/tenant/${tenantSlug}/reports/export?${params.toString()}`;
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

  return (
    <div className="civic-device-shell">
      <div className="civic-app-frame admin-app-frame">
        <div className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">{tenant?.name?.slice(0, 2).toUpperCase() || 'CT'}</div>
            <div className="min-w-0">
              <p className="app-title truncate">Operations</p>
              <p className="app-subtitle truncate">{tenant?.name || 'CivicTrust'} staff app</p>
            </div>
          </div>
          <button onClick={handleLogout} className="app-icon-btn" aria-label="Sign out"><FiLogOut className="h-4 w-4" /></button>
        </div>
        <div className="civic-viewport">
      <div className="dashboard-container grid gap-6 py-5 lg:grid-cols-[16.5rem_1fr] lg:py-8">
        <aside className="dashboard-card h-fit p-4 lg:sticky lg:top-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-gradient-to-br from-[var(--navy)] to-[var(--navy-900)] text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(26,73,123,0.20)]">
              {tenant?.name?.slice(0, 2).toUpperCase() || 'CT'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-950">{tenant?.name || 'CivicTrust'}</p>
              <p className="truncate text-xs font-semibold text-slate-500">Operations portal</p>
            </div>
          </div>

          <nav className="mt-4 grid gap-1" aria-label="Admin navigation">
            {mainTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`dashboard-sidebar-item ${activeTab === tab ? 'dashboard-sidebar-item-active' : ''}`}
              >
                <AdminTabIcon tab={tab} />
                <span>{adminTabMeta[tab].label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-5 grid gap-2 border-t border-slate-100 pt-4">
            <a href={`/${tenantSlug}`} className="app-btn btn-secondary min-h-11 px-4 py-2.5">
              <FiExternalLink className="h-4 w-4" /> Public site
            </a>
            <button onClick={handleLogout} className="app-btn btn-secondary min-h-11 px-4 py-2.5">
              <FiLogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </aside>

        <main className="grid min-w-0 gap-6">
          <header className="dashboard-card p-5 md:p-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="dashboard-kicker">{adminTabMeta[activeTab].label}</p>
                <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.035em] text-slate-950 md:text-4xl">{adminTabMeta[activeTab].title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{adminTabMeta[activeTab].description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:min-w-[28rem]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xl font-extrabold text-blue-700">{Math.max(0, stats.total - stats.resolved)}</p>
                  <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.10em] text-slate-500">Active</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xl font-extrabold text-amber-600">{stats.urgent}</p>
                  <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.10em] text-slate-500">Urgent</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xl font-extrabold text-emerald-600">{stats.resolved}</p>
                  <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.10em] text-slate-500">Resolved</p>
                </div>
              </div>
            </div>
          </header>

          <div className="flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 lg:hidden">
            {mainTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`dashboard-tab whitespace-nowrap ${activeTab === tab ? 'dashboard-tab-active' : ''}`}
              >
                {adminTabMeta[tab].label}
              </button>
            ))}
          </div>

          {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{error}</p>}
          {success && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">{success}</p>}

        {activeTab === 'reports' ? (
          <section className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Total Reports" value={stats.total} />
              <StatCard label="Submitted" value={stats.submitted} />
              <StatCard label="In Progress" value={stats.inProgress} />
              <StatCard label="Unassigned" value={stats.unassigned} />
            </div>

            <Card className="">
              <form onSubmit={applyFilters} className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] lg:items-end">
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Search</label>
                  <Input value={filters.search} onChange={(event) => updateFilters('search', event.target.value)} placeholder="Reference, name, issue, location" />
                </div>
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Status</label>
                  <Select value={filters.status} onChange={(event) => updateFilters('status', event.target.value)}>
                    <option value="ALL">All</option>
                    {reportStatuses.map((item) => <option key={item} value={item}>{niceLabel(item)}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Category</label>
                  <Select value={filters.categoryId} onChange={(event) => updateFilters('categoryId', event.target.value)}>
                    <option value="ALL">All</option>
                    {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Department</label>
                  <Select value={filters.departmentId} onChange={(event) => updateFilters('departmentId', event.target.value)}>
                    <option value="ALL">All</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    {departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Priority</label>
                  <Select value={filters.priority} onChange={(event) => updateFilters('priority', event.target.value)}>
                    <option value="ALL">All</option>
                    {reportPriorities.map((item) => <option key={item} value={item}>{niceLabel(item)}</option>)}
                  </Select>
                </div>
                <Button disabled={isLoading}>{isLoading ? 'Loading...' : 'Apply'}</Button>
              </form>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">Queue</p>
                    <h2 className="mt-1 text-xl font-extrabold text-slate-900">Citizen reports</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={exportReports} className="app-btn btn-primary min-h-11 px-4 py-2">
                      Export CSV
                    </button>
                    <button onClick={() => loadReports(filters)} className="app-btn btn-secondary min-h-11 px-4 py-2">
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid max-h-[720px] gap-3 overflow-auto pr-1">
                  {isLoading ? <p className="text-sm text-slate-500">Loading reports...</p> : null}
                  {!isLoading && reports.length === 0 ? <p className="text-sm text-slate-500">No reports match the current filters.</p> : null}
                  {reports.map((report, index) => (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReportId(report.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedReport?.id === report.id
                          ? 'border-[var(--navy)] bg-[color-mix(in_srgb,var(--navy)_8%,white)] shadow-[0_10px_24px_rgba(16,24,40,0.05)]'
                          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_10px_24px_rgba(16,24,40,0.05)]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Report #{index + 1} · {report.referenceCode}</p>
                          <p className="mt-2 font-extrabold text-slate-900">{report.title}</p>
                        </div>
                        <Badge value={report.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">{report.category.name}</span>
                        <span className="rounded-xl bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">{niceLabel(report.priority)}</span>
                        <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700">{report.department?.name || 'Unassigned'}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">{report.locationText}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="">
                {selectedReport ? (
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{selectedReport.referenceCode}</p>
                        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{selectedReport.title}</h2>
                        <p className="mt-2 text-sm text-slate-500">Submitted {formatDate(selectedReport.submittedAt)}</p>
                      </div>
                      <Badge value={selectedReport.status} />
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <InfoPanel label="Citizen" value={selectedReport.reporterName} note={selectedReport.reporterEmail || selectedReport.reporterPhone || 'No contact'} />
                      <InfoPanel label="Location" value={selectedReport.locationText} note={selectedReport.category.name} />
                      <InfoPanel label="Owner" value={selectedReport.department?.name || 'Unassigned'} note={`${niceLabel(selectedReport.priority)} priority`} />
                    </div>

                    <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600 ring-1 ring-slate-100">{selectedReport.description}</p>

                    {selectedReport.attachments.length > 0 ? (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {selectedReport.attachments.map((attachment) => (
                          <a key={attachment.id} href={attachment.imageUrl} target="_blank" className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100" rel="noreferrer">
                            <img src={attachment.imageUrl} alt="Report attachment" className="h-52 w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : null}

                    <form onSubmit={handleStatusUpdate} className="mt-8 grid gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">Action panel</p>
                          <h3 className="mt-1 font-extrabold text-slate-900">Update report progress</h3>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-extrabold text-slate-700">
                          <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
                          Public update
                        </label>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-extrabold text-slate-700">Status</label>
                          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                            {reportStatuses.map((item) => <option key={item} value={item}>{niceLabel(item)}</option>)}
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-extrabold text-slate-700">Priority</label>
                          <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
                            {reportPriorities.map((item) => <option key={item} value={item}>{niceLabel(item)}</option>)}
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-extrabold text-slate-700">Department</label>
                          <Select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                            <option value="">Unassigned</option>
                            {departments.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-extrabold text-slate-700">Update message</label>
                        <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a clear update for the citizen or internal team" />
                      </div>
                      <Button disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Update'}</Button>
                    </form>

                    <div className="mt-8">
                      <h3 className="text-lg font-extrabold text-slate-900">Timeline</h3>
                      <div className="mt-4 grid gap-3">
                        {selectedReport.updates.map((update) => (
                          <div key={update.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Badge value={update.status} />
                              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500">{update.isPublic ? 'Public' : 'Internal'}</span>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{update.message}</p>
                            <p className="mt-2 text-xs font-semibold text-slate-400">{formatDate(update.createdAt)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Select a report to view details.</p>
                )}
              </Card>
            </div>
          </section>
        ) : null}

        {activeTab === 'payments' ? (
          <PaymentDashboard tenantSlug={tenantSlug} />
        ) : null}

        {activeTab === 'stellar-programs' ? (
          <StellarProgramsDashboard tenantSlug={tenantSlug} />
        ) : null}

        {activeTab === 'content' ? (
          <ContentStudio tenantSlug={tenantSlug} activeTab={activeTab} setError={setError} setSuccess={setSuccess} />
        ) : null}

        {activeTab === 'settings' ? (
          <TenantSettingsPanel tenantSlug={tenantSlug} tenant={tenant} setTenant={setTenant} setError={setError} setSuccess={setSuccess} />
        ) : null}
        </main>
      </div>
        </div>
      </div>
    </div>
  );
}

function InfoPanel({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 font-extrabold text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
  );
}


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

function PaymentDashboard({ tenantSlug }: { tenantSlug: string }) {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [services, setServices] = useState<Array<{ id: string; title: string }>>([]);
  const [stats, setStats] = useState<PaymentStats>({ total: 0, pending: 0, verified: 0, failed: 0, totalVerifiedAmount: 0 });
  const [filters, setFilters] = useState({ search: '', status: 'ALL', serviceId: 'ALL' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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

      setError(payload.error || 'Unable to load Stellar payments.');
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
    <section className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Payments" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Verified" value={stats.verified} />
        <StatCard label="Verified XLM" value={stats.totalVerifiedAmount.toFixed(2)} />
      </div>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="section-eyebrow">Stellar payments</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-slate-950">Proof-of-payment workspace</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
              Review service fee intents, verify receipt status, and export payment records without turning the platform into a generic crypto app.
            </p>
          </div>
          <button onClick={exportPayments} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-primary">Export CSV</button>
        </div>

        <form onSubmit={applyFilters} className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.7fr_0.8fr_auto] lg:items-end">
          <div>
            <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Search</label>
            <Input value={filters.search} onChange={(event) => updateFilters('search', event.target.value)} placeholder="Reference, payer, email, transaction hash" />
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Status</label>
            <Select value={filters.status} onChange={(event) => updateFilters('status', event.target.value)}>
              <option value="ALL">All</option>
              {['PENDING', 'VERIFIED', 'FAILED', 'CANCELLED', 'EXPIRED'].map((item) => <option key={item} value={item}>{niceLabel(item)}</option>)}
            </Select>
          </div>
          <div>
            <label className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">Service</label>
            <Select value={filters.serviceId} onChange={(event) => updateFilters('serviceId', event.target.value)}>
              <option value="ALL">All</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.title}</option>)}
            </Select>
          </div>
          <Button disabled={isLoading}>{isLoading ? 'Loading...' : 'Apply'}</Button>
        </form>
      </Card>

      {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-extrabold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}

      <div className="grid gap-4">
        {isLoading ? <Card><p className="text-sm text-slate-500">Loading payments...</p></Card> : null}
        {!isLoading && payments.length === 0 ? <Card><p className="text-sm text-slate-500">No payment records match the current filters.</p></Card> : null}
        {payments.map((payment) => (
          <Card key={payment.id} className="card-hover">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{payment.referenceCode}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${payment.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : payment.status === 'FAILED' ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
                    {niceLabel(payment.status)}
                  </span>
                </div>
                <h3 className="mt-2 text-xl font-extrabold text-slate-950">{payment.service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{payment.payerName} {payment.payerEmail ? `· ${payment.payerEmail}` : ''}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <InfoPanel label="Amount" value={`${payment.amount} ${payment.assetCode}`} note="Service fee" />
                  <InfoPanel label="Ledger" value={payment.ledger ? String(payment.ledger) : 'Pending'} note="Horizon verification" />
                  <InfoPanel label="Created" value={formatDate(payment.createdAt)} note={payment.verifiedAt ? `Verified ${formatDate(payment.verifiedAt)}` : 'Awaiting payment'} />
                </div>
                {payment.transactionHash ? <p className="mt-4 break-all rounded-2xl bg-slate-50 p-4 font-mono text-xs font-bold text-slate-600 ring-1 ring-slate-100">{payment.transactionHash}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <a href={`/${tenantSlug}/payments/${payment.referenceCode}`} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary">Payment page</a>
                <a href={`/${tenantSlug}/receipts/${payment.referenceCode}`} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-primary">Receipt</a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const config = contentConfig[activeContent];

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

  async function saveItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    const nextBody = { ...form };

    if (activeContent === 'users' && !editingId && String(nextBody.password || '').trim().length < 8) {
      setError('Password must be at least 8 characters when creating a staff user.');
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
      setIsSaving(false);
      return;
    }

    setSuccess(`${config.label} saved successfully.`);
    resetForm();
    await loadItems();
    setIsSaving(false);
  }

  async function archiveItem(item: ContentItem) {
    setError('');
    setSuccess('');

    const response = await fetch(`/api/tenant/${tenantSlug}/${config.endpoint}/${item.id}`, {
      method: 'DELETE'
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to archive item.');
      return;
    }

    setSuccess(`${config.label} archived.`);
    await loadItems();
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card className="">
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">Content manager</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Manage public content</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Keep services, contacts, announcements, categories, departments, and staff accounts up to date.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {contentTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => switchContent(tab)}
              className={`rounded-2xl px-3 py-2 text-sm font-extrabold transition ${
                activeContent === tab ? 'btn-primary' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {contentConfig[tab].label}
            </button>
          ))}
        </div>

        <form onSubmit={saveItem} className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <h3 className="font-extrabold text-slate-900">{editingId ? 'Edit item' : 'Create item'}</h3>
          {config.fields.map((field) => (
            <div key={field.name}>
              {field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 text-sm font-extrabold text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.name])}
                    onChange={(event) => updateForm(field.name, event.target.checked)}
                  />
                  {field.label}
                </label>
              ) : (
                <>
                  <label className="text-sm font-extrabold text-slate-700">{field.label}{activeContent === 'users' && field.name === 'password' ? (editingId ? ' (leave blank to keep current)' : ' (required for new user)') : ''}</label>
                  {field.type === 'textarea' ? (
                    <Textarea
                      required={field.required}
                      value={String(form[field.name] ?? '')}
                      onChange={(event) => updateForm(field.name, event.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <Select
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
                      type={field.type || 'text'}
                      required={field.required}
                      value={field.type === 'date' ? toInputDate(form[field.name]) : String(form[field.name] ?? '')}
                      onChange={(event) => updateForm(field.name, field.type === 'number' ? Number(event.target.value) : event.target.value)}
                    />
                  )}
                </>
              )}
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button disabled={isSaving}>{isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create'}</Button>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-700">
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Library</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">{config.label}</h2>
          </div>
          <button onClick={() => loadItems()} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary">Refresh</button>
        </div>

        <div className="mt-5 grid gap-3">
          {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : null}
          {!isLoading && items.length === 0 ? <p className="text-sm text-slate-500">No items yet.</p> : null}
          {items.map((item) => {
            const title = String(item.title || item.name || 'Untitled');
            const description = String(item.description || item.excerpt || item.email || item.phone || item.role || 'No description');
            const isActive = item.isActive ?? item.isPublished ?? true;

            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(16,24,40,0.05)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-extrabold text-slate-900">{title}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{description}</p>
                  </div>
                  <span className={`rounded-xl px-3 py-1 text-xs font-extrabold ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isActive ? 'Live' : 'Archived'}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => startEdit(item)} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-primary">Edit</button>
                  <button onClick={() => archiveItem(item)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-extrabold text-slate-700">Archive</button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}


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
      setError(payload.error || 'Unable to load Stellar wallet settings.');
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
      setError(payload.error || 'Unable to update Stellar wallet.');
      setIsBusy(false);
      return;
    }

    syncWallet(payload.data);
    setSuccess(message);
    setIsBusy(false);
  }

  const hasWallet = Boolean(wallet?.receivingPublicKey);

  return (
    <div className="rounded-2xl bg-blue-50/70 p-5 ring-1 ring-blue-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">Real Stellar Testnet wallet</p>
          <h3 className="mt-2 text-xl font-extrabold text-slate-950">Tenant receiving wallet</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            This is the official payment address for the tenant. For normal setup, do not type anything in the key fields. Click
            <span className="font-extrabold text-slate-900"> Generate Testnet Wallet</span> and the app will create and fill the receiving public key automatically.
          </p>
        </div>
        <span className="rounded-full bg-white px-4 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200">
          {wallet?.status ? niceLabel(wallet.status) : 'Loading'}
        </span>
      </div>

      {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}
      {success ? <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700 ring-1 ring-emerald-200">{success}</p> : null}
      {wallet?.error ? <p className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-800 ring-1 ring-amber-200">{wallet.error}</p> : null}

      {!hasWallet ? (
        <div className="mt-5 rounded-xl bg-white p-5 ring-1 ring-blue-100">
          <p className="text-sm font-extrabold text-slate-950">No receiving wallet is configured yet.</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This is why public payment requests show “The receiving Stellar wallet is not configured for this service.” Start with the button below.
            It creates a real Testnet account, saves the public key, encrypts the secret key on the server, and requests Testnet XLM from Friendbot.
          </p>
          <button disabled={isBusy} onClick={() => walletAction('/generate', { fund: true }, 'Generated and funded a real Stellar Testnet receiving wallet.')} className="mt-4 rounded-xl px-5 py-3 text-sm font-extrabold btn-primary disabled:opacity-60">
            Generate Testnet Wallet
          </button>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <InfoPanel label="Network" value={wallet?.network || network} note="Use Testnet while developing" />
        <InfoPanel label="Stored secret" value={wallet?.hasStoredSecret ? 'Encrypted' : 'Not stored'} note="Never exposed to citizens" />
        <InfoPanel label="Last checked" value={wallet?.lastCheckedAt ? formatDate(wallet.lastCheckedAt) : 'Not checked'} note={wallet?.lastFundedAt ? `Funded ${formatDate(wallet.lastFundedAt)}` : 'Friendbot funds Testnet accounts'} />
      </div>

      <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-blue-100">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Current receiving public key</p>
        <p className="mt-2 break-all font-mono text-sm font-bold text-slate-950">
          {wallet?.receivingPublicKey || 'Not configured yet. Click Generate Testnet Wallet.'}
        </p>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          This is the destination address used in SEP-7 payment QR codes. It starts with G when configured.
        </p>
      </div>

      {wallet?.balances?.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {wallet.balances.map((balance, index) => (
            <div key={`${balance.assetCode}-${index}`} className="rounded-2xl bg-white p-4 ring-1 ring-blue-100">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{balance.assetCode || balance.assetType}</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">{balance.balance}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 rounded-xl bg-white p-5 ring-1 ring-blue-100">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h4 className="text-base font-extrabold text-slate-950">Advanced wallet configuration</h4>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              Use this only when importing an existing Testnet wallet or changing network endpoints. New users should use Generate Testnet Wallet instead.
            </p>
          </div>
          <button disabled={isBusy} onClick={() => walletAction('/check', {}, 'Wallet status checked on Horizon.')} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary disabled:opacity-60">
            Check Horizon Status
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="text-sm font-extrabold text-slate-700">Existing public key import</label>
            <Input value={publicKey} onChange={(event) => setPublicKey(event.target.value)} placeholder="Paste a G... account address only if you already created a Testnet wallet elsewhere" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Normal setup fills this automatically after generation.</p>
          </div>
          <div>
            <label className="text-sm font-extrabold text-slate-700">Existing secret key import</label>
            <Input type="password" value={secretKey} onChange={(event) => setSecretKey(event.target.value)} placeholder="Optional S... secret seed for importing an existing Testnet wallet" />
            <p className="mt-2 text-xs font-semibold text-slate-500">Leave blank unless you are importing an existing wallet. Secret keys are encrypted server-side and never returned by the API.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-extrabold text-slate-700">Network</label>
              <Select value={network} onChange={(event) => setNetwork(event.target.value)}>
                <option value="TESTNET">Testnet</option>
                <option value="MAINNET">Mainnet-ready config</option>
              </Select>
            </div>
            <div>
              <label className="text-sm font-extrabold text-slate-700">Network passphrase</label>
              <Input value={networkPassphrase} onChange={(event) => setNetworkPassphrase(event.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-extrabold text-slate-700">Horizon URL</label>
              <Input value={horizonUrl} onChange={(event) => setHorizonUrl(event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-extrabold text-slate-700">Friendbot URL</label>
              <Input value={friendbotUrl} onChange={(event) => setFriendbotUrl(event.target.value)} />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button disabled={isBusy} onClick={() => walletAction('/generate', { fund: true }, 'Generated and funded a real Stellar Testnet receiving wallet.')} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-primary disabled:opacity-60">
            Generate New Testnet Wallet
          </button>
          <button disabled={isBusy || !wallet?.receivingPublicKey} onClick={() => walletAction('/fund', {}, 'Friendbot funding request completed.')} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary disabled:opacity-60">
            Fund with Friendbot
          </button>
          <button disabled={isBusy} onClick={() => walletAction('', { publicKey, secretKey, network, horizonUrl, friendbotUrl, networkPassphrase }, 'Stellar wallet settings saved.')} className="rounded-xl px-4 py-2 text-sm font-extrabold btn-secondary disabled:opacity-60">
            Save Advanced Config
          </button>
        </div>
      </div>
    </div>
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
    return <Card><p className="text-sm text-slate-500">Loading organization settings...</p></Card>;
  }

  return (
    <Card className="max-w-4xl ">
      <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">Organization settings</p>
      <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Customize the public experience</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">These settings control the organization name, messaging, brand color, and public contact details.</p>

      <div className="mt-6">
        <StellarWalletPanel tenantSlug={tenantSlug} />
      </div>

      <form onSubmit={saveSettings} className="mt-6 grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-extrabold text-slate-700">Tenant name</label>
            <Input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-extrabold text-slate-700">City name</label>
            <Input required value={form.cityName} onChange={(event) => updateForm('cityName', event.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-extrabold text-slate-700">Tagline</label>
          <Input required value={form.tagline} onChange={(event) => updateForm('tagline', event.target.value)} />
        </div>
        <div>
          <label className="text-sm font-extrabold text-slate-700">Description</label>
          <Textarea required value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="text-sm font-extrabold text-slate-700">Email</label>
            <Input value={form.email || ''} onChange={(event) => updateForm('email', event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-extrabold text-slate-700">Phone</label>
            <Input value={form.phone || ''} onChange={(event) => updateForm('phone', event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-extrabold text-slate-700">Primary color</label>
            <Input value={form.primaryColor} onChange={(event) => updateForm('primaryColor', event.target.value)} />
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-100">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--brand)]">Default payment asset</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-extrabold text-slate-700">Default asset code</label>
              <Input value={form.stellarDefaultAssetCode || 'XLM'} onChange={(event) => updateForm('stellarDefaultAssetCode', event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-extrabold text-slate-700">Default asset issuer</label>
              <Input value={form.stellarDefaultAssetIssuer || ''} onChange={(event) => updateForm('stellarDefaultAssetIssuer', event.target.value)} placeholder="Required only for non-XLM assets" />
            </div>
          </div>
        </div>
        <div>
          <label className="text-sm font-extrabold text-slate-700">Address</label>
          <Input value={form.address || ''} onChange={(event) => updateForm('address', event.target.value)} />
        </div>
        <Button disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</Button>
      </form>
    </Card>
  );
}
