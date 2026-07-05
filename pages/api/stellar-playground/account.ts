import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchHorizonAccount, isValidStellarPublicKey, resolveStellarNetworkConfigFromRuntime } from '@/lib/stellar/index';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const publicKey = String(req.body?.publicKey || '').trim();

  if (!isValidStellarPublicKey(publicKey)) {
    return res.status(400).json({ error: 'Enter a valid wallet address.' });
  }

  const config = await resolveStellarNetworkConfigFromRuntime({ network: 'TESTNET' });
  const account = await fetchHorizonAccount({ horizonUrl: config.horizonUrl, publicKey });

  return res.status(200).json({ account });
}
