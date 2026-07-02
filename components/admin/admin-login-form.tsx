'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function AdminLoginForm({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('admin@sanpablo.local');
  const [password, setPassword] = useState('admin12345');
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
      setError(payload.error || 'Unable to login.');
      setIsLoading(false);
      return;
    }

    router.push(`/${tenantSlug}/admin`);
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md shadow-md shadow-slate-900/[0.05]">
      <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Secure access</p>
        <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-slate-900">Admin Dashboard</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use tenant staff credentials to manage reports and content.</p>
      </div>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div>
          <label className="text-sm font-semibold text-slate-700">Email</label>
          <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-700">Password</label>
          <Input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        {error ? <p className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}
        <Button disabled={isLoading}>{isLoading ? 'Logging in...' : 'Login'}</Button>
      </form>
    </Card>
  );
}
