import { cleanBaseUrl } from './config';

export type HorizonAccountStatus = {
  exists: boolean;
  publicKey: string;
  balances: Array<{ assetType: string; assetCode: string; balance: string }>;
  lastModifiedLedger?: number;
  failureReason?: string;
};

export type HorizonTransaction = {
  hash: string;
  ledger: number;
  successful: boolean;
  memo?: string;
  created_at: string;
};

export type HorizonPaymentOperation = Record<string, any> & {
  id: string;
  transaction_hash: string;
  type: string;
  from?: string;
  to?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  created_at?: string;
};

async function readJson(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function fetchHorizonAccount(input: { horizonUrl: string; publicKey: string }): Promise<HorizonAccountStatus> {
  const horizonUrl = cleanBaseUrl(input.horizonUrl);
  const response = await fetch(`${horizonUrl}/accounts/${encodeURIComponent(input.publicKey)}`, {
    headers: { Accept: 'application/json' }
  });

  if (response.status === 404) {
    return { exists: false, publicKey: input.publicKey, balances: [], failureReason: 'Account was not found on the configured Stellar network.' };
  }

  if (!response.ok) {
    return { exists: false, publicKey: input.publicKey, balances: [], failureReason: 'Unable to read account from Horizon.' };
  }

  const account = await readJson(response);

  return {
    exists: true,
    publicKey: input.publicKey,
    balances: (account?.balances || []).map((balance: Record<string, string>) => ({
      assetType: balance.asset_type || '',
      assetCode: balance.asset_code || (balance.asset_type === 'native' ? 'XLM' : ''),
      balance: balance.balance || '0'
    })),
    lastModifiedLedger: Number(account?.last_modified_ledger || 0) || undefined
  };
}

export async function fundTestnetAccount(input: { friendbotUrl: string; publicKey: string }) {
  const friendbotUrl = cleanBaseUrl(input.friendbotUrl);
  const response = await fetch(`${friendbotUrl}?addr=${encodeURIComponent(input.publicKey)}`, {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });
  const payload = await readJson(response);

  if (!response.ok) {
    const message = payload?.detail || payload?.title || payload?.error || 'Friendbot could not fund this account.';
    throw new Error(message);
  }

  return payload;
}

export async function getTransactionByHash(input: { horizonUrl: string; transactionHash: string }): Promise<HorizonTransaction | null> {
  const horizonUrl = cleanBaseUrl(input.horizonUrl);
  const response = await fetch(`${horizonUrl}/transactions/${encodeURIComponent(input.transactionHash)}`, {
    headers: { Accept: 'application/json' }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Unable to read transaction from Horizon.');
  }

  return readJson(response);
}

export async function getTransactionOperations(input: { horizonUrl: string; transactionHash: string }): Promise<HorizonPaymentOperation[]> {
  const horizonUrl = cleanBaseUrl(input.horizonUrl);
  const response = await fetch(`${horizonUrl}/transactions/${encodeURIComponent(input.transactionHash)}/operations?limit=200`, {
    headers: { Accept: 'application/json' }
  });

  if (!response.ok) {
    throw new Error('Unable to read transaction operations from Horizon.');
  }

  const payload = await readJson(response);
  return Array.isArray(payload?._embedded?.records) ? payload._embedded.records : [];
}

export async function getAccountTransactions(input: { horizonUrl: string; publicKey: string; limit?: number }): Promise<HorizonTransaction[]> {
  const horizonUrl = cleanBaseUrl(input.horizonUrl);
  const limit = Math.min(Math.max(input.limit || 100, 1), 200);
  const response = await fetch(`${horizonUrl}/accounts/${encodeURIComponent(input.publicKey)}/transactions?order=desc&limit=${limit}`, {
    headers: { Accept: 'application/json' }
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error('Unable to read account transactions from Horizon.');
  }

  const payload = await readJson(response);
  return Array.isArray(payload?._embedded?.records) ? payload._embedded.records : [];
}
