'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Mode = 'login' | 'register';

export function CitizenAuthForm({ tenantSlug, mode }: { tenantSlug: string; mode: Mode }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === 'register';

  function updateField(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isRegister ? 'register' : 'login';
    const response = await fetch(`/api/tenant/${tenantSlug}/citizens/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to continue.');
      setIsLoading(false);
      return;
    }

    window.location.href = `/${tenantSlug}/dashboard`;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <Card className="relative overflow-hidden p-6 md:p-8">
        <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="relative">
          <p className="section-eyebrow">Citizen account</p>
          <h1 className="heading-display mt-5 text-4xl md:text-6xl">{isRegister ? 'Create a secure account.' : 'Welcome back.'}</h1>
          <p className="mt-5 text-sm font-medium leading-7 text-slate-600 md:text-base">
            Save reports, track service updates, and keep a complete request history across devices.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['Saved', 'Reports stay connected to your profile'],
              ['Clear', 'Updates are shown in one place'],
              ['Fast', 'No need to re-enter references']
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(16,24,40,0.05)]">
                <p className="text-sm font-extrabold text-[var(--brand)]">{title}</p>
                <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-6">
          <p className="section-eyebrow">{isRegister ? 'Register' : 'Sign in'}</p>
          <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-slate-950">{isRegister ? 'Start tracking requests' : 'Access your dashboard'}</h2>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">Use your citizen account to view reports and updates securely.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          {isRegister ? (
            <div>
              <label className="input-label">Full name</label>
              <Input required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Enter your full name" autoComplete="name" />
            </div>
          ) : null}

          <div>
            <label className="input-label">Email</label>
            <Input required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="Enter your email address" autoComplete="email" />
          </div>

          {isRegister ? (
            <div>
              <label className="input-label">Phone</label>
              <Input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="Enter your mobile number" autoComplete="tel" />
            </div>
          ) : null}

          <div>
            <label className="input-label">Password</label>
            <Input required type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Enter your password" autoComplete={isRegister ? 'new-password' : 'current-password'} />
          </div>

          {error ? <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-800 ring-1 ring-rose-200">{error}</p> : null}

          <Button disabled={isLoading}>{isLoading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}</Button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-600">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <Link href={`/${tenantSlug}/login`} className="font-bold text-[var(--brand)]">Sign in</Link>.
            </p>
          ) : (
            <p>
              Need a citizen account?{' '}
              <Link href={`/${tenantSlug}/register`} className="font-bold text-[var(--brand)]">Create one</Link>.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
