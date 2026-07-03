'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiLock, FiLogIn, FiMail } from 'react-icons/fi';
import { Button } from '@/components/ui/button';

export function PlatformLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const response = await fetch('/api/platform/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to sign in.');
      setLoading(false);
      return;
    }

    router.push('/root');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="input-label" htmlFor="platform-email">Email</label>
        <div className="input">
          <FiMail aria-hidden="true" />
          <input
            id="platform-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            placeholder="root@civictrust.local"
          />
        </div>
      </div>

      <div className="field">
        <label className="input-label" htmlFor="platform-password">Password</label>
        <div className="input">
          <FiLock aria-hidden="true" />
          <input
            id="platform-password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Enter your password"
          />
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-[14px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{error}</p>
      ) : null}

      <Button type="submit" disabled={loading} className="btn-block">
        <FiLogIn aria-hidden="true" className="h-4 w-4" />
        {loading ? 'Signing in...' : 'Sign in to console'}
      </Button>
    </form>
  );
}
