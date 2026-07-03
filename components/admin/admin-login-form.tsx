'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiLock, FiLogIn, FiMail } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

export function AdminLoginForm({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantSlug, email, password })
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to sign in.');
      setIsLoading(false);
      return;
    }

    router.push(`/${tenantSlug}/admin`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="input-label" htmlFor="admin-login-email">Email</label>
        <div className="input flex items-center gap-3">
          <FiMail aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <input
            id="admin-login-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="you@city.gov"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] font-medium text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      <div className="field">
        <label className="input-label" htmlFor="admin-login-password">Password</label>
        <div className="input flex items-center gap-3">
          <FiLock aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--muted)]" />
          <input
            id="admin-login-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
            className="min-w-0 flex-1 border-0 bg-transparent p-0 text-[15px] font-medium text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={rememberMe}
          onClick={() => setRememberMe((current) => !current)}
          className="flex min-h-[44px] items-center gap-3 text-[13px] font-semibold text-[var(--ink-2)]"
        >
          <span className={`switch ${rememberMe ? 'on' : ''}`.trim()} aria-hidden="true" />
          Remember me
        </button>
      </div>

      {error ? (
        <p className="mb-4 rounded-[14px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{error}</p>
      ) : null}

      <Button type="submit" disabled={isLoading} className="btn-block">
        <FiLogIn aria-hidden="true" className="h-4 w-4" />
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
