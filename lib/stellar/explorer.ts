import { cleanBaseUrl } from './config';

/** Public block-explorer + Horizon deep links so anyone can independently verify a civic record. */

function explorerNetworkSegment(network?: string | null) {
  return String(network || 'TESTNET').toUpperCase() === 'MAINNET' ? 'public' : 'testnet';
}

export function stellarExpertTxUrl(transactionHash?: string | null, network?: string | null) {
  if (!transactionHash) return null;
  return `https://stellar.expert/explorer/${explorerNetworkSegment(network)}/tx/${encodeURIComponent(transactionHash)}`;
}

export function stellarExpertAccountUrl(publicKey?: string | null, network?: string | null) {
  if (!publicKey) return null;
  return `https://stellar.expert/explorer/${explorerNetworkSegment(network)}/account/${encodeURIComponent(publicKey)}`;
}

export function stellarExpertClaimableBalanceUrl(balanceId?: string | null, network?: string | null) {
  if (!balanceId) return null;
  return `https://stellar.expert/explorer/${explorerNetworkSegment(network)}/claimable-balance/${encodeURIComponent(balanceId)}`;
}

export function horizonTxUrl(horizonUrl?: string | null, transactionHash?: string | null) {
  if (!transactionHash) return null;
  const base = cleanBaseUrl(horizonUrl || 'https://horizon-testnet.stellar.org');
  return `${base}/transactions/${encodeURIComponent(transactionHash)}`;
}
