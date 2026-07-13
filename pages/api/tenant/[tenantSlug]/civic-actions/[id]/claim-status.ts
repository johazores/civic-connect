import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, notFound, ok, serverError } from '@/lib/api-response';
import { getCivicActionClaimStatus } from '@/services/civic-actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    if (req.method !== 'GET') {
      return methodNotAllowed(res);
    }

    const status = await getCivicActionClaimStatus(tenantSlug, id);
    return ok(res, status);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to read claim status.';
    if (message.includes('not found')) {
      return notFound(res, message);
    }
    return serverError(res, error);
  }
}
