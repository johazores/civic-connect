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

      const services = await prisma.service.findMany({
        where: { tenantId: tenant.id, ...(includeInactive ? {} : { isActive: true }) },
        orderBy: [{ isActive: 'desc' }, { sortOrder: 'asc' }, { title: 'asc' }]
      });

      return ok(res, services);
    }

    if (req.method === 'POST') {
      const auth = await requireTenantAdmin(req, tenantSlug);

      if (!auth) {
        return unauthorized(res);
      }

      const body = req.body || {};

      if (!hasRequiredStrings(body, ['title', 'description'])) {
        return badRequest(res, 'Service title and description are required.');
      }

      const service = await prisma.service.create({
        data: {
          tenantId: auth.tenant.id,
          title: asString(body.title),
          description: asString(body.description),
          department: asOptionalString(body.department),
          linkUrl: asOptionalString(body.linkUrl),
          sortOrder: asNumber(body.sortOrder, 0),
          isActive: asBoolean(body.isActive, true)
        }
      });

      return created(res, service);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
