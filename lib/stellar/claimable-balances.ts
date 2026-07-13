import { cleanBaseUrl } from './config';

export type ClaimableBalanceStatus = {
  id: string;
  assetCode: string;
  amount: string;
  claimant: string;
  sponsor: string;
  isClaimed: boolean;
  lastModifiedLedger?: number;
};

async function readJson(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function fetchClaimableBalance(input: {
  horizonUrl: string;
  balanceId: string;
}): Promise<ClaimableBalanceStatus | null> {
  const horizonUrl = cleanBaseUrl(input.horizonUrl);
  const response = await fetch(`${horizonUrl}/claimable_balances/${encodeURIComponent(input.balanceId)}`, {
    headers: { Accept: 'application/json' }
  });

  if (response.status === 404) {
    return { id: input.balanceId, assetCode: '', amount: '0', claimant: '', sponsor: '', isClaimed: true };
  }

  if (!response.ok) {
    throw new Error('Unable to read claimable balance from Horizon.');
  }

  const balance = await readJson(response);
  const claimant = Array.isArray(balance?.claimants) ? balance.claimants[0] : null;

  return {
    id: balance?.id || input.balanceId,
    assetCode: balance?.asset === 'native' ? 'XLM' : String(balance?.asset || '').split(':')[0] || 'XLM',
    amount: balance?.amount || '0',
    claimant: claimant?.destination || '',
    sponsor: balance?.sponsor || '',
    isClaimed: false,
    lastModifiedLedger: Number(balance?.last_modified_ledger || 0) || undefined
  };
}

export async function listClaimableBalancesForClaimant(input: {
  horizonUrl: string;
  claimantPublicKey: string;
  limit?: number;
}): Promise<ClaimableBalanceStatus[]> {
  const horizonUrl = cleanBaseUrl(input.horizonUrl);
  const limit = Math.min(Math.max(input.limit || 20, 1), 50);
  const response = await fetch(
    `${horizonUrl}/claimable_balances?claimant=${encodeURIComponent(input.claimantPublicKey)}&limit=${limit}`,
    { headers: { Accept: 'application/json' } }
  );

  if (!response.ok) {
    return [];
  }

  const payload = await readJson(response);
  const records: Array<Record<string, any>> = Array.isArray(payload?._embedded?.records) ? payload._embedded.records : [];

  return records.map((balance) => {
    const claimant = Array.isArray(balance.claimants) ? balance.claimants[0] : null;
    return {
      id: balance.id,
      assetCode: balance.asset === 'native' ? 'XLM' : String(balance.asset || '').split(':')[0] || 'XLM',
      amount: balance.amount || '0',
      claimant: claimant?.destination || '',
      sponsor: balance.sponsor || '',
      isClaimed: false,
      lastModifiedLedger: Number(balance.last_modified_ledger || 0) || undefined
    };
  });
}
