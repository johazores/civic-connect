import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asOptionalString, asString, hasRequiredStrings } from '@/lib/request';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    if (req.method === 'GET') {
      return ok(res, auth.tenant);
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['name', 'cityName', 'tagline', 'description'])) {
        return badRequest(res, 'Name, city name, tagline, and description are required.');
      }

      const tenant = await prisma.tenant.update({
        where: { id: auth.tenant.id },
        data: {
          name: asString(body.name),
          cityName: asString(body.cityName),
          tagline: asString(body.tagline),
          description: asString(body.description),
          address: asOptionalString(body.address),
          email: asOptionalString(body.email),
          phone: asOptionalString(body.phone),
          primaryColor: asString(body.primaryColor, auth.tenant.primaryColor)
        }
      });

      return ok(res, tenant);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
