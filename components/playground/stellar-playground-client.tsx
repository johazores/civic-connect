'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiChevronLeft,
  FiCopy,
  FiExternalLink,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiZap
} from 'react-icons/fi';

type PlaygroundWallet = {
  publicKey: string;
  secretKey: string;
};

type Sep7Result = {
  sep7Uri: string;
  destination: string;
  amount: string;
  memo: string;
  network: string;
  networkPassphrase: string;
};

type ApiState = {
  loading: boolean;
  message: string;
  error: string;
};

const initialState: ApiState = { loading: false, message: '', error: '' };

async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed.');
  }

  return payload as T;
}

function shortKey(value: string) {
  if (!value) return 'Not created yet';
  return `${value.slice(0, 9)}…${value.slice(-8)}`;
}

function parseAccount(account: Record<string, unknown>) {
  const balances = Array.isArray(account.balances) ? (account.balances as Array<Record<string, unknown>>) : [];
  const native = balances.find((entry) => entry.asset_type === 'native');
  const balance = typeof native?.balance === 'string' ? native.balance : null;
  const sequence = typeof account.sequence === 'string' ? account.sequence : null;
  const accountId =
    typeof account.id === 'string' ? account.id : typeof account.account_id === 'string' ? account.account_id : null;

  return { balance, sequence, accountId };
}

function StepHead({ icon, title, desc, more }: { icon: ReactNode; title: string; desc: string; more?: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mi-ic">{icon}</span>
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-[17px] font-bold tracking-[-0.01em] text-[var(--ink)]">{title}</h2>
        <p className="mt-0.5 text-[13px] font-medium leading-5 text-[var(--muted)]">{desc}</p>
        {more ? (
          <details className="mt-1">
            <summary className="cursor-pointer text-xs font-bold text-[var(--navy)]">Learn more</summary>
            <p className="mt-1 text-xs font-medium leading-5 text-[var(--muted)]">{more}</p>
          </details>
        ) : null}
      </div>
    </div>
  );
}

