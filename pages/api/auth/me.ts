import type { NextApiRequest, NextApiResponse } from 'next';
import { getAuthUser } from '@/lib/auth';
import { methodNotAllowed, ok, unauthorized } from '@/lib/api-response';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  const user = await getAuthUser(req);

  if (!user) {
    return unauthorized(res);
  }

  return ok(res, user);
}
