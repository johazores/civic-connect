import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requirePlatformAdmin } from '@/lib/auth';
import { createTenant, listTenantsWithStats } from '@/services/platform-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const admin = await requirePlatformAdmin(req);

  if (!admin) {
    return unauthorized(res);
  }

  try {
    if (req.method === 'GET') {
      return ok(res, await listTenantsWithStats());
    }

    if (req.method === 'POST') {
      return created(res, await createTenant(req.body || {}));
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process request.';
    return req.method === 'POST' ? badRequest(res, message) : serverError(res, error);
  }
}
