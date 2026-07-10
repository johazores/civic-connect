'use client';

import Link from 'next/link';
import { useState, type ReactNode } from 'react';
import { Keypair } from '@stellar/stellar-sdk';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiCopy,
  FiDroplet,
  FiEye,
  FiEyeOff,
  FiExternalLink,
  FiKey,
  FiSmartphone
} from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Balance = { assetCode: string; balance: string };

export function WalletOnboarding({ tenantSlug }: { tenantSlug: string }) {
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
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

  function generate() {
    setError('');
    setBalances(null);
    const keypair = Keypair.random();
    setPublicKey(keypair.publicKey());
    setSecretKey(keypair.secret());
    setShowSecret(false);
  }

  async function fund() {
    if (!publicKey) return;
    setLoading('fund');
    setError('');
    try {
      const response = await fetch('/api/testnet/fund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey })
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
        <p className="section-eyebrow">Your wallet</p>
        <h2 className="mt-3 font-display text-xl font-bold text-[var(--ink)]">You need a wallet app — not an account here</h2>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--ink-2)]">
          CivicTrust never stores your private key. To <strong>pay fees</strong>, open the payment QR in a wallet app like{' '}
          <a href="https://www.freighter.app/" target="_blank" rel="noreferrer" className="font-bold text-[var(--navy)] underline">
            Freighter
          </a>
          . To <strong>receive rewards</strong>, share your public address (starts with G) when submitting a civic action.
        </p>
      </Card>

      <Card>
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--surface-2)] text-[var(--navy)]">
            <FiSmartphone className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold text-[var(--ink)]">Recommended for the demo</h3>
            <p className="mt-1 text-sm font-medium leading-6 text-[var(--ink-2)]">
              Install Freighter, create a wallet, fund it on testnet, then pay a service fee from{' '}
              <Link href={`/${tenantSlug}/payments`} className="font-bold text-[var(--navy)] underline">
                Pay a fee
              </Link>
              .
            </p>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[var(--navy)]"
            >
              Get Freighter <FiExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </Card>

      <Card>
        <p className="section-eyebrow">Testnet practice</p>
        <h3 className="mt-2 font-display text-lg font-bold text-[var(--ink)]">Create a practice wallet (testnet only)</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-[var(--ink-2)]">
          For demos without Freighter: generate a throwaway testnet wallet here. Never use this secret on mainnet or with real funds.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={generate} disabled={loading !== null}>
            <FiKey className="h-4 w-4" />
            Generate testnet wallet
          </Button>
          {publicKey ? (
            <Button variant="secondary" onClick={fund} disabled={loading === 'fund'}>
              <FiDroplet className="h-4 w-4" />
              {loading === 'fund' ? 'Funding…' : 'Fund with Friendbot'}
            </Button>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-[var(--ember-600)]">
            <FiAlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}

        {publicKey ? (
          <div className="mt-4 grid gap-3">
            <Field label="Public address (share this for rewards)" value={publicKey} copied={copied === 'pub'} onCopy={() => copy(publicKey, 'pub')} />
            <Field
              label="Secret key (never share — testnet practice only)"
              value={secretKey}
              hidden={!showSecret}
              copied={copied === 'sec'}
              onCopy={() => copy(secretKey, 'sec')}
              action={
                <button type="button" onClick={() => setShowSecret((v) => !v)} className="text-xs font-bold text-[var(--navy)]">
                  {showSecret ? <FiEyeOff className="inline h-4 w-4" /> : <FiEye className="inline h-4 w-4" />}
                  {showSecret ? ' Hide' : ' Show'}
                </button>
              }
            />
            {balances ? (
              <div className="rounded-[14px] border border-[var(--line)] bg-[var(--surface-2)] p-4">
                <p className="flex items-center gap-2 text-sm font-bold text-[#0f806d]">
                  <FiCheckCircle className="h-4 w-4" />
                  Wallet funded on testnet
                </p>
                <ul className="mt-2 text-sm font-medium text-[var(--ink-2)]">
                  {balances.map((b) => (
                    <li key={b.assetCode}>
                      {b.balance} {b.assetCode}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  hidden,
  copied,
  onCopy,
  action
}: {
  label: string;
  value: string;
  hidden?: boolean;
  copied: boolean;
  onCopy: () => void;
  action?: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">{label}</p>
        {action}
      </div>
      <div className="mt-1.5 flex items-center gap-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface-2)] px-3 py-2.5">
        <code className="min-w-0 flex-1 truncate text-xs font-semibold text-[var(--ink)]">{hidden ? '••••••••••••••••' : value}</code>
        <button type="button" onClick={onCopy} className="shrink-0 text-[var(--navy)]" aria-label="Copy">
          <FiCopy className="h-4 w-4" />
        </button>
      </div>
      {copied ? <p className="mt-1 text-xs font-semibold text-[#0f806d]">Copied</p> : null}
    </div>
  );
}
