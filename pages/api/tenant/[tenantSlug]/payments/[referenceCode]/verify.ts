import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, serverError } from '@/lib/api-response';
import { asString, hasRequiredStrings } from '@/lib/request';
import { verifyPaymentIntent } from '@/services/payment-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const referenceCode = String(req.query.referenceCode || '');

  try {
    if (req.method !== 'POST') {
      return methodNotAllowed(res);
    }

    const body = req.body || {};

    if (!hasRequiredStrings(body, ['transactionHash'])) {
      return badRequest(res, 'Transaction hash is required.');
    }

    const paymentIntent = await verifyPaymentIntent(tenantSlug, referenceCode, asString(body.transactionHash));

    return ok(res, paymentIntent);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to verify payment.';
    return badRequest(res, message);
  }
}
