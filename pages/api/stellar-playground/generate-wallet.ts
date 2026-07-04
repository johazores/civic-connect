import type { NextApiRequest, NextApiResponse } from 'next';
import { generateStellarKeypair } from '@/lib/stellar/index';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const keypair = generateStellarKeypair();

  return res.status(200).json({
    publicKey: keypair.publicKey,
    secretKey: keypair.secretKey,
    warning: 'Practice only. Never use this page to create or store real wallets.'
  });
}
