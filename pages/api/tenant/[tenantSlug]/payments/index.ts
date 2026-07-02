import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { getCitizenAuthUser, requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asOptionalString, asString, hasRequiredStrings } from '@/lib/request';
import { createPaymentIntent, getPaymentStats } from '@/services/payment-service';
import { getTenantBySlug } from '@/services/tenant-service';

function getAppUrl(req: NextApiRequest) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  return host ? `${protocol}://${host}` : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method === 'GET') {
      const auth = await requireTenantAdmin(req, tenantSlug);

      if (!auth) {
        return unauthorized(res);
      }

      const status = asString(req.query.status, 'ALL');
      const search = asString(req.query.search);
      const serviceId = asString(req.query.serviceId, 'ALL');

      const payments = await prisma.paymentIntent.findMany({
        where: {
          tenantId: auth.tenant.id,
          ...(status !== 'ALL' ? { status: status as any } : {}),
          ...(serviceId !== 'ALL' ? { serviceId } : {}),
          ...(search
            ? {
                OR: [
                  { referenceCode: { contains: search, mode: 'insensitive' } },
                  { payerName: { contains: search, mode: 'insensitive' } },
                  { payerEmail: { contains: search, mode: 'insensitive' } },
                  { transactionHash: { contains: search, mode: 'insensitive' } }
                ]
              }
            : {})
        },
        include: {
          service: { select: { id: true, title: true } },
          citizen: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 100
      });

      const [stats, services] = await Promise.all([
        getPaymentStats(auth.tenant.id),
        prisma.service.findMany({
          where: { tenantId: auth.tenant.id, paymentRequired: true },
          select: { id: true, title: true },
          orderBy: { title: 'asc' }
        })
      ]);

      return ok(res, { payments, stats, services });
    }

    if (req.method === 'POST') {
      const tenant = await getTenantBySlug(tenantSlug);

      if (!tenant) {
        return badRequest(res, 'Tenant not found.');
      }

      const body = req.body || {};

      if (!hasRequiredStrings(body, ['serviceId', 'payerName'])) {
        return badRequest(res, 'Service and payer name are required.');
      }

      const citizen = await getCitizenAuthUser(req);
      const tenantCitizenId = citizen && citizen.tenantId === tenant.id ? citizen.id : null;

      const intent = await createPaymentIntent({
        tenantSlug,
        serviceId: asString(body.serviceId),
        citizenId: tenantCitizenId,
        payerName: asString(body.payerName),
        payerEmail: asOptionalString(body.payerEmail),
        payerPhone: asOptionalString(body.payerPhone),
        appUrl: getAppUrl(req)
      });

      return created(res, intent);
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process payment request.';

    if (req.method === 'POST') {
      return badRequest(res, message);
    }

    return serverError(res, error);
  }
}
