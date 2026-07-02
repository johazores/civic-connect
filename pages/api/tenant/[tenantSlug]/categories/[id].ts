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

    const existing = await prisma.reportCategory.findFirst({
      where: { id, tenantId: auth.tenant.id }
    });

    if (!existing) {
      return notFound(res, 'Category not found.');
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['name'])) {
        return badRequest(res, 'Category name is required.');
      }

      const category = await prisma.reportCategory.update({
        where: { id },
        data: {
          name: asString(body.name),
          description: asOptionalString(body.description),
          isActive: asBoolean(body.isActive, existing.isActive)
        }
      });

      return ok(res, category);
    }

    if (req.method === 'DELETE') {
      await prisma.reportCategory.update({
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
