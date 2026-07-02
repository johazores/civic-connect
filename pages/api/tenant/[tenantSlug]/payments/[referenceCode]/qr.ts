import type { NextApiRequest, NextApiResponse } from 'next';
import QRCode from 'qrcode';
import { methodNotAllowed, notFound, serverError } from '@/lib/api-response';
import { getPaymentIntentByReference } from '@/services/payment-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const referenceCode = String(req.query.referenceCode || '');

  try {
    if (req.method !== 'GET') {
      return methodNotAllowed(res);
    }

    const paymentIntent = await getPaymentIntentByReference(tenantSlug, referenceCode);

    if (!paymentIntent) {
      return notFound(res, 'Payment intent not found.');
    }

    const svg = await QRCode.toString(paymentIntent.sep7Uri, {
      type: 'svg',
      margin: 1,
      width: 420,
      errorCorrectionLevel: 'M'
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(svg);
  } catch (error) {
    return serverError(res, error);
  }
}
