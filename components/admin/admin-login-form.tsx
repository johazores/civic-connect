'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { FiLogIn } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AdminLoginForm({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <Card className="mx-auto max-w-md">
      <div className="mb-6 rounded-[20px] border border-[color-mix(in_srgb,var(--navy)_16%,transparent)] bg-[color-mix(in_srgb,var(--navy)_8%,white)] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Staff access</p>
        <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-slate-950">Operations dashboard</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Sign in with staff credentials to manage reports, content, and tenant settings.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div>
          <label className="input-label">Email</label>
          <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
        </div>
        <div>
          <label className="input-label">Password</label>
          <Input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
        </div>
        {error ? <p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}
        <Button disabled={isLoading}><FiLogIn aria-hidden="true" className="h-4 w-4" />{isLoading ? 'Signing in...' : 'Sign in'}</Button>
      </form>
    </Card>
  );
}
