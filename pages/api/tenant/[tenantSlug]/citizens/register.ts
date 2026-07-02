import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { badRequest, created, methodNotAllowed, serverError } from '@/lib/api-response';
import { setCitizenAuthCookie, signCitizenAuthToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asOptionalString, asString, hasRequiredStrings } from '@/lib/request';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res);
  }

  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const body = req.body || {};

    if (!hasRequiredStrings(body, ['name', 'email', 'password'])) {
      return badRequest(res, 'Name, email, and password are required.');
    }

    const email = normalizeEmail(asString(body.email));
    const password = asString(body.password);

    if (!email.includes('@')) {
      return badRequest(res, 'Please enter a valid email address.');
    }

    if (password.length < 8) {
      return badRequest(res, 'Password must be at least 8 characters.');
    }

    const tenant = await prisma.tenant.findFirst({
      where: { slug: tenantSlug, isActive: true },
      select: { id: true, slug: true, name: true }
    });

    if (!tenant) {
      return badRequest(res, 'Tenant not found.');
    }

    const existing = await prisma.citizen.findFirst({
      where: { tenantId: tenant.id, email }
    });

    if (existing) {
      return badRequest(res, 'An account already exists with this email.');
    }

    const citizen = await prisma.citizen.create({
      data: {
        tenantId: tenant.id,
        name: asString(body.name).trim(),
        email,
        phone: asOptionalString(body.phone) || null,
        passwordHash: await bcrypt.hash(password, 10)
      },
      select: {
        id: true,
        tenantId: true,
        name: true,
        email: true,
        phone: true
      }
    });

    const token = signCitizenAuthToken({ citizenId: citizen.id, tenantId: citizen.tenantId });
    setCitizenAuthCookie(res, token);

    return created(res, { citizen, tenant });
  } catch (error) {
    return serverError(res, error);
  }
}
