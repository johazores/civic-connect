import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchHorizonAccount, isValidStellarPublicKey, resolveStellarNetworkConfig, stellarExpertAccountUrl } from '@/lib/stellar/index';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const publicKey = String(req.query.publicKey || '').trim();

  if (!isValidStellarPublicKey(publicKey)) {
    return res.status(400).json({ error: 'Enter a valid Stellar Testnet public key.' });
  }

  const config = resolveStellarNetworkConfig({ network: 'TESTNET' });

  try {
    const account = await fetchHorizonAccount({ horizonUrl: config.horizonUrl, publicKey });

    return res.status(200).json({
      network: config.network,
      account: {
        ...account,
        network: config.network,
        explorerUrl: stellarExpertAccountUrl(publicKey, config.network)
      }
    });
  } catch {
    return res.status(502).json({ error: 'Unable to read this Testnet account from Horizon.' });
  }
}
