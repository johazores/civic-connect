import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { badRequest, forbidden, methodNotAllowed, notFound, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asBoolean, asOptionalString, asString, hasRequiredStrings } from '@/lib/request';

const roles = ['ADMIN', 'STAFF'];

function isAdmin(role?: string) {
  return role === 'ADMIN';
}

async function isLastActiveAdmin(tenantId: string, userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });

  if (!user || user.role !== 'ADMIN' || !user.isActive) {
    return false;
  }

  const adminCount = await prisma.user.count({
    where: {
      tenantId,
      role: 'ADMIN',
      isActive: true
    }
  });

  return adminCount <= 1;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    if (!isAdmin(auth.user.role)) {
      return forbidden(res, 'Only admins can manage staff users.');
    }

    const existing = await prisma.user.findFirst({ where: { id, tenantId: auth.tenant.id } });

    if (!existing) {
      return notFound(res, 'User not found.');
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['name', 'email'])) {
        return badRequest(res, 'Name and email are required.');
      }

      const role = asString(body.role, existing.role).toUpperCase();

      if (!roles.includes(role)) {
        return badRequest(res, 'Invalid user role.');
      }

      const nextIsActive = asBoolean(body.isActive, existing.isActive);

      if ((role !== 'ADMIN' || !nextIsActive) && (await isLastActiveAdmin(auth.tenant.id, id))) {
        return badRequest(res, 'At least one active admin is required.');
      }

      const password = asOptionalString(body.password);

      if (password && password.length < 8) {
        return badRequest(res, 'Password must be at least 8 characters.');
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          name: asString(body.name),
          email: asString(body.email).toLowerCase(),
          role: role as 'ADMIN' | 'STAFF',
          isActive: nextIsActive,
          ...(password ? { passwordHash: await bcrypt.hash(password, 10) } : {})
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

      return ok(res, user);
    }

    if (req.method === 'DELETE') {
      if (auth.user.id === id) {
        return badRequest(res, 'You cannot archive your own account while logged in.');
      }

      if (await isLastActiveAdmin(auth.tenant.id, id)) {
        return badRequest(res, 'At least one active admin is required.');
      }

      await prisma.user.update({ where: { id }, data: { isActive: false } });
      return ok(res, { success: true });
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
