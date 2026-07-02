import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantCitizen } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const auth = await requireTenantCitizen(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    return ok(res, {
      citizen: auth.citizen,
      tenant: {
        id: auth.tenant.id,
        slug: auth.tenant.slug,
        name: auth.tenant.name
      }
    });
  } catch (error) {
    return serverError(res, error);
  }
}
