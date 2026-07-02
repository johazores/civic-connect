import type { NextApiRequest, NextApiResponse } from 'next';
import { clearCitizenAuthCookie } from '@/lib/auth';
import { methodNotAllowed, ok } from '@/lib/api-response';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  clearCitizenAuthCookie(res);
  return ok(res, { success: true });
}
