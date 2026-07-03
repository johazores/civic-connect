import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from '@/lib/api-response';
import { requirePlatformAdmin } from '@/lib/auth';
import { resetTenantAdmin, updateTenant } from '@/services/platform-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requirePlatformAdmin(req);

  if (!admin) {
    return unauthorized(res);
  }

  const id = String(req.query.id || '');

  try {
    if (req.method === 'PATCH') {
      const tenant = await updateTenant(id, req.body || {});
      return ok(res, { id: tenant.id, slug: tenant.slug, isActive: tenant.isActive });
    }

    if (req.method === 'POST') {
      // Reset / (re)create the tenant's admin credentials.
      const result = await resetTenantAdmin(id, req.body || {});
      return ok(res, result);
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update tenant.';
    return badRequest(res, message);
  }
}
