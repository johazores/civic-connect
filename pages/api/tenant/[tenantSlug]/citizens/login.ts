import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { badRequest, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { setCitizenAuthCookie, signCitizenAuthToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return badRequest(res, 'Email and password are required.');
    }

    const citizen = await prisma.citizen.findFirst({
      where: {
        email: normalizeEmail(String(email)),
        isActive: true,
        tenant: {
          slug: tenantSlug,
          isActive: true
        }
      },
      include: {
        tenant: {
          select: { id: true, slug: true, name: true }
        }
      }
    });

    if (!citizen) {
      return unauthorized(res, 'Invalid login details.');
    }

    const isPasswordValid = await bcrypt.compare(String(password), citizen.passwordHash);

    if (!isPasswordValid) {
      return unauthorized(res, 'Invalid login details.');
    }

    const token = signCitizenAuthToken({ citizenId: citizen.id, tenantId: citizen.tenantId });
    setCitizenAuthCookie(res, token);

    return ok(res, {
      citizen: {
        id: citizen.id,
        name: citizen.name,
        email: citizen.email,
        phone: citizen.phone
      },
      tenant: citizen.tenant
    });
  } catch (error) {
    return serverError(res, error);
  }
}
