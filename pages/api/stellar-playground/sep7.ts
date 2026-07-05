import type { NextApiRequest, NextApiResponse } from 'next';
import { buildSep7PayUri, isValidStellarPublicKey, normalizeStellarAmount, resolveStellarNetworkConfigFromRuntime } from '@/lib/stellar/index';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const destination = String(req.body?.destination || '').trim();
  const amount = normalizeStellarAmount(String(req.body?.amount || '1'));
  const memo = String(req.body?.memo || `PLAY-${Date.now()}`).trim().slice(0, 28);
  const message = String(req.body?.message || 'CivicTrust practice payment').trim().slice(0, 300);

  if (!isValidStellarPublicKey(destination)) {
    return res.status(400).json({ error: 'Enter a valid receiving wallet address.' });
  }

  if (amount === '0.0000000') {
    return res.status(400).json({ error: 'Amount must be greater than zero.' });
  }

  const config = await resolveStellarNetworkConfigFromRuntime({ network: 'TESTNET' });
  const sep7Uri = buildSep7PayUri({
    destination,
    amount,
    assetCode: 'XLM',
    memo,
    message,
    networkPassphrase: config.networkPassphrase,
    originDomain: req.headers.host || undefined
  });

  return res.status(200).json({ sep7Uri, destination, amount, memo, network: config.network, networkPassphrase: config.networkPassphrase });
}
