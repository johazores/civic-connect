import type { NextApiRequest, NextApiResponse } from 'next';
import {
  fetchHorizonAccount,
  fundTestnetAccount,
  isValidStellarPublicKey,
  resolveStellarNetworkConfigFromRuntime,
  stellarExpertAccountUrl
} from '@/lib/stellar/index';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const publicKey = String(req.body?.publicKey || '').trim();

  if (!isValidStellarPublicKey(publicKey)) {
    return res.status(400).json({ error: 'Enter a valid Stellar Testnet public key.' });
  }

  const config = await resolveStellarNetworkConfigFromRuntime({ network: 'TESTNET' });

  if (config.network !== 'TESTNET' || !config.friendbotUrl) {
    return res.status(400).json({ error: 'Friendbot funding is available only on Stellar Testnet.' });
  }

  try {
    await fundTestnetAccount({ friendbotUrl: config.friendbotUrl, publicKey });
    const account = await fetchHorizonAccount({ horizonUrl: config.horizonUrl, publicKey });

    return res.status(200).json({
      network: config.network,
      account: {
        ...account,
        network: config.network,
        explorerUrl: stellarExpertAccountUrl(publicKey, config.network)
      }
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Friendbot could not fund this Testnet account.'
    });
  }
}
