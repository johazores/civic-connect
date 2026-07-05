'use client';

import Link from 'next/link';
import { Keypair } from '@stellar/stellar-sdk';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  FiAlertTriangle,
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiCopy,
  FiCreditCard,
  FiDatabase,
  FiDownload,
  FiDroplet,
  FiExternalLink,
  FiEye,
  FiEyeOff,
  FiHash,
  FiHome,
  FiKey,
  FiLink,
  FiLock,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiSmartphone,
  FiTrash2,
  FiUpload,
  FiWifi,
  FiXCircle,
  FiZap
} from 'react-icons/fi';

type WalletSource = 'generated' | 'imported' | 'stored';
type SetupMode = 'start' | 'create' | 'freighter' | 'import';
type PlaygroundTab = 'setup' | 'wallet' | 'pay' | 'verify' | 'learn';

type PlaygroundWallet = {
  publicKey: string;
  secretKey: string;
  source: WalletSource;
  phrase?: string[];
  createdAt: string;
};

type Balance = {
  assetType: string;
  assetCode: string;
  balance: string;
};

type AccountStatus = {
  exists: boolean;
  publicKey: string;
  balances: Balance[];
  lastModifiedLedger?: number;
  failureReason?: string;
  network?: string;
  explorerUrl?: string | null;
};

type Sep7Result = {
  sep7Uri: string;
  destination: string;
  amount: string;
  memo: string;
  network: string;
  networkPassphrase: string;
};

type VerificationResult = {
  verified: boolean;
  transactionHash?: string;
  paymentOperationId?: string;
  payerPublicKey?: string;
  sourceAccount?: string;
  destinationPublicKey?: string;
  amount?: string;
  assetCode?: string;
  memo?: string;
  ledger?: number;
  paidAt?: string;
  transactionFound?: boolean;
  transactionSuccessful?: boolean;
  failureReason?: string;
  network?: string;
  explorerUrl?: string | null;
};

type StoredWalletEnvelope = {
  version: 1;
  network: 'TESTNET';
  algorithm: 'PBKDF2-AES-GCM';
  publicKey: string;
  cipherText: string;
  iv: string;
  salt: string;
  createdAt: string;
};

type FreighterProvider = {
  isConnected?: () => Promise<unknown> | unknown;
  requestAccess?: () => Promise<unknown>;
  getAddress?: () => Promise<unknown>;
  getPublicKey?: () => Promise<unknown>;
  getNetwork?: () => Promise<unknown>;
};

type FreighterState = {
  checked: boolean;
  installed: boolean;
  publicKey: string;
  network: string;
  error: string;
};

type ApiState = {
  loading: boolean;
  message: string;
  error: string;
};

declare global {
  interface Window {
    freighterApi?: FreighterProvider;
    freighter?: FreighterProvider;
  }
}

const initialState: ApiState = { loading: false, message: '', error: '' };
const storageKey = 'civictrust.stellar-playground.testnet-wallet';
const revealConfirmation = 'TESTNET ONLY';

const practiceWords = [
  'anchor',
  'artist',
  'balance',
  'beacon',
  'bright',
  'budget',
  'canvas',
  'civic',
  'circle',
  'clear',
  'clinic',
  'coffee',
  'common',
  'credit',
  'detail',
  'digital',
  'direct',
  'donor',
  'early',
  'energy',
  'family',
  'garden',
  'gentle',
  'harbor',
  'honest',
  'impact',
  'island',
  'ledger',
  'lesson',
  'local',
  'market',
  'mobile',
  'motion',
  'notice',
  'office',
  'online',
  'orange',
  'parent',
  'permit',
  'public',
  'purple',
  'record',
  'refund',
  'report',
  'rescue',
  'reward',
  'river',
  'safety',
  'school',
  'secure',
  'senior',
  'signal',
  'simple',
  'social',
  'steady',
  'street',
  'submit',
  'sunset',
  'system',
  'tenant',
  'ticket',
  'trust',
  'update',
  'verify',
  'wallet',
  'window'
];

const learningCards = [
  {
    title: 'What is a Stellar account?',
    body: 'It is a place on Stellar that can hold XLM and receive payments. In this playground it only lives on Testnet.'
  },
  {
    title: 'What is a public key?',
    body: 'A public key is the account address. It starts with G and is safe to share when someone needs to send a payment.'
  },
  {
    title: 'What is a secret key?',
    body: 'A secret key starts with S and controls the account. Never paste a real secret key into this playground or any website.'
  },
  {
    title: 'What is Testnet?',
    body: 'Testnet is Stellar practice mode. Testnet XLM has no cash value and is used by developers for learning.'
  },
  {
    title: 'What is Friendbot?',
    body: 'Friendbot is a Stellar Testnet faucet. It gives free test XLM so a practice account can try transactions.'
  },
  {
    title: 'What is SEP-7?',
    body: 'SEP-7 is a payment request link. It asks a wallet to review, sign, and submit a payment; the link itself does not move money.'
  },
  {
    title: 'What is Horizon?',
    body: 'Horizon is the Stellar API this app uses to read accounts and check whether a transaction really happened.'
  },
  {
    title: 'What is a transaction hash?',
    body: 'It is the long receipt ID for a Stellar transaction. The app uses it to look up the public payment record.'
  },
  {
    title: 'Why does the civic app use Stellar?',
    body: 'Stellar gives civic payments public proof: amount, destination, memo, and time can be checked without trusting a private spreadsheet.'
  }
];

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

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed.');
  }

  return payload as T;
}

