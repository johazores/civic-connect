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
      const categories = await prisma.reportCategory.findMany({
        where: { tenantId: auth.tenant.id },
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }]
      });

      return ok(res, categories);
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['name'])) {
        return badRequest(res, 'Category name is required.');
      }

      const category = await prisma.reportCategory.create({
        data: {
          tenantId: auth.tenant.id,
          name: asString(body.name),
          description: asOptionalString(body.description),
          isActive: asBoolean(body.isActive, true)
        }
      });

      return created(res, category);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
