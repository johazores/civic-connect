import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, ok } from '@/lib/api-response';
import { clearPlatformAuthCookie } from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  clearPlatformAuthCookie(res);
  return ok(res, { ok: true });
}
