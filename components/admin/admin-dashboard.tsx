'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatCard } from '@/components/ui/stat-card';
import { formatDate } from '@/lib/format';

const reportStatuses = ['SUBMITTED', 'REVIEWING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const reportPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];
const mainTabs = ['command-center', 'content-studio', 'tenant-settings'] as const;
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
      { name: 'isActive', label: 'Active', type: 'checkbox' }
    ],
    empty: { id: '', title: '', description: '', department: '', linkUrl: '', sortOrder: 0, isActive: true }
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
  const [activeTab, setActiveTab] = useState<MainTab>('command-center');
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
    <div className="min-h-screen bg-transparent text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <div>
            <p className="section-eyebrow">Civic Admin</p>
            <h1 className="text-xl font-black text-slate-900">{tenant?.name || 'Admin Dashboard'}</h1>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <a href={`/${tenantSlug}`} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm">
              Public Site
            </a>
            <button onClick={handleLogout} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-black text-white shadow-sm">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:px-6">
        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-slate-50 p-6 text-slate-900 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="section-eyebrow">Operations overview</p>
              <h2 className="mt-3 text-3xl font-black md:text-5xl">Resolve reports faster, keep citizens updated.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                Review incoming concerns, assign them to departments, publish updates, and manage the public content of this tenant.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-3xl font-black text-blue-700">{Math.max(0, stats.total - stats.resolved)}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Active reports</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-3xl font-black text-amber-600">{stats.urgent}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Urgent flags</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-3xl font-black text-emerald-600">{stats.resolved}</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-slate-500">Completed</p>
              </div>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-slate-200 bg-white p-2 shadow-sm backdrop-blur">
          {mainTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-2xl px-4 py-3 text-sm font-black capitalize transition ${
                activeTab === tab ? 'bg-[var(--brand)] text-white shadow-sm' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {niceLabel(tab)}
            </button>
          ))}
        </div>

        {error && <p className="rounded-2xl bg-rose-50 p-4 text-sm font-black text-rose-700 ring-1 ring-rose-200">{error}</p>}
        {success && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-700 ring-1 ring-emerald-200">{success}</p>}

        {activeTab === 'command-center' ? (
          <section className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Total Reports" value={stats.total} />
              <StatCard label="Submitted" value={stats.submitted} />
              <StatCard label="In Progress" value={stats.inProgress} />
              <StatCard label="Unassigned" value={stats.unassigned} />
            </div>

            <Card className="bg-white shadow-sm">
              <form onSubmit={applyFilters} className="grid gap-4 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr_0.8fr_auto] lg:items-end">
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Search</label>
                  <Input value={filters.search} onChange={(event) => updateFilters('search', event.target.value)} placeholder="Reference, name, issue, location" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Status</label>
                  <Select value={filters.status} onChange={(event) => updateFilters('status', event.target.value)}>
                    <option value="ALL">All</option>
                    {reportStatuses.map((item) => <option key={item} value={item}>{niceLabel(item)}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Category</label>
                  <Select value={filters.categoryId} onChange={(event) => updateFilters('categoryId', event.target.value)}>
                    <option value="ALL">All</option>
                    {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Department</label>
                  <Select value={filters.departmentId} onChange={(event) => updateFilters('departmentId', event.target.value)}>
                    <option value="ALL">All</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    {departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Priority</label>
                  <Select value={filters.priority} onChange={(event) => updateFilters('priority', event.target.value)}>
                    <option value="ALL">All</option>
                    {reportPriorities.map((item) => <option key={item} value={item}>{niceLabel(item)}</option>)}
                  </Select>
                </div>
                <Button disabled={isLoading}>{isLoading ? 'Loading...' : 'Apply'}</Button>
              </form>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Queue</p>
                    <h2 className="mt-1 text-xl font-black text-slate-900">Citizen reports</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={exportReports} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-black text-white">
                      Export CSV
                    </button>
                    <button onClick={() => loadReports(filters)} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">
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
                      className={`rounded-3xl border p-4 text-left transition ${
                        selectedReport?.id === report.id
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Report #{index + 1} · {report.referenceCode}</p>
                          <p className="mt-2 font-black text-slate-900">{report.title}</p>
                        </div>
                        <Badge value={report.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{report.category.name}</span>
                        <span className="rounded-xl bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{niceLabel(report.priority)}</span>
                        <span className="rounded-xl bg-indigo-50 px-3 py-1 text-xs font-black text-indigo-700">{report.department?.name || 'Unassigned'}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">{report.locationText}</p>
                    </button>
                  ))}
                </div>
              </Card>

              <Card className="bg-white shadow-sm">
                {selectedReport ? (
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">{selectedReport.referenceCode}</p>
                        <h2 className="mt-2 text-2xl font-black text-slate-900">{selectedReport.title}</h2>
                        <p className="mt-2 text-sm text-slate-500">Submitted {formatDate(selectedReport.submittedAt)}</p>
                      </div>
                      <Badge value={selectedReport.status} />
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <InfoPanel label="Citizen" value={selectedReport.reporterName} note={selectedReport.reporterEmail || selectedReport.reporterPhone || 'No contact'} />
                      <InfoPanel label="Location" value={selectedReport.locationText} note={selectedReport.category.name} />
                      <InfoPanel label="Owner" value={selectedReport.department?.name || 'Unassigned'} note={`${niceLabel(selectedReport.priority)} priority`} />
                    </div>

                    <p className="mt-6 rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-600 ring-1 ring-slate-100">{selectedReport.description}</p>

                    {selectedReport.attachments.length > 0 ? (
                      <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {selectedReport.attachments.map((attachment) => (
                          <a key={attachment.id} href={attachment.imageUrl} target="_blank" className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-100" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={attachment.imageUrl} alt="Report attachment" className="h-52 w-full object-cover" />
                          </a>
                        ))}
                      </div>
                    ) : null}

                    <form onSubmit={handleStatusUpdate} className="mt-8 grid gap-4 rounded-[2rem] bg-slate-50 p-5 ring-1 ring-slate-100">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">Action panel</p>
                          <h3 className="mt-1 font-black text-slate-900">Update report progress</h3>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-black text-slate-700">
                          <input type="checkbox" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} />
                          Public update
                        </label>
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-black text-slate-700">Status</label>
                          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
                            {reportStatuses.map((item) => <option key={item} value={item}>{niceLabel(item)}</option>)}
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-black text-slate-700">Priority</label>
                          <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
                            {reportPriorities.map((item) => <option key={item} value={item}>{niceLabel(item)}</option>)}
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-black text-slate-700">Department</label>
                          <Select value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}>
                            <option value="">Unassigned</option>
                            {departments.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-black text-slate-700">Update message</label>
                        <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a clear update for the citizen or internal team" />
                      </div>
                      <Button disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Update'}</Button>
                    </form>

                    <div className="mt-8">
                      <h3 className="text-lg font-black text-slate-900">Timeline</h3>
                      <div className="mt-4 grid gap-3">
                        {selectedReport.updates.map((update) => (
                          <div key={update.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Badge value={update.status} />
                              <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">{update.isPublic ? 'Public' : 'Internal'}</span>
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

        {activeTab === 'content-studio' ? (
          <ContentStudio tenantSlug={tenantSlug} activeTab={activeTab} setError={setError} setSuccess={setSuccess} />
        ) : null}

        {activeTab === 'tenant-settings' ? (
          <TenantSettingsPanel tenantSlug={tenantSlug} tenant={tenant} setTenant={setTenant} setError={setError} setSuccess={setSuccess} />
        ) : null}
      </main>
    </div>
  );
}

function InfoPanel({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-3xl bg-slate-50 p-4 ring-1 ring-slate-100">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1 font-black text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{note}</p>
    </div>
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
      <Card className="bg-white shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-700">Content studio</p>
        <h2 className="mt-2 text-2xl font-black text-slate-900">Manage tenant content</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Update the public app without touching code.</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {contentTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => switchContent(tab)}
              className={`rounded-2xl px-3 py-2 text-sm font-black transition ${
                activeContent === tab ? 'bg-[var(--brand)] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {contentConfig[tab].label}
            </button>
          ))}
        </div>

        <form onSubmit={saveItem} className="mt-6 grid gap-4 rounded-[2rem] bg-slate-50 p-5 ring-1 ring-slate-100">
          <h3 className="font-black text-slate-900">{editingId ? 'Edit item' : 'Create item'}</h3>
          {config.fields.map((field) => (
            <div key={field.name}>
              {field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 text-sm font-black text-slate-700">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.name])}
                    onChange={(event) => updateForm(field.name, event.target.checked)}
                  />
                  {field.label}
                </label>
              ) : (
                <>
                  <label className="text-sm font-black text-slate-700">{field.label}{activeContent === 'users' && field.name === 'password' ? (editingId ? ' (leave blank to keep current)' : ' (required for new user)') : ''}</label>
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
              <button type="button" onClick={resetForm} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700">
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </Card>

      <Card className="bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Library</p>
            <h2 className="mt-1 text-xl font-black text-slate-900">{config.label}</h2>
          </div>
          <button onClick={() => loadItems()} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">Refresh</button>
        </div>

        <div className="mt-5 grid gap-3">
          {isLoading ? <p className="text-sm text-slate-500">Loading...</p> : null}
          {!isLoading && items.length === 0 ? <p className="text-sm text-slate-500">No items yet.</p> : null}
          {items.map((item) => {
            const title = String(item.title || item.name || 'Untitled');
            const description = String(item.description || item.excerpt || item.email || item.phone || item.role || 'No description');
            const isActive = item.isActive ?? item.isPublished ?? true;

            return (
              <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-900">{title}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{description}</p>
                  </div>
                  <span className={`rounded-xl px-3 py-1 text-xs font-black ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {isActive ? 'Live' : 'Archived'}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => startEdit(item)} className="rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-black text-white">Edit</button>
                  <button onClick={() => archiveItem(item)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-black text-slate-700">Archive</button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
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
    setSuccess('Tenant settings saved.');
    setIsSaving(false);
  }

  if (!form) {
    return <Card><p className="text-sm text-slate-500">Loading tenant settings...</p></Card>;
  }

  return (
    <Card className="max-w-4xl bg-white shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-700">Tenant settings</p>
      <h2 className="mt-2 text-2xl font-black text-slate-900">Customize public experience</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">These settings control the name, copy, and contact details shown on the tenant site.</p>

      <form onSubmit={saveSettings} className="mt-6 grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-black text-slate-700">Tenant name</label>
            <Input required value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-black text-slate-700">City name</label>
            <Input required value={form.cityName} onChange={(event) => updateForm('cityName', event.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-black text-slate-700">Tagline</label>
          <Input required value={form.tagline} onChange={(event) => updateForm('tagline', event.target.value)} />
        </div>
        <div>
          <label className="text-sm font-black text-slate-700">Description</label>
          <Textarea required value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label className="text-sm font-black text-slate-700">Email</label>
            <Input value={form.email || ''} onChange={(event) => updateForm('email', event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-black text-slate-700">Phone</label>
            <Input value={form.phone || ''} onChange={(event) => updateForm('phone', event.target.value)} />
          </div>
          <div>
            <label className="text-sm font-black text-slate-700">Primary color</label>
            <Input value={form.primaryColor} onChange={(event) => updateForm('primaryColor', event.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-sm font-black text-slate-700">Address</label>
          <Input value={form.address || ''} onChange={(event) => updateForm('address', event.target.value)} />
        </div>
        <Button disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Settings'}</Button>
      </form>
    </Card>
  );
}