function randomIndex(max: number) {
  const values = new Uint32Array(1);
  window.crypto.getRandomValues(values);
  return values[0] % max;
}

function createPracticePhrase() {
  const available = [...practiceWords];
  const phrase: string[] = [];

  while (phrase.length < 12 && available.length) {
    const index = randomIndex(available.length);
    const [word] = available.splice(index, 1);
    phrase.push(word);
  }

  return phrase;
}

function pickConfirmationIndexes(phrase: string[]) {
  const indexes = new Set<number>();

  while (indexes.size < 3 && indexes.size < phrase.length) {
    indexes.add(randomIndex(phrase.length));
  }

  return [...indexes].sort((a, b) => a - b);
}

function createRandomWallet(source: WalletSource, phrase?: string[]): PlaygroundWallet {
  const keypair = Keypair.random();

  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    source,
    phrase,
    createdAt: new Date().toISOString()
  };
}

function importWalletFromSecret(secretKey: string): PlaygroundWallet {
  const keypair = Keypair.fromSecret(secretKey.trim());

  return {
    publicKey: keypair.publicKey(),
    secretKey: keypair.secret(),
    source: 'imported',
    createdAt: new Date().toISOString()
  };
}

function shortKey(value: string) {
  if (!value) return 'Not created yet';
  return `${value.slice(0, 9)}...${value.slice(-8)}`;
}

function xlmBalance(account: AccountStatus | null) {
  const native = account?.balances?.find((balance) => balance.assetType === 'native' || balance.assetCode === 'XLM');
  return native?.balance || null;
}

function walletStatus(wallet: PlaygroundWallet | null, account: AccountStatus | null, sep7: Sep7Result | null) {
  if (!wallet) return 'Not created';
  if (!account?.exists) return 'Created';
  if (Number(xlmBalance(account) || 0) <= 0) return 'Created';
  return sep7 ? 'Ready' : 'Funded';
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function toArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveStorageKey(password: string, salt: Uint8Array) {
  const encoder = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey('raw', toArrayBuffer(encoder.encode(password)), 'PBKDF2', false, ['deriveKey']);

  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: toArrayBuffer(salt), iterations: 250000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encryptSecretKey(wallet: PlaygroundWallet, password: string): Promise<StoredWalletEnvelope> {
  const encoder = new TextEncoder();
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveStorageKey(password, salt);
  const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(encoder.encode(wallet.secretKey)));

  return {
    version: 1,
    network: 'TESTNET',
    algorithm: 'PBKDF2-AES-GCM',
    publicKey: wallet.publicKey,
    cipherText: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
    salt: bytesToBase64(salt),
    createdAt: new Date().toISOString()
  };
}

async function decryptSecretKey(envelope: StoredWalletEnvelope, password: string) {
  const key = await deriveStorageKey(password, base64ToBytes(envelope.salt));
  const decrypted = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(base64ToBytes(envelope.iv)) },
    key,
    toArrayBuffer(base64ToBytes(envelope.cipherText))
  );

  return new TextDecoder().decode(decrypted);
}

function normalizeFreighterPublicKey(result: unknown) {
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>;
    if (typeof record.publicKey === 'string') return record.publicKey;
    if (typeof record.address === 'string') return record.address;
  }

  return '';
}

function normalizeFreighterNetwork(result: unknown) {
  if (typeof result === 'string') return result;
  if (result && typeof result === 'object') {
    const record = result as Record<string, unknown>;
    if (typeof record.network === 'string') return record.network;
    if (typeof record.networkPassphrase === 'string') return record.networkPassphrase;
  }

  return '';
}

