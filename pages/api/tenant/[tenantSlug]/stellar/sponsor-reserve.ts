import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { sponsorMemberReserve } from '@/services/stellar-wallet-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method !== 'POST') {
      return methodNotAllowed(res);
    }

    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    const result = await sponsorMemberReserve(tenantSlug);
    return ok(res, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sponsor member reserve.';
    return badRequest(res, message);
  }
}
