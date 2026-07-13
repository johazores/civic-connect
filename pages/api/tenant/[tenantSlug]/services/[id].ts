import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, notFound, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asBoolean, asNumber, asOptionalString, asString, hasRequiredStrings } from '@/lib/request';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    const existing = await prisma.service.findFirst({ where: { id, tenantId: auth.tenant.id } });

    if (!existing) {
      return notFound(res, 'Service not found.');
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['title', 'description'])) {
        return badRequest(res, 'Service title and description are required.');
      }

      const service = await prisma.service.update({
        where: { id },
        data: {
          title: asString(body.title),
          description: asString(body.description),
          department: asOptionalString(body.department),
          linkUrl: asOptionalString(body.linkUrl),
          sortOrder: asNumber(body.sortOrder, existing.sortOrder),
          paymentRequired: asBoolean(body.paymentRequired, existing.paymentRequired),
          serviceKind: ['STANDARD', 'DONATION', 'MEMBERSHIP', 'CAMPAIGN'].includes(String(body.serviceKind || ''))
            ? String(body.serviceKind)
            : existing.serviceKind,
          campaignGoalAmount:
            body.campaignGoalAmount != null
              ? asNumber(body.campaignGoalAmount, 0) > 0
                ? asNumber(body.campaignGoalAmount, 0).toFixed(7)
                : null
              : existing.campaignGoalAmount,
          feeAmount: asNumber(body.feeAmount, 0) > 0 ? asNumber(body.feeAmount, 0).toFixed(7) : null,
          feeAssetCode: asString(body.feeAssetCode, existing.feeAssetCode) || 'XLM',
          feeAssetIssuer: asOptionalString(body.feeAssetIssuer),
          receivingPublicKey: asOptionalString(body.receivingPublicKey),
          isActive: asBoolean(body.isActive, existing.isActive)
        }
      });

      return ok(res, service);
    }

    if (req.method === 'DELETE') {
      await prisma.service.update({ where: { id }, data: { isActive: false } });
      return ok(res, { success: true });
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