function getFreighterProvider() {
  if (typeof window === 'undefined') return null;
  return window.freighterApi || window.freighter || null;
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

function KeyRow({
  label,
  value,
  onCopy,
  tone = 'neutral'
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  tone?: 'neutral' | 'danger';
}) {
  const toneClass =
    tone === 'danger'
      ? 'border border-[color-mix(in_srgb,var(--ember)_32%,transparent)] bg-[var(--ember-soft)]'
      : 'bg-[var(--surface-2)]';

  return (
    <div className={`rounded-2xl p-3 ${toneClass}`}>
      <p className="section-eyebrow">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        <span className="min-w-0 flex-1 break-all font-mono text-xs leading-5 text-[var(--ink-2)]">{value}</span>
        {onCopy ? (
          <button type="button" onClick={onCopy} aria-label={`Copy ${label}`} className="app-icon-btn">
            <FiCopy className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function WarningCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[color-mix(in_srgb,var(--ember)_26%,transparent)] bg-[var(--ember-soft)] px-4 py-3 text-[13px] font-semibold leading-5 text-[var(--ember-600)]">
      {children}
    </div>
  );
}

function InfoCard({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-[var(--surface-2)] p-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[var(--surface)] text-[var(--navy)] shadow-sm">
        {icon || <FiBookOpen className="h-4 w-4" />}
      </span>
      <div className="min-w-0">
        <h3 className="text-[14px] font-bold leading-5 text-[var(--ink)]">{title}</h3>
        <p className="mt-1 text-[13px] font-medium leading-5 text-[var(--muted)]">{body}</p>
      </div>
    </div>
  );
}

function RawJson({ data }: { data: Record<string, unknown> }) {
  return (
    <details className="rounded-2xl bg-[var(--surface-2)] px-4 py-3">
      <summary className="cursor-pointer text-[13px] font-bold text-[var(--navy)]">Show technical details</summary>
      <pre className="mt-2 max-h-64 overflow-auto rounded-xl bg-[var(--navy-900)] p-3 text-[11px] leading-4 text-[#cfe0f2]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value?: ReactNode; mono?: boolean }) {
  return (
    <div className="grid gap-1 rounded-2xl bg-[var(--surface-2)] px-4 py-3">
      <p className="section-eyebrow">{label}</p>
      <div className={`${mono ? 'font-mono text-xs' : 'text-[13px]'} min-w-0 break-all font-semibold leading-5 text-[var(--ink-2)]`}>
        {value || 'Not available'}
      </div>
    </div>
  );
}

export function StellarPlaygroundClient({ backHref = '/metro-city' }: { backHref?: string }) {
  const [activeTab, setActiveTab] = useState<PlaygroundTab>('setup');
  const [setupMode, setSetupMode] = useState<SetupMode>('start');
  const [phrase, setPhrase] = useState<string[]>([]);
  const [confirmIndexes, setConfirmIndexes] = useState<number[]>([]);
  const [confirmWords, setConfirmWords] = useState<Record<number, string>>({});
  const [wallet, setWallet] = useState<PlaygroundWallet | null>(null);
  const [secretInput, setSecretInput] = useState('');
  const [secretRevealed, setSecretRevealed] = useState(false);
  const [secretRevealText, setSecretRevealText] = useState('');
  const [savePassword, setSavePassword] = useState('');
  const [loadPassword, setLoadPassword] = useState('');
  const [savedWallet, setSavedWallet] = useState<StoredWalletEnvelope | null>(null);
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('1');
  const [memo, setMemo] = useState('PLAY-0001');
  const [message, setMessage] = useState('CivicTrust Testnet learning payment');
  const [assetType, setAssetType] = useState('XLM');
  const [sep7, setSep7] = useState<Sep7Result | null>(null);
  const [transactionHash, setTransactionHash] = useState('');
  const [expectedDestination, setExpectedDestination] = useState('');
  const [expectedAmount, setExpectedAmount] = useState('1');
  const [expectedMemo, setExpectedMemo] = useState('PLAY-0001');
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [state, setState] = useState<ApiState>(initialState);
  const [freighter, setFreighter] = useState<FreighterState>({
    checked: false,
    installed: false,
    publicKey: '',
    network: '',
    error: ''
  });

  const qrSrc = useMemo(() => {
    if (!sep7?.sep7Uri) return '';
    return `/api/stellar-playground/qr?uri=${encodeURIComponent(sep7.sep7Uri)}`;
  }, [sep7]);

  const currentPublicKey = wallet?.publicKey || destination || '';
  const currentBalance = xlmBalance(accountStatus);
  const status = walletStatus(wallet, accountStatus, sep7);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as StoredWalletEnvelope;
      if (parsed?.version === 1 && parsed.network === 'TESTNET') {
        setSavedWallet(parsed);
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    detectFreighter();
  }, []);

  useEffect(() => {
    if (!state.message && !state.error) return;
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, message: '', error: '' }));
    }, 3600);
    return () => window.clearTimeout(timer);
  }, [state.message, state.error]);

  function setLoadedWallet(nextWallet: PlaygroundWallet, successMessage: string) {
    setWallet(nextWallet);
    setDestination(nextWallet.publicKey);
    setExpectedDestination(nextWallet.publicKey);
    setAccountStatus(null);
    setVerification(null);
    setSecretRevealed(false);
    setSecretRevealText('');
    setState({ loading: false, message: successMessage, error: '' });
  }

  async function runAction(action: () => Promise<void>, successMessage: string) {
    setState({ loading: true, message: '', error: '' });

    try {
      await action();
      setState({ loading: false, message: successMessage, error: '' });
    } catch (error) {
      setState({ loading: false, message: '', error: error instanceof Error ? error.message : 'Something went wrong.' });
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setState({ loading: false, message: 'Copied to clipboard.', error: '' });
  }

  function beginCreateWallet() {
    const nextPhrase = createPracticePhrase();
    setSetupMode('create');
    setPhrase(nextPhrase);
    setConfirmIndexes(pickConfirmationIndexes(nextPhrase));
    setConfirmWords({});
    setWallet(null);
    setAccountStatus(null);
    setVerification(null);
    setSep7(null);
    setState({ loading: false, message: 'Recovery phrase created in this browser.', error: '' });
  }

  function confirmRecoveryPhrase() {
    const matches = confirmIndexes.every((index) => {
      return (confirmWords[index] || '').trim().toLowerCase() === phrase[index];
    });

    if (!matches) {
      setState({ loading: false, message: '', error: 'The confirmation words do not match. Check the phrase and try again.' });
      return;
    }

    setLoadedWallet(createRandomWallet('generated', phrase), 'Testnet learning wallet created.');
  }

  function importTestnetSecret() {
    try {
      if (!secretInput.trim().startsWith('S')) {
        throw new Error('Only paste a Testnet secret key that starts with S.');
      }

      setLoadedWallet(importWalletFromSecret(secretInput), 'Testnet secret key imported locally.');
      setSecretInput('');
    } catch (error) {
      setState({
        loading: false,
        message: '',
        error: error instanceof Error ? error.message : 'That secret key could not be imported.'
      });
    }
  }

  async function saveWalletLocally() {
    if (!wallet) return;

    await runAction(async () => {
      if (savePassword.trim().length < 8) {
        throw new Error('Use at least 8 characters for the local password.');
      }

      const envelope = await encryptSecretKey(wallet, savePassword);
      window.localStorage.setItem(storageKey, JSON.stringify(envelope));
      setSavedWallet(envelope);
      setSavePassword('');
    }, 'Encrypted Testnet wallet saved in this browser.');
  }

  async function loadWalletLocally() {
    if (!savedWallet) return;

    await runAction(async () => {
      if (!loadPassword) {
        throw new Error('Enter the password used to save this local wallet.');
      }

      const secretKey = await decryptSecretKey(savedWallet, loadPassword);
      const loaded = importWalletFromSecret(secretKey);
      setWallet({ ...loaded, source: 'stored', createdAt: savedWallet.createdAt });
      setDestination(savedWallet.publicKey);
      setExpectedDestination(savedWallet.publicKey);
      setLoadPassword('');
      setSecretRevealed(false);
      setSecretRevealText('');
    }, 'Encrypted Testnet wallet unlocked locally.');
  }

  function clearLocalWallet() {
    window.localStorage.removeItem(storageKey);
    setSavedWallet(null);
    setLoadPassword('');
    setState({ loading: false, message: 'Local Testnet wallet cleared from this browser.', error: '' });
  }

  function revealSecret() {
    if (secretRevealText.trim().toUpperCase() !== revealConfirmation) {
      setState({ loading: false, message: '', error: `Type "${revealConfirmation}" before revealing this Testnet secret.` });
      return;
    }

    setSecretRevealed(true);
    setState({ loading: false, message: 'Testnet secret revealed. Keep real wallet secrets out of this app.', error: '' });
  }

  async function fundWallet() {
    const publicKey = wallet?.publicKey || destination;

    await runAction(async () => {
      const result = await postJson<{ account: AccountStatus }>('/api/stellar-playground/wallet/fund', { publicKey });
      setAccountStatus(result.account);
    }, 'Friendbot added Testnet XLM.');
  }

  async function refreshAccount(publicKey = wallet?.publicKey || destination) {
    await runAction(async () => {
      const result = await getJson<{ account: AccountStatus }>(
        `/api/stellar-playground/account/${encodeURIComponent(publicKey)}`
      );
      setAccountStatus(result.account);
    }, 'Account balance refreshed.');
  }

  async function createSep7() {
    await runAction(async () => {
      const result = await postJson<Sep7Result>('/api/stellar-playground/sep7', {
        destination,
        amount,
        memo,
        assetType,
        message
      });
      setSep7(result);
      setExpectedDestination(result.destination);
      setExpectedAmount(result.amount);
      setExpectedMemo(result.memo);
      setVerification(null);
    }, 'SEP-7 payment request created.');
  }

  async function verifyTransaction() {
    await runAction(async () => {
      const result = await postJson<{ result: VerificationResult }>('/api/stellar-playground/verify-transaction', {
        transactionHash,
        expectedDestination,
        expectedAmount,
        expectedMemo
      });
      setVerification(result.result);
    }, 'Horizon verification completed.');
  }

  async function detectFreighter() {
    const provider = getFreighterProvider();

    if (!provider) {
      setFreighter({ checked: true, installed: false, publicKey: '', network: '', error: '' });
      return;
    }

    let network = '';
    try {
      if (provider.getNetwork) {
        network = normalizeFreighterNetwork(await provider.getNetwork());
      }
    } catch {
      network = '';
    }

    setFreighter((current) => ({ ...current, checked: true, installed: true, network, error: '' }));
  }

  async function connectFreighter() {
    const provider = getFreighterProvider();

    if (!provider) {
      setFreighter({ checked: true, installed: false, publicKey: '', network: '', error: '' });
      return;
    }

    setState({ loading: true, message: '', error: '' });

    try {
      let publicKey = '';

      if (provider.requestAccess) {
        publicKey = normalizeFreighterPublicKey(await provider.requestAccess());
      }

      if (!publicKey && provider.getAddress) {
        publicKey = normalizeFreighterPublicKey(await provider.getAddress());
      }

      if (!publicKey && provider.getPublicKey) {
        publicKey = normalizeFreighterPublicKey(await provider.getPublicKey());
      }

      let network = freighter.network;
      if (provider.getNetwork) {
        network = normalizeFreighterNetwork(await provider.getNetwork());
      }

      setFreighter({ checked: true, installed: true, publicKey, network, error: publicKey ? '' : 'Freighter did not return a public key.' });
      setState({ loading: false, message: publicKey ? 'Freighter payer wallet connected.' : '', error: publicKey ? '' : 'Freighter did not return a public key.' });
    } catch (error) {
      const messageText = error instanceof Error ? error.message : 'Freighter connection was cancelled or unavailable.';
      setFreighter((current) => ({ ...current, checked: true, installed: true, error: messageText }));
      setState({ loading: false, message: '', error: messageText });
    }
  }

  const tabs: Array<{ key: PlaygroundTab; label: string; icon: ReactNode }> = [
    { key: 'setup', label: 'Setup', icon: <FiKey /> },
    { key: 'wallet', label: 'Wallet', icon: <FiShield /> },
    { key: 'pay', label: 'Pay', icon: <FiSend /> },
    { key: 'verify', label: 'Verify', icon: <FiHash /> },
    { key: 'learn', label: 'Learn', icon: <FiBookOpen /> }
  ];

  return (
    <div className="civic-device-shell">
      <div className="civic-app-frame">
        <header className="civic-appbar">
          <div className="flex min-w-0 items-center gap-3">
            <Link href={backHref} className="app-icon-btn" aria-label="Back to civic app">
              <FiChevronLeft aria-hidden="true" className="h-5 w-5" />
            </Link>
            <div className="min-w-0">
              <p className="appbar-title truncate">Stellar Playground</p>
              <p className="app-subtitle truncate">Testnet education only</p>
            </div>
          </div>
          <span className="status-pill bg-[var(--ember-soft)] text-[var(--ember-600)]">TESTNET</span>
        </header>

        <main className="civic-viewport grid content-start gap-4 px-5 pt-4">
          <WarningCard>
            <strong>Learning wallet only.</strong> Do not use Mainnet funds, real recovery phrases, or real private keys here.
          </WarningCard>

          {activeTab === 'setup' ? (
            <section className="grid gap-4 fade-up">
              <section className="card p-5">
                <StepHead
                  icon={<FiSmartphone className="h-5 w-5" />}
                  title="1. Choose wallet setup"
                  desc="Pick how you want to learn the Testnet flow."
                  more="Freighter is the recommended payer wallet. This playground wallet is only for learning. In the real civic app, the tenant wallet is the receiving wallet."
                />

                <div className="mt-4 grid gap-3">
                  <button type="button" onClick={beginCreateWallet} className="menu-item rounded-2xl border border-[var(--line)]">
                    <span className="mi-ic">
                      <FiZap className="h-5 w-5" />
                    </span>
                    <span className="mi-tx">
                      <b>Create new Testnet learning wallet</b>
                      <span>Generate a phrase prompt, confirm words, then create a Testnet keypair in your browser.</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSetupMode('freighter');
                      setActiveTab('pay');
                      detectFreighter();
                    }}
                    className="menu-item rounded-2xl border border-[var(--line)]"
                  >
                    <span className="mi-ic">
                      <FiCreditCard className="h-5 w-5" />
                    </span>
                    <span className="mi-tx">
                      <b>Connect/use Freighter wallet</b>
                      <span>Best for signing a payment request. Keep Freighter on Testnet for this playground.</span>
                    </span>
                  </button>

                  <button type="button" onClick={() => setSetupMode('import')} className="menu-item rounded-2xl border border-[var(--line)]">
                    <span className="mi-ic">
                      <FiUpload className="h-5 w-5" />
                    </span>
                    <span className="mi-tx">
                      <b>Import existing Testnet secret key</b>
                      <span>Learning only. Never paste a real wallet secret key or recovery phrase.</span>
                    </span>
                  </button>
                </div>
              </section>

              {setupMode === 'create' ? (
                <section className="card p-5">
                  <StepHead
                    icon={<FiLock className="h-5 w-5" />}
                    title="2. Confirm recovery words"
                    desc="This mimics beginner wallet onboarding before creating a Testnet keypair."
                    more="The current playground uses Stellar Keypair.random() after this phrase check. The UI is ready for full mnemonic support later."
                  />

                  <div className="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--navy)_18%,var(--line))] bg-[var(--surface-2)] p-4">
                    <p className="section-eyebrow">Practice recovery phrase</p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {phrase.map((word, index) => (
                        <div key={`${word}-${index}`} className="rounded-xl bg-[var(--surface)] px-3 py-2 font-mono text-xs font-semibold text-[var(--ink-2)] shadow-sm">
                          {index + 1}. {word}
                        </div>
                      ))}
                    </div>
                  </div>

                  <WarningCard>
                    This is Testnet only. Do not use this phrase with real funds. Do not reuse it anywhere else.
                  </WarningCard>

                  <div className="mt-4 grid gap-3">
                    {confirmIndexes.map((index) => (
                      <div key={index} className="field mb-0">
                        <label className="input-label" htmlFor={`confirm-word-${index}`}>
                          Word {index + 1}
                        </label>
                        <input
                          id={`confirm-word-${index}`}
                          value={confirmWords[index] || ''}
                          onChange={(event) => setConfirmWords((current) => ({ ...current, [index]: event.target.value }))}
                          className="input"
                          autoComplete="off"
                        />
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={confirmRecoveryPhrase} className="btn btn-primary btn-block mt-4">
                    <FiCheckCircle className="h-4 w-4" /> Confirm and create keypair
                  </button>

                  {wallet?.source === 'generated' ? (
                    <div className="mt-4 grid gap-3">
                      <KeyRow label="Public key" value={wallet.publicKey} onCopy={() => copy(wallet.publicKey)} />
                      <KeyRow
                        label="Secret key"
                        value={secretRevealed ? wallet.secretKey : 'Hidden until you confirm below'}
                        onCopy={secretRevealed ? () => copy(wallet.secretKey) : undefined}
                        tone="danger"
                      />
                    </div>
                  ) : null}
                </section>
              ) : null}

              {setupMode === 'import' ? (
                <section className="card p-5">
                  <StepHead
                    icon={<FiAlertTriangle className="h-5 w-5" />}
                    title="Import Testnet secret key"
                    desc="Only use an S... key made for Stellar Testnet learning."
                    more="The key is parsed in your browser to find its public key. It is not sent to the backend."
                  />
                  <WarningCard>
                    Never enter a real wallet recovery phrase or real private key. This importer is for disposable Testnet learning keys only.
                  </WarningCard>
                  <div className="field mb-0 mt-4">
                    <label className="input-label" htmlFor="testnet-secret">Testnet secret key</label>
                    <input
                      id="testnet-secret"
                      value={secretInput}
                      onChange={(event) => setSecretInput(event.target.value)}
                      placeholder="S..."
                      className="input font-mono"
                      autoComplete="off"
                    />
                  </div>
                  <button type="button" onClick={importTestnetSecret} disabled={!secretInput || state.loading} className="btn btn-primary btn-block mt-4 disabled:opacity-60">
                    <FiUpload className="h-4 w-4" /> Import Testnet key locally
                  </button>
                </section>
              ) : null}
            </section>
          ) : null}

          {activeTab === 'wallet' ? (
            <section className="grid gap-4 fade-up">
              <section className="card p-5">
                <StepHead
                  icon={<FiShield className="h-5 w-5" />}
                  title="Account balance"
                  desc="The playground wallet is for Testnet education, not production custody."
                  more="For real signing tests, use Freighter as the payer wallet. The tenant receiving wallet belongs to the civic app, not this learning wallet."
                />

                <div className="mt-4 grid gap-3">
                  <div className="stat-grid">
                    <div className="stat">
                      <p className="sv">{status}</p>
                      <p className="sl">Wallet status</p>
                    </div>
                    <div className="stat">
                      <p className="sv">{currentBalance || '0'} XLM</p>
                      <p className="sl">Testnet balance</p>
                    </div>
                  </div>

                  <DetailRow label="Network" value="Stellar Testnet" />
                  <KeyRow label="Public key" value={currentPublicKey || 'Not created yet'} onCopy={currentPublicKey ? () => copy(currentPublicKey) : undefined} />

                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={fundWallet} disabled={state.loading || !wallet?.publicKey} className="btn btn-primary disabled:opacity-60">
                      <FiDroplet className="h-4 w-4" /> Fund with Friendbot
                    </button>
                    <button
                      type="button"
                      onClick={() => refreshAccount()}
                      disabled={state.loading || !currentPublicKey}
                      className="btn btn-outline disabled:opacity-60"
                    >
                      <FiRefreshCw className="h-4 w-4" /> Refresh
                    </button>
                  </div>

                  {accountStatus?.failureReason ? (
                    <WarningCard>{accountStatus.failureReason}</WarningCard>
                  ) : null}

                  {accountStatus?.explorerUrl ? (
                    <a href={accountStatus.explorerUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-block">
                      <FiExternalLink className="h-4 w-4" /> View on Stellar Expert Testnet
                    </a>
                  ) : null}
                </div>
              </section>

              <section className="card p-5">
                <StepHead
                  icon={<FiLock className="h-5 w-5" />}
                  title="Local wallet storage"
                  desc="Save only disposable Testnet keys, encrypted with a password in this browser."
                  more="The secret key is never sent to the backend. Clearing browser data or forgetting the password removes access to this local copy."
                />

                <div className="mt-4 grid gap-3">
                  {wallet ? (
                    <>
                      <div className="field mb-0">
                        <label className="input-label" htmlFor="save-password">Password for local encryption</label>
                        <input
                          id="save-password"
                          type="password"
                          value={savePassword}
                          onChange={(event) => setSavePassword(event.target.value)}
                          className="input"
                          autoComplete="new-password"
                        />
                      </div>
                      <button type="button" onClick={saveWalletLocally} disabled={state.loading || !savePassword} className="btn btn-primary btn-block disabled:opacity-60">
                        <FiDownload className="h-4 w-4" /> Save locally
                      </button>
                    </>
                  ) : (
                    <InfoCard title="No local wallet loaded" body="Create, import, or unlock a Testnet learning wallet before saving." icon={<FiKey className="h-4 w-4" />} />
                  )}

                  {savedWallet ? (
                    <div className="grid gap-3 rounded-2xl bg-[var(--surface-2)] p-4">
                      <p className="text-[13px] font-bold text-[var(--ink)]">Saved Testnet wallet: {shortKey(savedWallet.publicKey)}</p>
                      <div className="field mb-0">
                        <label className="input-label" htmlFor="load-password">Password to unlock</label>
                        <input
                          id="load-password"
                          type="password"
                          value={loadPassword}
                          onChange={(event) => setLoadPassword(event.target.value)}
                          className="input"
                          autoComplete="current-password"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={loadWalletLocally} disabled={state.loading || !loadPassword} className="btn btn-outline disabled:opacity-60">
                          <FiLock className="h-4 w-4" /> Unlock
                        </button>
                        <button type="button" onClick={clearLocalWallet} className="btn btn-outline">
                          <FiTrash2 className="h-4 w-4" /> Clear local wallet
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {wallet ? (
                    <div className="grid gap-3">
                      <button type="button" onClick={() => copy(wallet.publicKey)} className="btn btn-outline btn-block">
                        <FiCopy className="h-4 w-4" /> Export public key
                      </button>

                      <div className="rounded-2xl border border-[color-mix(in_srgb,var(--ember)_28%,transparent)] bg-[var(--ember-soft)] p-4">
                        <p className="text-[13px] font-bold leading-5 text-[var(--ember-600)]">Reveal secret key only for Testnet learning.</p>
                        <p className="mt-1 text-[12px] font-semibold leading-5 text-[var(--ember-600)]">
                          Type <span className="font-mono">{revealConfirmation}</span> to reveal it. Do not paste real wallet secrets here.
                        </p>
                        <div className="mt-3 grid gap-2">
                          <input
                            value={secretRevealText}
                            onChange={(event) => setSecretRevealText(event.target.value)}
                            className="input"
                            placeholder={revealConfirmation}
                            autoComplete="off"
                          />
                          <button type="button" onClick={revealSecret} className="btn btn-outline btn-block">
                            {secretRevealed ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                            {secretRevealed ? 'Secret revealed' : 'Reveal secret key'}
                          </button>
                        </div>
                      </div>

                      {secretRevealed ? (
                        <KeyRow label="Secret key" value={wallet.secretKey} onCopy={() => copy(wallet.secretKey)} tone="danger" />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </section>
            </section>
          ) : null}

          {activeTab === 'pay' ? (
            <section className="grid gap-4 fade-up">
              <section className="card p-5">
                <StepHead
                  icon={<FiSend className="h-5 w-5" />}
                  title="SEP-7 payment generator"
                  desc="Create a payment request for XLM on Testnet."
                  more="SEP-7 does not send payment by itself. It creates a request that a wallet like Freighter reviews, signs, and submits."
                />

                <div className="mt-4 grid gap-3">
                  <div className="field mb-0">
                    <label className="input-label" htmlFor="sep7-destination">Destination public key</label>
                    <input
                      id="sep7-destination"
                      value={destination}
                      onChange={(event) => setDestination(event.target.value)}
                      placeholder="G..."
                      className="input font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="field mb-0">
                      <label className="input-label" htmlFor="sep7-amount">Amount</label>
                      <input id="sep7-amount" value={amount} onChange={(event) => setAmount(event.target.value)} className="input" inputMode="decimal" />
                    </div>
                    <div className="field mb-0">
                      <label className="input-label" htmlFor="sep7-asset">Asset</label>
                      <select id="sep7-asset" value={assetType} onChange={(event) => setAssetType(event.target.value)} className="select">
                        <option value="XLM">XLM only</option>
                      </select>
                    </div>
                  </div>

                  <div className="field mb-0">
                    <label className="input-label" htmlFor="sep7-memo">Memo/reference</label>
                    <input
                      id="sep7-memo"
                      value={memo}
                      maxLength={28}
                      onChange={(event) => setMemo(event.target.value)}
                      className="input font-mono"
                    />
                  </div>

                  <div className="field mb-0">
                    <label className="input-label" htmlFor="sep7-message">Optional message/label</label>
                    <input id="sep7-message" value={message} onChange={(event) => setMessage(event.target.value)} className="input" />
                  </div>

                  <button type="button" onClick={createSep7} disabled={state.loading || !destination} className="btn btn-primary btn-block disabled:opacity-60">
                    <FiLink className="h-4 w-4" /> Generate SEP-7 URI
                  </button>

                  {sep7 ? (
                    <div className="grid gap-3">
                      {qrSrc ? (
                        <div className="mx-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-3 shadow-sm">
                          <img src={qrSrc} alt="SEP-7 payment request QR code" className="h-[200px] w-[200px]" />
                        </div>
                      ) : null}

                      <DetailRow label="SEP-7 URI" value={sep7.sep7Uri} mono />
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => copy(sep7.sep7Uri)} className="btn btn-outline">
                          <FiCopy className="h-4 w-4" /> Copy URI
                        </button>
                        <a href={sep7.sep7Uri} className="btn btn-primary">
                          <FiExternalLink className="h-4 w-4" /> Open wallet
                        </a>
                      </div>
                    </div>
                  ) : (
                    <InfoCard
                      title="Tenant wallet as receiver"
                      body="In the real civic app, this destination is the tenant receiving wallet. In the playground, you can use your Testnet learning wallet."
                      icon={<FiHome className="h-4 w-4" />}
                    />
                  )}
                </div>
              </section>

              <section className="card p-5">
                <StepHead
                  icon={<FiCreditCard className="h-5 w-5" />}
                  title="Use Freighter as payer wallet"
                  desc="Freighter is recommended for signing real Testnet payment requests."
                  more="The playground still works without Freighter by showing the QR code and SEP-7 URI."
                />

                <div className="mt-4 grid gap-3">
                  {freighter.installed ? (
                    <>
                      <div className="status-pill w-fit bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]">
                        <FiCheckCircle className="h-3.5 w-3.5" /> Freighter detected
                      </div>
                      <button type="button" onClick={connectFreighter} disabled={state.loading} className="btn btn-outline btn-block disabled:opacity-60">
                        <FiWifi className="h-4 w-4" /> Connect Freighter
                      </button>
                      {freighter.publicKey ? <KeyRow label="Connected payer public key" value={freighter.publicKey} onCopy={() => copy(freighter.publicKey)} /> : null}
                      <DetailRow label="Freighter network" value={freighter.network || 'Not reported'} />
                      {freighter.network && !freighter.network.toUpperCase().includes('TEST') ? (
                        <WarningCard>Switch Freighter to Testnet before signing this payment request.</WarningCard>
                      ) : null}
                      {freighter.error ? <WarningCard>{freighter.error}</WarningCard> : null}
                    </>
                  ) : (
                    <div className="grid gap-3">
                      <div className="status-pill w-fit bg-[var(--ember-soft)] text-[var(--ember-600)]">
                        <FiXCircle className="h-3.5 w-3.5" /> Freighter not detected
                      </div>
                      <InfoCard
                        title="Freighter setup"
                        body="Install the Freighter extension, create a wallet, switch it to Testnet, fund the Testnet account, then return to this playground."
                        icon={<FiCreditCard className="h-4 w-4" />}
                      />
                    </div>
                  )}

                  {sep7 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => copy(sep7.sep7Uri)} className="btn btn-outline">
                        <FiCopy className="h-4 w-4" /> Copy request
                      </button>
                      <a href={sep7.sep7Uri} className="btn btn-primary">
                        <FiExternalLink className="h-4 w-4" /> Open request
                      </a>
                    </div>
                  ) : null}
                </div>
              </section>
            </section>
          ) : null}

          {activeTab === 'verify' ? (
            <section className="grid gap-4 fade-up">
              <section className="card p-5">
                <StepHead
                  icon={<FiDatabase className="h-5 w-5" />}
                  title="Transaction verification"
                  desc="Paste a real Stellar Testnet transaction hash and Horizon will check it."
                  more="This does not fake payment results. The transaction must exist on Horizon Testnet and match the destination, amount, memo, and XLM asset."
                />

                <div className="mt-4 grid gap-3">
                  <div className="field mb-0">
                    <label className="input-label" htmlFor="verify-hash">Transaction hash</label>
                    <input
                      id="verify-hash"
                      value={transactionHash}
                      onChange={(event) => setTransactionHash(event.target.value)}
                      placeholder="64-character hash"
                      className="input font-mono"
                    />
                  </div>
                  <div className="field mb-0">
                    <label className="input-label" htmlFor="verify-destination">Expected destination</label>
                    <input
                      id="verify-destination"
                      value={expectedDestination}
                      onChange={(event) => setExpectedDestination(event.target.value)}
                      placeholder="G..."
                      className="input font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="field mb-0">
                      <label className="input-label" htmlFor="verify-amount">Expected amount</label>
                      <input id="verify-amount" value={expectedAmount} onChange={(event) => setExpectedAmount(event.target.value)} className="input" inputMode="decimal" />
                    </div>
                    <div className="field mb-0">
                      <label className="input-label" htmlFor="verify-memo">Expected memo</label>
                      <input id="verify-memo" value={expectedMemo} onChange={(event) => setExpectedMemo(event.target.value)} className="input font-mono" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={verifyTransaction}
                    disabled={state.loading || !transactionHash || !expectedDestination}
                    className="btn btn-primary btn-block disabled:opacity-60"
                  >
                    <FiCheckCircle className="h-4 w-4" /> Verify with Horizon
                  </button>
                </div>
              </section>

              {verification ? (
                <section className="card p-5">
                  <div
                    className={`status-pill w-fit ${
                      verification.verified
                        ? 'bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]'
                        : 'bg-[var(--ember-soft)] text-[var(--ember-600)]'
                    }`}
                  >
                    {verification.verified ? <FiCheckCircle className="h-3.5 w-3.5" /> : <FiAlertTriangle className="h-3.5 w-3.5" />}
                    {verification.verified ? 'Verified Testnet payment' : 'Verification failed'}
                  </div>

                  <div className="mt-4 grid gap-3">
                    {verification.failureReason ? <WarningCard>{verification.failureReason}</WarningCard> : null}
                    <DetailRow label="Transaction hash" value={verification.transactionHash || transactionHash} mono />
                    <DetailRow label="Ledger number" value={verification.ledger} />
                    <DetailRow label="Created date" value={verification.paidAt} />
                    <DetailRow label="Source account" value={verification.sourceAccount || verification.payerPublicKey} mono />
                    <DetailRow label="Destination account" value={verification.destinationPublicKey || expectedDestination} mono />
                    <DetailRow label="Amount" value={verification.amount ? `${verification.amount} ${verification.assetCode || 'XLM'}` : expectedAmount} />
                    <DetailRow label="Memo" value={verification.memo || expectedMemo} mono />
                    {verification.explorerUrl ? (
                      <a href={verification.explorerUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-block">
                        <FiExternalLink className="h-4 w-4" /> Open Stellar Expert transaction
                      </a>
                    ) : null}
                    <RawJson data={verification as Record<string, unknown>} />
                  </div>
                </section>
              ) : null}
            </section>
          ) : null}

          {activeTab === 'learn' ? (
            <section className="grid gap-4 fade-up">
              <section className="card p-5">
                <StepHead
                  icon={<FiBookOpen className="h-5 w-5" />}
                  title="Beginner explanations"
                  desc="Plain-language notes for the Stellar pieces used by CivicTrust."
                />
                <div className="mt-4 grid gap-3">
                  {learningCards.map((card) => (
                    <InfoCard key={card.title} title={card.title} body={card.body} />
                  ))}
                </div>
              </section>
            </section>
          ) : null}
        </main>

        <nav className="tabbar" aria-label="Stellar Playground sections">
          {tabs.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`tab ${activeTab === tab.key ? 'on' : ''}`.trim()}>
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {state.message || state.error ? (
          <div className="toast-wrap">
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
