import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { badRequest, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { setPlatformAuthCookie, signPlatformAuthToken } from '@/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return badRequest(res, 'Email and password are required.');
    }

    const admin = await prisma.platformAdmin.findFirst({
      where: { email: String(email).trim().toLowerCase(), isActive: true }
    });

    if (!admin || !(await bcrypt.compare(String(password), admin.passwordHash))) {
      return unauthorized(res, 'Invalid platform login details.');
    }

    setPlatformAuthCookie(res, signPlatformAuthToken({ platformAdminId: admin.id }));

    return ok(res, { admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (error) {
    return serverError(res, error);
  }
}
