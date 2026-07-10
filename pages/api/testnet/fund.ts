import type { NextApiRequest, NextApiResponse } from 'next';
import { fundTestnetAccount, fetchHorizonAccount, isValidStellarPublicKey } from '@/lib/stellar/index';
import { defaultTestnetConfig } from '@/lib/stellar/config';
import { stellarExpertAccountUrl } from '@/lib/stellar/explorer';

/** Testnet-only: fund a practice wallet for demos. Production payments use tenant wallets. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const publicKey = String(req.body?.publicKey || '').trim();

  if (!isValidStellarPublicKey(publicKey)) {
    return res.status(400).json({ error: 'Enter a valid Stellar Testnet public key.' });
  }

  const config = defaultTestnetConfig();

  if (!config.friendbotUrl) {
    return res.status(400).json({ error: 'Friendbot is only available on testnet.' });
  }

  try {
    await fundTestnetAccount({ friendbotUrl: config.friendbotUrl, publicKey });
    const account = await fetchHorizonAccount({ horizonUrl: config.horizonUrl, publicKey });

    return res.status(200).json({
      network: config.network,
      account: { ...account, explorerUrl: stellarExpertAccountUrl(publicKey, config.network) }
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Friendbot could not fund this account.'
    });
  }
}
