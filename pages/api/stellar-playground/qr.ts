import type { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const uri = String(req.query.uri || '').trim();

  if (!uri || !uri.startsWith('web+stellar:pay?')) {
    return res.status(400).json({ error: 'Valid payment link is required.' });
  }

  const png = await QRCode.toBuffer(uri, {
    type: 'png',
    margin: 2,
    width: 360,
    errorCorrectionLevel: 'M'
  });

  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(png);
}
