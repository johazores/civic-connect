import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, notFound, ok, serverError } from '@/lib/api-response';
import { getCivicLedger } from '@/services/civic-stellar-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method !== 'GET') {
      return methodNotAllowed(res);
    }

    const ledger = await getCivicLedger(tenantSlug);

    if (!ledger) {
      return notFound(res, 'Tenant not found.');
    }

    return ok(res, ledger);
  } catch (error) {
    return serverError(res, error);
  }
}
