import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, notFound, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asBoolean, asNumber, asOptionalString, asString, hasRequiredStrings } from '@/lib/request';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method === 'GET') {
      const tenant = await getTenantBySlug(tenantSlug);

      if (!tenant) {
        return notFound(res, 'Tenant not found.');
      }

      const includeInactive = req.query.includeInactive === 'true';
      const auth = includeInactive ? await requireTenantAdmin(req, tenantSlug) : null;

      if (includeInactive && !auth) {
        return unauthorized(res);
      }

      const hotlines = await prisma.hotline.findMany({
        where: { tenantId: tenant.id, ...(includeInactive ? {} : { isActive: true }) },
        orderBy: [{ isEmergency: 'desc' }, { isActive: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }]
      });

      return ok(res, hotlines);
    }

    if (req.method === 'POST') {
      const auth = await requireTenantAdmin(req, tenantSlug);

      if (!auth) {
        return unauthorized(res);
      }

      const body = req.body || {};

      if (!hasRequiredStrings(body, ['name', 'phone'])) {
        return badRequest(res, 'Hotline name and phone are required.');
      }

      const hotline = await prisma.hotline.create({
        data: {
          tenantId: auth.tenant.id,
          name: asString(body.name),
          description: asOptionalString(body.description),
          phone: asString(body.phone),
          isEmergency: asBoolean(body.isEmergency, false),
          isActive: asBoolean(body.isActive, true),
          sortOrder: asNumber(body.sortOrder, 0)
        }
      });

      return created(res, hotline);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
