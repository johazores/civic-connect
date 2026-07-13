'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiLogIn, FiShield, FiUserPlus } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getTenantCopy } from '@/lib/tenant-copy';

type Mode = 'login' | 'register';

export function CitizenAuthForm({ tenantSlug, mode, orgType }: { tenantSlug: string; mode: Mode; orgType?: string | null }) {
  const copy = getTenantCopy(orgType);
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

    try {
      const endpoint = isRegister ? 'register' : 'login';
      const response = await fetch(`/api/tenant/${tenantSlug}/citizens/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error || 'Unable to continue.');
        return;
      }

      window.location.href = `/${tenantSlug}/dashboard`;
    } catch {
      setError('Connection problem. Check your network and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="pb-6 pt-3">
        <div className="mb-5 grid h-[60px] w-[60px] place-items-center rounded-[18px] bg-gradient-to-br from-[var(--navy)] to-[var(--navy-900)] text-white shadow-[0_14px_30px_rgba(26,73,123,0.35)]">
          {isRegister ? <FiUserPlus aria-hidden="true" className="h-7 w-7" /> : <FiShield aria-hidden="true" className="h-7 w-7" />}
        </div>
        <h2 className="font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]">
          {isRegister ? 'Create your account.' : 'Welcome back.'}
        </h2>
        <p className="mt-2 text-[14.5px] leading-6 text-[var(--muted)]">
          {isRegister
            ? copy.isGovernment
              ? 'Track reports, updates, and receipts in one place.'
              : 'Track activity, rewards, and receipts in one place.'
            : copy.isGovernment
              ? 'Sign in to follow your reports and receipts.'
              : 'Sign in to follow your activity and receipts.'}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {isRegister ? (
          <div className="field">
            <label className="input-label" htmlFor="auth-name">Full name</label>
            <Input id="auth-name" required value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Enter your full name" autoComplete="name" />
          </div>
        ) : null}

        <div className="field">
          <label className="input-label" htmlFor="auth-email">Email</label>
          <Input id="auth-email" required type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@email.com" autoComplete="email" />
        </div>

        {isRegister ? (
          <div className="field">
            <label className="input-label" htmlFor="auth-phone">Phone</label>
            <Input id="auth-phone" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="Enter your mobile number" autoComplete="tel" />
          </div>
        ) : null}

        <div className="field">
          <label className="input-label" htmlFor="auth-password">Password</label>
          <Input id="auth-password" required type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Enter your password" autoComplete={isRegister ? 'new-password' : 'current-password'} />
        </div>

        {error ? (
          <div className="mb-4 rounded-[14px] bg-[var(--ember-soft)] px-4 py-3 text-sm font-semibold text-[var(--ember-600)]">{error}</div>
        ) : null}

        <Button type="submit" className="btn-block" disabled={isLoading}>
          {isRegister ? <FiUserPlus aria-hidden="true" className="h-4 w-4" /> : <FiLogIn aria-hidden="true" className="h-4 w-4" />}
          {isLoading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13.5px] font-medium text-[var(--muted)]">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <Link href={`/${tenantSlug}/login`} className="font-bold text-[var(--ember)]">Sign in</Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link href={`/${tenantSlug}/register`} className="font-bold text-[var(--ember)]">Create an account</Link>
          </>
        )}
      </p>
    </div>
  );
}
