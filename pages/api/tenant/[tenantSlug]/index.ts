import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, notFound, ok, serverError } from '@/lib/api-response';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  try {
    const tenantSlug = String(req.query.tenantSlug || '');
    const tenant = await getTenantBySlug(tenantSlug);

    if (!tenant) {
      return notFound(res, 'Tenant not found.');
    }

    return ok(res, tenant);
  } catch (error) {
    return serverError(res, error);
  }
}
