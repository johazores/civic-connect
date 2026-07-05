import type { NextApiRequest, NextApiResponse } from 'next';
import {
  isValidStellarPublicKey,
  normalizeStellarAmount,
  resolveStellarNetworkConfigFromRuntime,
  stellarExpertTxUrl,
  verifyStellarPaymentByHash
} from '@/lib/stellar/index';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const transactionHash = String(req.body?.transactionHash || '').trim();
  const destinationPublicKey = String(req.body?.expectedDestination || req.body?.destinationPublicKey || '').trim();
  const amount = normalizeStellarAmount(String(req.body?.expectedAmount || req.body?.amount || ''));
  const memo = String(req.body?.expectedMemo || req.body?.memo || '').trim();

  if (!transactionHash) {
    return res.status(400).json({ error: 'Transaction hash is required.' });
  }

  if (!isValidStellarPublicKey(destinationPublicKey)) {
    return res.status(400).json({ error: 'Enter a valid expected destination public key.' });
  }

  if (amount === '0.0000000') {
    return res.status(400).json({ error: 'Expected amount must be greater than zero.' });
  }

  if (!memo) {
    return res.status(400).json({ error: 'Expected memo is required.' });
  }

  const config = await resolveStellarNetworkConfigFromRuntime({ network: 'TESTNET' });

  try {
    const result = await verifyStellarPaymentByHash({
      horizonUrl: config.horizonUrl,
      transactionHash,
      destinationPublicKey,
      amount,
      assetCode: 'XLM',
      memo
    });

    return res.status(200).json({
      result: {
        ...result,
        network: config.network,
        explorerUrl: stellarExpertTxUrl(result.transactionHash || transactionHash, config.network)
      }
    });
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Unable to verify the transaction with Horizon Testnet.'
    });
  }
}
