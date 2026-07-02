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
      <Card className="bg-gradient-to-br from-blue-50 via-white to-slate-50 p-6 md:p-8">
        <p className="section-eyebrow">Citizen access</p>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950 md:text-5xl">
          {isRegister ? 'Create your citizen account' : 'Welcome back'}
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">
          Keep your reports in one place, track progress without retyping reference numbers, and receive clear public updates from the city team.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ['01', 'Submit reports'],
            ['02', 'Track progress'],
            ['03', 'View history']
          ].map(([number, label]) => (
            <div key={number} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
              <p className="text-lg font-bold text-[var(--brand)]">{number}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="shadow-md shadow-slate-900/[0.04]">
        <div className="mb-6">
          <p className="section-eyebrow">{isRegister ? 'Register' : 'Login'}</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{isRegister ? 'Start tracking city requests' : 'Access your dashboard'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5">
          {isRegister ? (
            <div>
              <label className="text-sm font-semibold text-slate-700">Full name</label>
              <Input required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Juan Dela Cruz" />
            </div>
          ) : null}

          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <Input required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="citizen@example.com" />
          </div>

          {isRegister ? (
            <div>
              <label className="text-sm font-semibold text-slate-700">Phone</label>
              <Input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="09xx xxx xxxx" />
            </div>
          ) : null}

          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <Input required type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="At least 8 characters" />
          </div>

          {error ? <p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}

          <Button disabled={isLoading}>{isLoading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}</Button>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {isRegister ? (
            <p>
              Already have an account?{' '}
              <Link href={`/${tenantSlug}/login`} className="font-semibold text-[var(--brand)]">Login here</Link>.
            </p>
          ) : (
            <p>
              No citizen account yet?{' '}
              <Link href={`/${tenantSlug}/register`} className="font-semibold text-[var(--brand)]">Create one here</Link>.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
