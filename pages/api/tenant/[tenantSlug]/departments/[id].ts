import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, notFound, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asBoolean, asOptionalString, asString, hasRequiredStrings } from '@/lib/request';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    const existing = await prisma.department.findFirst({
      where: { id, tenantId: auth.tenant.id }
    });

    if (!existing) {
      return notFound(res, 'Department not found.');
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['name'])) {
        return badRequest(res, 'Department name is required.');
      }

      const department = await prisma.department.update({
        where: { id },
        data: {
          name: asString(body.name),
          email: asOptionalString(body.email),
          phone: asOptionalString(body.phone),
          isActive: asBoolean(body.isActive, existing.isActive)
        }
      });

      return ok(res, department);
    }

    if (req.method === 'DELETE') {
      await prisma.department.update({
        where: { id },
        data: { isActive: false }
      });

      return ok(res, { success: true });
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
