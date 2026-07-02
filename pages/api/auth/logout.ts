import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAuthCookie } from '@/lib/auth';
import { methodNotAllowed, ok } from '@/lib/api-response';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  clearAuthCookie(res);
  return ok(res, { success: true });
}
