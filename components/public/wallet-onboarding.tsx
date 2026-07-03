'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCopy,
  FiDroplet,
  FiEye,
  FiEyeOff,
  FiKey,
  FiZap
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type GeneratedWallet = { publicKey: string; secretKey: string };
type Balance = { assetCode: string; balance: string };

export function WalletOnboarding({ tenantSlug }: { tenantSlug: string }) {
  const [wallet, setWallet] = useState<GeneratedWallet | null>(null);
  const [balances, setBalances] = useState<Balance[] | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState<'gen' | 'fund' | null>(null);
  const [copied, setCopied] = useState('');

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(''), 1600);
    } catch {
      setCopied('');
    }
  }

  async function generate() {
    setLoading('gen');
    setError('');
    setBalances(null);
    try {
      const response = await fetch('/api/stellar-playground/generate-wallet', { method: 'POST' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not create a wallet.');
      setWallet({ publicKey: payload.publicKey, secretKey: payload.secretKey });
      setShowSecret(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create a wallet.');
    }
    setLoading(null);
  }

  async function fund() {
    if (!wallet) return;
    setLoading('fund');
    setError('');
    try {
      const response = await fetch('/api/stellar-playground/fund-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: wallet.publicKey })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not fund the wallet.');
      setBalances((payload.account?.balances || []).map((b: any) => ({ assetCode: b.assetCode || 'XLM', balance: b.balance })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not fund the wallet.');
    }
    setLoading(null);
  }

  return (
    <div className="grid gap-4">
      <Card>
        <p className="section-eyebrow">Why a wallet</p>
        <h2 className="mt-3 font-display text-xl font-bold text-[var(--ink)]">Your wallet is how you receive rewards</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--ink-2)]">
          Civic rewards and disbursements are paid on Stellar. You share your <b>public key</b> (starts with G…) to receive
          funds. Your <b>secret key</b> (starts with S…) signs transactions and must never be shared — not even with the city.
        </p>
        <div className="mt-4 grid gap-3">
          <KeyExplainer icon={<FiKey className="h-4 w-4" />} tone="navy" title="Public key (G…)" body="Safe to share. This is where rewards arrive." />
          <KeyExplainer icon={<FiAlertTriangle className="h-4 w-4" />} tone="ember" title="Secret key (S…)" body="Never share it. Anyone with it controls your funds." />
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[var(--surface-2)] text-[var(--navy)]">
            <FiZap className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Step 1 · Learn</p>
            <h3 className="font-display text-lg font-bold text-[var(--ink)]">Create a practice Testnet wallet</h3>
          </div>
        </div>
        <p className="mt-3 text-[13px] font-medium leading-6 text-[var(--muted)]">
          This generates a free Stellar <b>Testnet</b> wallet for learning. For real use, install a wallet app like Freighter or
          Lobstr and keep your secret key offline.
        </p>
        <Button onClick={generate} disabled={loading === 'gen'} className="btn-block mt-4">
          <FiKey className="h-4 w-4" /> {loading === 'gen' ? 'Creating…' : wallet ? 'Create another wallet' : 'Create Testnet wallet'}
        </Button>

        {wallet ? (
          <div className="mt-4 grid gap-3">
            <div className="rounded-[16px] bg-[var(--surface-2)] p-4">
              <p className="text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Public key · share this</p>
              <p className="mt-1 break-all font-mono text-[12.5px] font-semibold text-[var(--ink)]">{wallet.publicKey}</p>
              <button type="button" onClick={() => copy(wallet.publicKey, 'pub')} className="app-btn btn-outline btn-compact mt-3">
                {copied === 'pub' ? <FiCheckCircle className="h-4 w-4 text-[#0f806d]" /> : <FiCopy className="h-4 w-4" />} Copy public key
              </button>
            </div>

            <div className="rounded-[16px] border border-[color-mix(in_srgb,var(--ember)_30%,transparent)] bg-[var(--ember-soft)] p-4">
              <p className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[var(--ember-600)]">
                <FiAlertTriangle className="h-3.5 w-3.5" /> Secret key · keep private
              </p>
              <p className="mt-1 break-all font-mono text-[12.5px] font-semibold text-[var(--ink)]">
                {showSecret ? wallet.secretKey : '•'.repeat(56)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setShowSecret((v) => !v)} className="app-btn btn-outline btn-compact">
                  {showSecret ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />} {showSecret ? 'Hide' : 'Reveal'}
                </button>
                <button type="button" onClick={() => copy(wallet.secretKey, 'sec')} className="app-btn btn-outline btn-compact">
                  {copied === 'sec' ? <FiCheckCircle className="h-4 w-4 text-[#0f806d]" /> : <FiCopy className="h-4 w-4" />} Copy
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </Card>

      {wallet ? (
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[var(--surface-2)] text-[var(--navy)]">
              <FiDroplet className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">Step 2 · Activate</p>
              <h3 className="font-display text-lg font-bold text-[var(--ink)]">Fund it with Friendbot</h3>
            </div>
          </div>
          <p className="mt-3 text-[13px] font-medium leading-6 text-[var(--muted)]">
            Friendbot gives free Testnet XLM so your wallet becomes active and can hold assets.
          </p>
          <Button onClick={fund} disabled={loading === 'fund'} variant="secondary" className="btn-block mt-4">
            <FiDroplet className="h-4 w-4" /> {loading === 'fund' ? 'Funding…' : 'Fund with Friendbot'}
          </Button>
          {balances ? (
            <div className="mt-4 rounded-[16px] bg-[color-mix(in_srgb,var(--heat-1)_10%,var(--surface))] p-4">
              <p className="flex items-center gap-1.5 text-[13px] font-extrabold text-[#0f806d]">
                <FiCheckCircle className="h-4 w-4" /> Wallet active
              </p>
              <div className="mt-2 grid gap-1">
                {balances.map((b) => (
                  <p key={b.assetCode} className="font-mono text-[13px] font-semibold text-[var(--ink)]">
                    {b.balance} {b.assetCode}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      ) : null}

      {error ? (
        <p className="rounded-[16px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{error}</p>
      ) : null}

      <Card>
        <p className="section-eyebrow">Next step</p>
        <h3 className="mt-3 font-display text-lg font-bold text-[var(--ink)]">Use your public key for rewards</h3>
        <p className="mt-2 text-[13px] font-medium leading-6 text-[var(--ink-2)]">
          Paste your G… public key when you submit a civic action so approved rewards land in your wallet.
        </p>
        <Link href={`/${tenantSlug}/civic-actions`} className="app-btn btn-primary mt-4">
          Submit a civic action
        </Link>
      </Card>
    </div>
  );
}

function KeyExplainer({ icon, title, body, tone }: { icon: React.ReactNode; title: string; body: string; tone: 'navy' | 'ember' }) {
  const toneClass = tone === 'ember'
    ? 'bg-[var(--ember-soft)] text-[var(--ember-600)]'
    : 'bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]';
  return (
    <div className="flex items-start gap-3 rounded-[16px] bg-[var(--surface-2)] p-3.5">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[12px] ${toneClass}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--ink)]">{title}</p>
        <p className="mt-0.5 text-[13px] font-medium leading-5 text-[var(--ink-2)]">{body}</p>
      </div>
    </div>
  );
}
