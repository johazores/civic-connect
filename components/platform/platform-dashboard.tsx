'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FiArrowUpRight,
  FiCheckCircle,
  FiExternalLink,
  FiGlobe,
  FiKey,
  FiLogOut,
  FiPlus,
  FiRefreshCw,
  FiShield,
  FiX
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';

type TenantStats = { reports: number; services: number; staff: number; citizens: number; payments: number; verifiedPayments: number; rewards: number; disbursements: number };
type TenantRow = {
  id: string;
  slug: string;
  name: string;
  cityName: string;
  tagline: string;
  primaryColor: string;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  walletStatus: string;
  walletConfigured: boolean;
  createdAt: string;
  stats: TenantStats;
};

const emptyCreate = {
  name: '',
  slug: '',
  cityName: '',
  tagline: '',
  email: '',
  phone: '',
  primaryColor: '#1a497b',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  seedDefaults: true
};

export function PlatformDashboard() {
  const [tenants, setTenants] = useState<TenantRow[] | null>(null);
  const [error, setError] = useState('');
  const [sheet, setSheet] = useState<'create' | 'reset' | null>(null);
  const [activeTenant, setActiveTenant] = useState<TenantRow | null>(null);
  const [busyId, setBusyId] = useState('');

  async function load() {
    const response = await fetch('/api/platform/tenants', { cache: 'no-store' });

    if (response.status === 401) {
      window.location.href = '/root/login';
      return;
    }

    const payload = await response.json();
    if (!response.ok) {
      setError(payload.error || 'Unable to load tenants.');
      return;
    }
    setTenants(payload.data);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function logout() {
    await fetch('/api/platform/logout', { method: 'POST' });
    window.location.href = '/root/login';
  }

  async function toggleActive(tenant: TenantRow) {
    setBusyId(tenant.id);
    await fetch(`/api/platform/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !tenant.isActive })
    });
    setBusyId('');
    load();
  }

  const totals = tenants
    ? {
        tenants: tenants.length,
        active: tenants.filter((t) => t.isActive).length,
        reports: tenants.reduce((n, t) => n + t.stats.reports, 0),
        verified: tenants.reduce((n, t) => n + t.stats.verifiedPayments, 0)
      }
    : { tenants: 0, active: 0, reports: 0, verified: 0 };

  return (
    <div className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <div className="app-mark">CT</div>
            <div className="min-w-0">
              <p className="app-title truncate">Platform Console</p>
              <p className="app-subtitle truncate">Root administration</p>
            </div>
          </div>
          <button type="button" onClick={logout} aria-label="Sign out" className="app-icon-btn">
            <FiLogOut aria-hidden="true" className="h-5 w-5" />
          </button>
        </header>

        <div className="civic-viewport">
          <main className="page-section">
            <div className="app-pulse-card p-5">
              <div className="relative z-10">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#9fc0e6]">Platform overview</p>
                <p className="mt-2 text-[13px] font-medium leading-6 text-[#b9d0ea]">Every city organization on CivicTrust, in one place.</p>
                <div className="mt-4 flex gap-5 border-t border-white/15 pt-4">
                  <Metric value={String(totals.tenants)} label="Tenants" />
                  <Metric value={String(totals.active)} label="Active" />
                  <Metric value={String(totals.reports)} label="Reports" />
                  <Metric value={String(totals.verified)} label="Verified pay" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTenant(null);
                setSheet('create');
              }}
              className="app-btn btn-primary btn-block mt-4"
            >
              <FiPlus aria-hidden="true" className="h-4 w-4" /> Create a new city tenant
            </button>

            {error ? (
              <p className="mt-4 rounded-[14px] bg-[var(--ember-soft)] p-4 text-sm font-semibold text-[var(--ember-600)]">{error}</p>
            ) : null}

            <div className="section-head">
              <h2>Tenants</h2>
              <button type="button" onClick={load} className="inline-flex items-center gap-1 text-[13px] font-bold text-[var(--ember)]">
                <FiRefreshCw aria-hidden="true" className="h-3.5 w-3.5" /> Refresh
              </button>
            </div>

            {tenants === null ? (
              <div className="grid gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="card">
                    <div className="skeleton-line w-32" />
                    <div className="mt-3 skeleton-line h-5 w-48" />
                    <div className="mt-3 skeleton-line w-24" />
                  </div>
                ))}
              </div>
            ) : tenants.length === 0 ? (
              <div className="empty">
                <div className="eart">
                  <FiGlobe aria-hidden="true" className="h-8 w-8" />
                </div>
                <h3>No tenants yet</h3>
                <p>Create your first city organization to get started.</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {tenants.map((tenant) => (
                  <article key={tenant.id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">/{tenant.slug}</p>
                        <h3 className="mt-0.5 break-words font-display text-[16px] font-bold text-[var(--ink)]">{tenant.name}</h3>
                        <p className="mt-0.5 text-[13px] font-medium text-[var(--muted)]">{tenant.cityName}</p>
                      </div>
                      <span className={`status-pill shrink-0 ${tenant.isActive ? 'bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]' : 'bg-[var(--surface-2)] text-[var(--muted)]'}`}>
                        {tenant.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                      <Stat label="Reports" value={tenant.stats.reports} />
                      <Stat label="Services" value={tenant.stats.services} />
                      <Stat label="Citizens" value={tenant.stats.citizens} />
                      <Stat label="Verified pay" value={tenant.stats.verifiedPayments} />
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[var(--muted)]">
                      <FiShield aria-hidden="true" className="h-3.5 w-3.5" />
                      Wallet: {tenant.walletConfigured ? tenant.walletStatus : 'Not configured'}
                    </div>

                    <div className="mt-4 grid gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Link href={`/${tenant.slug}`} className="app-btn btn-outline btn-compact">
                          <FiExternalLink aria-hidden="true" className="h-4 w-4" /> Open site
                        </Link>
                        <Link href={`/${tenant.slug}/admin`} className="app-btn btn-outline btn-compact">
                          <FiArrowUpRight aria-hidden="true" className="h-4 w-4" /> Admin
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTenant(tenant);
                            setSheet('reset');
                          }}
                          className="app-btn btn-outline btn-compact"
                        >
                          <FiKey aria-hidden="true" className="h-4 w-4" /> Set admin
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleActive(tenant)}
                          disabled={busyId === tenant.id}
                          className="app-btn btn-outline btn-compact"
                        >
                          {tenant.isActive ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="pad-b" />
          </main>
        </div>

        {sheet ? (
          <>
            <button type="button" className="sheet-backdrop backdrop-in" aria-label="Close" onClick={() => setSheet(null)} tabIndex={-1} />
            <div className="sheet sheet-in" role="dialog" aria-modal="true">
              <div className="sheet-grab" />
              <div className="sheet-head">
                <div className="min-w-0">
                  <h2>{sheet === 'create' ? 'New city tenant' : `Set admin · ${activeTenant?.slug}`}</h2>
                  <p className="sheet-sub truncate">{sheet === 'create' ? 'Creates the org and its first admin' : 'Reset or create the tenant admin login'}</p>
                </div>
                <button type="button" onClick={() => setSheet(null)} aria-label="Close" className="app-icon-btn">
                  <FiX aria-hidden="true" className="h-5 w-5" />
                </button>
              </div>
              <div className="sheet-scroll">
                {sheet === 'create' ? (
                  <CreateTenantForm
                    onDone={() => {
                      setSheet(null);
                      load();
                    }}
                  />
                ) : activeTenant ? (
                  <ResetAdminForm tenant={activeTenant} onDone={() => setSheet(null)} />
                ) : null}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function CreateTenantForm({ onDone }: { onDone: () => void }) {
  const [form, setForm] = useState({ ...emptyCreate });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key: string, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const response = await fetch('/api/platform/tenants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error || 'Unable to create tenant.');
      return;
    }
    setSuccess(`Created /${payload.data.slug}. Admin: ${payload.data.adminEmail}`);
    window.setTimeout(onDone, 1400);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 pb-2">
      <Field label="Organization name" required>
        <input className="input" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Riverside City Services" />
      </Field>
      <Field label="URL slug" hint="Lowercase letters, numbers, hyphens">
        <input className="input" value={form.slug} onChange={(e) => update('slug', e.target.value)} placeholder="riverside-city" />
      </Field>
      <Field label="City / locality" required>
        <input className="input" required value={form.cityName} onChange={(e) => update('cityName', e.target.value)} placeholder="Riverside City" />
      </Field>
      <Field label="Tagline">
        <input className="input" value={form.tagline} onChange={(e) => update('tagline', e.target.value)} placeholder="Trusted city services in one app" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Contact email">
          <input className="input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="hello@city.gov" />
        </Field>
        <Field label="Brand color">
          <input className="input" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} placeholder="#1a497b" />
        </Field>
      </div>

      <p className="group-label mt-1">First administrator</p>
      <Field label="Admin name">
        <input className="input" value={form.adminName} onChange={(e) => update('adminName', e.target.value)} placeholder="Operations Administrator" />
      </Field>
      <Field label="Admin email" required>
        <input className="input" type="email" required value={form.adminEmail} onChange={(e) => update('adminEmail', e.target.value)} placeholder="admin@city.gov" />
      </Field>
      <Field label="Admin password" hint="At least 8 characters" required>
        <input className="input" type="text" required value={form.adminPassword} onChange={(e) => update('adminPassword', e.target.value)} placeholder="Set a strong password" />
      </Field>

      <label className="flex items-center gap-3 text-[13px] font-semibold text-[var(--ink-2)]">
        <button type="button" role="switch" aria-checked={form.seedDefaults} onClick={() => update('seedDefaults', !form.seedDefaults)} className={`switch ${form.seedDefaults ? 'on' : ''}`.trim()} aria-label="Seed default categories" />
        Seed default report categories &amp; departments
      </label>

      {error ? <p className="rounded-[14px] bg-[var(--ember-soft)] p-3 text-sm font-semibold text-[var(--ember-600)]">{error}</p> : null}
      {success ? <p className="rounded-[14px] bg-[color-mix(in_srgb,var(--heat-1)_12%,var(--surface))] p-3 text-sm font-semibold text-[#0f806d]"><FiCheckCircle className="mr-1 inline h-4 w-4" />{success}</p> : null}

      <Button type="submit" disabled={loading} className="btn-block">
        <FiPlus className="h-4 w-4" /> {loading ? 'Creating...' : 'Create tenant'}
      </Button>
    </form>
  );
}

function ResetAdminForm({ tenant, onDone }: { tenant: TenantRow; onDone: () => void }) {
  const [form, setForm] = useState({ name: '', email: tenant.email || '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const response = await fetch(`/api/platform/tenants/${tenant.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(payload.error || 'Unable to set admin.');
      return;
    }
    setSuccess(`Admin ready: ${payload.data.email}`);
    window.setTimeout(onDone, 1400);
  }

  return (
    <form onSubmit={submit} className="grid gap-4 pb-2">
      <p className="text-[13px] font-medium leading-6 text-[var(--muted)]">
        Set (or reset) an admin login for <b className="text-[var(--ink)]">{tenant.name}</b>. They can then sign in at
        <span className="break-all font-mono"> /{tenant.slug}/admin/login</span>.
      </p>
      <Field label="Admin name">
        <input className="input" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Operations Administrator" />
      </Field>
      <Field label="Admin email" required>
        <input className="input" type="email" required value={form.email} onChange={(e) => setForm((c) => ({ ...c, email: e.target.value }))} placeholder="admin@city.gov" />
      </Field>
      <Field label="New password" hint="At least 8 characters" required>
        <input className="input" type="text" required value={form.password} onChange={(e) => setForm((c) => ({ ...c, password: e.target.value }))} placeholder="Set a strong password" />
      </Field>

      {error ? <p className="rounded-[14px] bg-[var(--ember-soft)] p-3 text-sm font-semibold text-[var(--ember-600)]">{error}</p> : null}
      {success ? <p className="rounded-[14px] bg-[color-mix(in_srgb,var(--heat-1)_12%,var(--surface))] p-3 text-sm font-semibold text-[#0f806d]"><FiCheckCircle className="mr-1 inline h-4 w-4" />{success}</p> : null}

      <Button type="submit" disabled={loading} className="btn-block">
        <FiKey className="h-4 w-4" /> {loading ? 'Saving...' : 'Save admin login'}
      </Button>
    </form>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="field mb-0">
      <label className="input-label">
        {label} {required ? <span className="text-[var(--ember)]">*</span> : hint ? <span className="font-medium text-[var(--muted)]">· {hint}</span> : null}
      </label>
      {children}
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0">
      <b className="block font-display text-[17px] font-bold text-white">{value}</b>
      <span className="text-[11px] font-semibold text-[#9fc0e6]">{label}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[12px] bg-[var(--surface-2)] px-3 py-2">
      <p className="font-display text-[16px] font-bold text-[var(--ink)]">{value}</p>
      <p className="text-[11px] font-semibold text-[var(--muted)]">{label}</p>
    </div>
  );
}
