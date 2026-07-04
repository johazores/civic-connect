import type { NextApiRequest, NextApiResponse } from 'next';
import { isValidStellarPublicKey, normalizeStellarAmount, resolveStellarNetworkConfig, verifyStellarPaymentByHash } from '@/lib/stellar/index';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const transactionHash = String(req.body?.transactionHash || '').trim();
  const destinationPublicKey = String(req.body?.destinationPublicKey || '').trim();
  const amount = normalizeStellarAmount(String(req.body?.amount || ''));
  const memo = String(req.body?.memo || '').trim();

  if (!isValidStellarPublicKey(destinationPublicKey)) {
    return res.status(400).json({ error: 'Enter a valid wallet address.' });
  }

  if (!transactionHash) {
    return res.status(400).json({ error: 'Payment ID is required.' });
  }

  if (!memo) {
    return res.status(400).json({ error: 'Receipt note is required so the payment can be matched.' });
  }

  const config = resolveStellarNetworkConfig({ network: 'TESTNET' });
  const result = await verifyStellarPaymentByHash({
    horizonUrl: config.horizonUrl,
    transactionHash,
    destinationPublicKey,
    amount,
    assetCode: 'XLM',
    memo
  });

  return res.status(200).json({ result });
}
