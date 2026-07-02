import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, notFound, ok, serverError } from '@/lib/api-response';
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
      return notFound(res, 'Payment receipt not found.');
    }

    return ok(res, paymentIntent);
  } catch (error) {
    return serverError(res, error);
  }
}
