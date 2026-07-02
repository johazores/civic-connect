import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { badRequest, created, forbidden, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asBoolean, asString, hasRequiredStrings } from '@/lib/request';

const roles = ['ADMIN', 'STAFF'];

function isAdmin(role?: string) {
  return role === 'ADMIN';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    if (!isAdmin(auth.user.role)) {
      return forbidden(res, 'Only admins can manage staff users.');
    }

    if (req.method === 'GET') {
      const users = await prisma.user.findMany({
        where: { tenantId: auth.tenant.id },
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return ok(res, users);
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['name', 'email', 'password'])) {
        return badRequest(res, 'Name, email, and password are required.');
      }

      const role = asString(body.role, 'STAFF').toUpperCase();

      if (!roles.includes(role)) {
        return badRequest(res, 'Invalid user role.');
      }

      const password = asString(body.password);

      if (password.length < 8) {
        return badRequest(res, 'Password must be at least 8 characters.');
      }

      const user = await prisma.user.create({
        data: {
          tenantId: auth.tenant.id,
          name: asString(body.name),
          email: asString(body.email).toLowerCase(),
          passwordHash: await bcrypt.hash(password, 10),
          role: role as 'ADMIN' | 'STAFF',
          isActive: asBoolean(body.isActive, true)
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return created(res, user);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
