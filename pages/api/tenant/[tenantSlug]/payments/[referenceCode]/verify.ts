import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok } from '@/lib/api-response';
import { asOptionalString, asString } from '@/lib/request';
import { verifyPaymentIntent } from '@/services/payment-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const referenceCode = String(req.query.referenceCode || '');

  try {
    if (req.method !== 'POST') {
      return methodNotAllowed(res);
    }

    const body = req.body || {};
    const transactionHash = asOptionalString(body.transactionHash);
    const mode = asString(body.mode, transactionHash ? 'hash' : 'scan') === 'hash' ? 'hash' : 'scan';
    const paymentIntent = await verifyPaymentIntent(tenantSlug, referenceCode, transactionHash, mode);

    return ok(res, paymentIntent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to verify payment.';
    return badRequest(res, message);
  }
}
