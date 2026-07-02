import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asBoolean, asOptionalString, asString, hasRequiredStrings } from '@/lib/request';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    if (req.method === 'GET') {
      const departments = await prisma.department.findMany({
        where: { tenantId: auth.tenant.id },
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }]
      });

      return ok(res, departments);
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['name'])) {
        return badRequest(res, 'Department name is required.');
      }

      const department = await prisma.department.create({
        data: {
          tenantId: auth.tenant.id,
          name: asString(body.name),
          email: asOptionalString(body.email),
          phone: asOptionalString(body.phone),
          isActive: asBoolean(body.isActive, true)
        }
      });

      return created(res, department);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
