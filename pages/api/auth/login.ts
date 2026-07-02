import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { badRequest, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { prisma } from '@/lib/db';
import { setAuthCookie, signAuthToken } from '@/lib/auth';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  try {
    const { tenantSlug, email, password } = req.body || {};

    if (!tenantSlug || !email || !password) {
      return badRequest(res, 'Tenant, email, and password are required.');
    }

    const user = await prisma.user.findFirst({
      where: {
        email: normalizeEmail(String(email)),
        isActive: true,
        tenant: {
          slug: tenantSlug,
          isActive: true
        }
      },
      include: {
        tenant: true
      }
    });

    if (!user) {
      return unauthorized(res, 'Invalid login details.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return unauthorized(res, 'Invalid login details.');
    }

    const token = signAuthToken({ userId: user.id, tenantId: user.tenantId });
    setAuthCookie(res, token);

    return ok(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tenant: {
        id: user.tenant.id,
        slug: user.tenant.slug,
        name: user.tenant.name
      }
    });
  } catch (error) {
    return serverError(res, error);
  }
}
