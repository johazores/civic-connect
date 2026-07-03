import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, ok, unauthorized } from '@/lib/api-response';
import { getPlatformAdmin } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  const admin = await getPlatformAdmin(req);

  if (!admin) {
    return unauthorized(res);
  }

  return ok(res, { admin });
}