function KeyRow({ label, value, onCopy }: { label: string; value: string; onCopy: () => void }) {
  return (
    <div className="rounded-2xl bg-[var(--surface-2)] p-3">
      <p className="section-eyebrow">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="min-w-0 flex-1 break-all font-mono text-xs leading-5 text-[var(--ink-2)]">{value}</span>
        <button type="button" onClick={onCopy} aria-label={`Copy ${label}`} className="app-icon-btn">
          <FiCopy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function RawJson({ data }: { data: Record<string, unknown> }) {
  return (
    <details className="rounded-2xl bg-[var(--surface-2)] px-4 py-3">
      <summary className="cursor-pointer text-[13px] font-bold text-[var(--navy)]">View raw JSON</summary>
      <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-[var(--navy-900)] p-3 text-[11px] leading-4 text-[#cfe0f2]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

function SecretWarning() {
  return (
    <div className="rounded-2xl bg-[var(--ember-soft)] px-4 py-3 text-[13px] font-semibold leading-5 text-[var(--ember-600)]">
      <strong>Testnet only:</strong> secret keys are shown here so you can learn how accounts work. Never paste a
      Mainnet secret key into a browser UI.
    </div>
  );
}

export function StellarPlaygroundClient({ backHref = '/metro-city' }: { backHref?: string }) {
  const [wallet, setWallet] = useState<PlaygroundWallet | null>(null);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('1');
  const [memo, setMemo] = useState('PLAY-0001');
  const [sep7, setSep7] = useState<Sep7Result | null>(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [accountStatus, setAccountStatus] = useState<Record<string, unknown> | null>(null);
  const [verification, setVerification] = useState<Record<string, unknown> | null>(null);
  const [state, setState] = useState<ApiState>(initialState);

  const qrSrc = useMemo(() => {
    if (!sep7?.sep7Uri) return '';
    return `/api/stellar-playground/qr?uri=${encodeURIComponent(sep7.sep7Uri)}`;
  }, [sep7]);

  const account = useMemo(() => (accountStatus ? parseAccount(accountStatus) : null), [accountStatus]);

  useEffect(() => {
    if (!state.message && !state.error) return;
    const timer = setTimeout(() => {
      setState((current) => ({ ...current, message: '', error: '' }));
    }, 3200);
    return () => clearTimeout(timer);
  }, [state.message, state.error]);

  async function runAction(action: () => Promise<void>, successMessage: string) {
    setState({ loading: true, message: '', error: '' });

    try {
      await action();
      setState({ loading: false, message: successMessage, error: '' });
    } catch (error) {
      setState({ loading: false, message: '', error: error instanceof Error ? error.message : 'Something went wrong.' });
    }
  }

  async function generateWallet() {
    await runAction(async () => {
      const result = await postJson<PlaygroundWallet>('/api/stellar-playground/generate-wallet', {});
      setWallet(result);
      setReceiver(result.publicKey);
      setAccountStatus(null);
      setVerification(null);
    }, 'Generated a real Stellar Testnet keypair locally through the backend.');
  }

  async function fundWallet() {
    const publicKey = receiver || wallet?.publicKey || '';
    await runAction(async () => {
      const result = await postJson<{ account: Record<string, unknown> }>('/api/stellar-playground/fund-wallet', { publicKey });
      setAccountStatus(result.account);
    }, 'Friendbot funding request completed.');
  }

  async function checkWallet() {
    const publicKey = receiver || wallet?.publicKey || '';
    await runAction(async () => {
      const result = await postJson<{ account: Record<string, unknown> }>('/api/stellar-playground/account', { publicKey });
      setAccountStatus(result.account);
    }, 'Loaded the account from Horizon Testnet.');
  }

  async function createSep7() {
    await runAction(async () => {
      const result = await postJson<Sep7Result>('/api/stellar-playground/sep7', {
        destination: receiver,
        amount,
        memo,
        message: 'CivicTrust Testnet payment playground'
      });
      setSep7(result);
      setVerification(null);
    }, 'Created a real SEP-7 payment request.');
  }

  async function verifyTransaction() {
    await runAction(async () => {
      const result = await postJson<{ result: Record<string, unknown> }>('/api/stellar-playground/verify-payment', {
        transactionHash,
        destinationPublicKey: sep7?.destination || receiver,
        amount: sep7?.amount || amount,
        memo: sep7?.memo || memo
      });
      setVerification(result.result);
    }, 'Verification request completed through Horizon.');
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setState({ loading: false, message: 'Copied to clipboard.', error: '' });
  }

  const steps = [
    { n: 1, label: 'Create', done: Boolean(wallet) },
    { n: 2, label: 'Fund', done: Boolean(accountStatus) },
    { n: 3, label: 'Pay', done: Boolean(sep7) },
    { n: 4, label: 'Verify', done: Boolean(verification) }
  ];
  const currentStep = steps.find((step) => !step.done)?.n ?? 4;

  const verified = verification
    ? (verification as { verified?: boolean; failureReason?: string; ledger?: number; paidAt?: string; transactionHash?: string; payerPublicKey?: string })
    : null;

  return (
    <div className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={backHref} className="app-icon-btn" aria-label="Back to app">
              <FiChevronLeft aria-hidden="true" className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="appbar-title truncate">Stellar Testnet Lab</p>
              <p className="app-subtitle truncate">SEP-7 · Horizon · receipts</p>
            </div>
          </div>
        </header>

        <main
          className="civic-viewport viewport-flow grid content-start gap-4 px-5 pt-4"
          style={{ paddingBottom: 'calc(var(--safe-bottom) + 26px)' }}
        >
          <div className="flex gap-2">
            {steps.map((step) => (
              <span
                key={step.n}
                className={`chip min-w-0 flex-1 justify-center px-2 ${step.done || step.n === currentStep ? 'on' : ''}`}
              >
                {step.done ? <FiCheckCircle className="h-3.5 w-3.5 shrink-0" /> : null}
                <span className="truncate">{step.label}</span>
              </span>
            ))}
          </div>

          <section className="card p-5">
            <StepHead
              icon={<FiShield className="h-5 w-5" />}
              title="1. Create a Testnet wallet"
              desc="Generate a learning keypair with public and secret keys."
              more="A Stellar account has a public key that receives funds and a secret key that signs transactions. This button creates a learning wallet only."
            />
            <div className="mt-4 grid gap-3">
              <button onClick={generateWallet} disabled={state.loading} className="btn btn-primary btn-block disabled:opacity-60">
                <FiZap className="h-4 w-4" /> Generate Testnet wallet
              </button>
              <SecretWarning />
              {wallet ? (
                <div className="grid gap-3">
                  <KeyRow label="Public key / address" value={wallet.publicKey} onCopy={() => copy(wallet.publicKey)} />
                  <KeyRow label="Secret key / signer" value={wallet.secretKey} onCopy={() => copy(wallet.secretKey)} />
                </div>
              ) : null}
            </div>
          </section>

          <section className="card p-5">
            <StepHead
              icon={<FiRefreshCw className="h-5 w-5" />}
              title="2. Fund and inspect the wallet"
              desc="Friendbot sends fake XLM; Horizon reads the account."
              more="Friendbot funds Testnet accounts with fake XLM. Horizon lets the backend read account balances and transaction history."
            />
            <div className="field mb-0 mt-4">
              <label className="input-label" htmlFor="pg-receiver">Receiving public key</label>
              <input
                id="pg-receiver"
                value={receiver}
                onChange={(event) => setReceiver(event.target.value)}
                placeholder="G..."
                className="input font-mono"
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={fundWallet} disabled={state.loading || !receiver} className="btn btn-primary disabled:opacity-60">
                Fund
              </button>
              <button onClick={checkWallet} disabled={state.loading || !receiver} className="btn btn-outline disabled:opacity-60">
                Check
              </button>
            </div>
            {accountStatus && account ? (
              <div className="mt-4 grid gap-3">
                <div className="stat-grid">
                  <div className="stat">
                    <p className="sv">{account.balance ?? '—'}</p>
                    <p className="sl">Balance (XLM)</p>
                  </div>
                  <div className="stat">
                    <p className="sv" style={{ fontSize: '14px', lineHeight: '20px' }}>{account.sequence ?? '—'}</p>
                    <p className="sl">Sequence</p>
                  </div>
                </div>
                {account.accountId ? (
                  <KeyRow label="Account" value={account.accountId} onCopy={() => copy(account.accountId as string)} />
                ) : null}
                <RawJson data={accountStatus} />
              </div>
            ) : null}
          </section>

          <section className="card p-5">
            <StepHead
              icon={<FiSend className="h-5 w-5" />}
              title="3. Create a SEP-7 payment"
              desc="Build a web+stellar:pay request a wallet can scan."
              more="The backend creates a web+stellar:pay URI. A wallet reads the URI, signs the payment, and submits it to Testnet."
            />
            <div className="field mb-0 mt-4">
              <label className="input-label" htmlFor="pg-amount">Amount XLM</label>
              <input id="pg-amount" value={amount} onChange={(event) => setAmount(event.target.value)} className="input" />
            </div>
            <div className="field mb-0 mt-4">
              <label className="input-label" htmlFor="pg-memo">Memo</label>
              <input
                id="pg-memo"
                value={memo}
                maxLength={28}
                onChange={(event) => setMemo(event.target.value)}
                className="input font-mono"
              />
            </div>
            <button
              onClick={createSep7}
              disabled={state.loading || !receiver}
              className="btn btn-primary btn-block mt-4 disabled:opacity-60"
            >
              Create SEP-7 QR
            </button>
            {sep7 ? (
              <div className="mt-4 grid gap-3">
                {qrSrc ? (
                  <div className="mx-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-sm">
                    <img src={qrSrc} alt="SEP-7 payment QR code" className="h-[200px] w-[200px]" />
                  </div>
                ) : null}
                <div className="rounded-2xl bg-[var(--surface-2)] p-4">
                  <p className="section-eyebrow">Payment request</p>
                  <p className="mt-2 text-[13px] font-medium leading-5 text-[var(--muted)]">
                    Scan with a Stellar wallet in Testnet mode, or copy the URI.
                  </p>
                  <div className="mt-3 grid gap-1.5 font-mono text-xs leading-5 text-[var(--ink-2)]">
                    <p className="break-all"><strong>To:</strong> {shortKey(sep7.destination)}</p>
                    <p className="break-all"><strong>Amount:</strong> {sep7.amount} XLM</p>
                    <p className="break-all"><strong>Memo:</strong> {sep7.memo}</p>
                  </div>
                </div>
                <button onClick={() => copy(sep7.sep7Uri)} className="btn btn-outline btn-block">
                  <FiCopy className="h-4 w-4" /> Copy URI
                </button>
              </div>
            ) : null}
          </section>

          <section className="card p-5">
            <StepHead
              icon={<FiCheckCircle className="h-5 w-5" />}
              title="4. Verify the transaction"
              desc="Paste the transaction hash to confirm it on Horizon."
              more="After payment, paste the transaction hash. The backend checks Horizon for destination, amount, asset, memo, and success status."
            />
            <div className="field mb-0 mt-4">
              <label className="input-label" htmlFor="pg-hash">Transaction hash</label>
              <input
                id="pg-hash"
                value={transactionHash}
                onChange={(event) => setTransactionHash(event.target.value)}
                placeholder="64-character transaction hash"
                className="input break-all font-mono"
              />
            </div>
            <button
              onClick={verifyTransaction}
              disabled={state.loading || !transactionHash}
              className="btn btn-primary btn-block mt-4 disabled:opacity-60"
            >
              <FiExternalLink className="h-4 w-4" /> Verify with Horizon
            </button>
            {verification && verified ? (
              <div className="mt-4 grid gap-3">
                <span
                  className={`status-pill w-fit ${
                    verified.verified
                      ? 'bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]'
                      : 'bg-[var(--ember-soft)] text-[var(--ember-600)]'
                  }`}
                >
                  {verified.verified ? <FiCheckCircle className="h-3.5 w-3.5" /> : <FiAlertTriangle className="h-3.5 w-3.5" />}
                  {verified.verified ? 'Payment verified' : 'Not verified'}
                </span>
                {verified.failureReason ? (
                  <p className="rounded-2xl bg-[var(--ember-soft)] px-4 py-3 text-[13px] font-semibold leading-5 text-[var(--ember-600)]">
                    {verified.failureReason}
                  </p>
                ) : null}
                {verified.transactionHash ? (
                  <KeyRow label="Transaction hash" value={verified.transactionHash} onCopy={() => copy(verified.transactionHash as string)} />
                ) : null}
                {verified.payerPublicKey ? (
                  <KeyRow label="Payer" value={verified.payerPublicKey} onCopy={() => copy(verified.payerPublicKey as string)} />
                ) : null}
                {verified.ledger || verified.paidAt ? (
                  <div className="rounded-2xl bg-[var(--surface-2)] p-4 text-[13px] font-medium leading-6 text-[var(--ink-2)]">
                    {verified.ledger ? <p><strong>Ledger:</strong> {verified.ledger}</p> : null}
                    {verified.paidAt ? <p className="break-all"><strong>Paid at:</strong> {verified.paidAt}</p> : null}
                  </div>
                ) : null}
                <RawJson data={verification} />
              </div>
            ) : null}
          </section>

          <section className="card p-5">
            <h2 className="font-display text-[17px] font-bold tracking-[-0.01em] text-[var(--ink)]">Where smart contracts fit</h2>
            <p className="mt-2 text-[13px] font-medium leading-5 text-[var(--muted)]">
              CivicTrust uses Stellar payments and Horizon receipts today. Soroban smart contracts come later for
              programmable rewards, budget rules, or claim windows.
            </p>
            <a
              href="https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-block mt-4"
            >
              Smart contract quickstart <FiExternalLink className="h-4 w-4" />
            </a>
          </section>
        </main>

        {state.message || state.error ? (
          <div className="toast-wrap" style={{ bottom: 'calc(var(--safe-bottom) + 16px)' }}>
            <div className="toast">
              {state.error ? (
                <FiAlertTriangle className="h-4 w-4 shrink-0" style={{ color: '#ff8a99' }} />
              ) : (
                <FiCheckCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--heat-1)' }} />
              )}
              <span className="min-w-0" style={{ overflowWrap: 'anywhere' }}>{state.error || state.message}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
