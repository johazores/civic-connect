'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FiCheckCircle, FiCopy, FiExternalLink, FiRefreshCw, FiSend, FiShield, FiZap } from 'react-icons/fi';

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

function SecretWarning() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      <strong>Testnet only:</strong> this playground shows secret keys so you can learn how accounts work. Never paste a Mainnet secret key here and never expose real secrets in a browser UI.
    </div>
  );
}

export function StellarPlaygroundClient() {
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.12),transparent_32rem),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Stellar Testnet Lab</p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-3xl">CivicTrust Stellar Playground</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-slate-600">A beginner-friendly sandbox for Testnet accounts, SEP-7 payment QR codes, Horizon verification, and transaction receipts.</p>
          </div>
          <Link href="/metro-city" className="inline-flex min-h-11 items-center justify-center rounded-full px-5 py-3 text-sm font-black btn-secondary">Back to app</Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-5 px-4 py-6 pb-12 lg:grid-cols-[0.92fr_1.08fr] lg:py-10">
        <section className="grid gap-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><FiShield className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-black text-slate-950">1. Create a Testnet wallet</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">A Stellar account has a public key that receives funds and a secret key that signs transactions. This button creates a learning wallet only.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <button onClick={generateWallet} disabled={state.loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black btn-primary disabled:opacity-60">
                <FiZap className="h-4 w-4" /> Generate Testnet wallet
              </button>
              <SecretWarning />
              {wallet ? (
                <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Public key / address</p>
                    <div className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-white p-3 font-mono text-xs text-slate-700">
                      <span className="break-all">{wallet.publicKey}</span>
                      <button onClick={() => copy(wallet.publicKey)} className="shrink-0 text-blue-700"><FiCopy /></button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Secret key / signer</p>
                    <div className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-white p-3 font-mono text-xs text-slate-700">
                      <span className="break-all">{wallet.secretKey}</span>
                      <button onClick={() => copy(wallet.secretKey)} className="shrink-0 text-blue-700"><FiCopy /></button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><FiRefreshCw className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-black text-slate-950">2. Fund and inspect the wallet</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">Friendbot funds Testnet accounts with fake XLM. Horizon lets the backend read account balances and transaction history.</p>
              </div>
            </div>
            <label className="mt-4 block text-sm font-black text-slate-700">
              Receiving public key
              <input value={receiver} onChange={(event) => setReceiver(event.target.value)} placeholder="G..." className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none focus-premium" />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={fundWallet} disabled={state.loading || !receiver} className="inline-flex min-h-11 items-center justify-center rounded-full px-4 py-3 text-sm font-black btn-primary disabled:opacity-60">Fund</button>
              <button onClick={checkWallet} disabled={state.loading || !receiver} className="inline-flex min-h-11 items-center justify-center rounded-full px-4 py-3 text-sm font-black btn-secondary disabled:opacity-60">Check</button>
            </div>
            {accountStatus ? (
              <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(accountStatus, null, 2)}</pre>
            ) : null}
          </div>
        </section>

        <section className="grid gap-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><FiSend className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-black text-slate-950">3. Generate a SEP-7 payment request</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">The backend creates a <code className="rounded bg-slate-100 px-1 py-0.5">web+stellar:pay</code> URI. A wallet reads the URI, signs the payment, and submits it to Testnet.</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-black text-slate-700">
                Amount XLM
                <input value={amount} onChange={(event) => setAmount(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus-premium" />
              </label>
              <label className="text-sm font-black text-slate-700">
                Memo
                <input value={memo} maxLength={28} onChange={(event) => setMemo(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none focus-premium" />
              </label>
            </div>
            <button onClick={createSep7} disabled={state.loading || !receiver} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-black btn-primary disabled:opacity-60">Create SEP-7 QR</button>
            {sep7 ? (
              <div className="mt-4 grid gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:grid-cols-[13rem_1fr]">
                {qrSrc ? <img src={qrSrc} alt="SEP-7 payment QR code" className="h-52 w-52 rounded-2xl border border-white bg-white p-3 shadow-sm" /> : null}
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Payment request</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">Scan the QR with a Stellar-compatible wallet in Testnet mode, or copy the URI.</p>
                  <div className="mt-3 rounded-xl bg-white p-3 font-mono text-xs leading-5 text-slate-700">
                    <p><strong>To:</strong> {shortKey(sep7.destination)}</p>
                    <p><strong>Amount:</strong> {sep7.amount} XLM</p>
                    <p><strong>Memo:</strong> {sep7.memo}</p>
                  </div>
                  <button onClick={() => copy(sep7.sep7Uri)} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-black btn-secondary"><FiCopy /> Copy URI</button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><FiCheckCircle className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-black text-slate-950">4. Verify the transaction</h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">After payment, paste the transaction hash. The backend checks Horizon for destination, amount, asset, memo, and success status.</p>
              </div>
            </div>
            <label className="mt-4 block text-sm font-black text-slate-700">
              Transaction hash
              <input value={transactionHash} onChange={(event) => setTransactionHash(event.target.value)} placeholder="64-character transaction hash" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm outline-none focus-premium" />
            </label>
            <button onClick={verifyTransaction} disabled={state.loading || !transactionHash} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black btn-primary disabled:opacity-60"><FiExternalLink className="h-4 w-4" /> Verify with Horizon</button>
            {verification ? (
              <pre className="mt-4 max-h-72 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs leading-5 text-slate-100">{JSON.stringify(verification, null, 2)}</pre>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Where smart contracts fit</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">This civic platform currently uses Stellar payments and Horizon receipts. Smart contracts on Stellar are built with Soroban and are useful later for programmable rewards, budget rules, or claim windows. They are not required for the basic proof-of-payment flow.</p>
            <a href="https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full px-4 py-2 text-sm font-black btn-secondary">Read the official smart contract quickstart <FiExternalLink /></a>
          </div>
        </section>
      </main>

      {state.message ? <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900 shadow-lg">{state.message}</div> : null}
      {state.error ? <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-900 shadow-lg">{state.error}</div> : null}
    </div>
  );
}
