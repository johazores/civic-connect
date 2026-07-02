import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { updatePropertyTaxReceipt, voidPropertyTaxReceipt } from '@/services/civic-stellar-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    if (req.method === 'PATCH') {
      const receipt = await updatePropertyTaxReceipt(tenantSlug, id, req.body || {});
      return ok(res, serializeReceipt(receipt));
    }

    if (req.method === 'DELETE') {
      const receipt = await voidPropertyTaxReceipt(tenantSlug, id);
      return ok(res, serializeReceipt(receipt));
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update tax receipt.';
    return badRequest(res, message);
  }
}

function serializeReceipt(receipt: any) {
  return {
    ...receipt,
    amount: receipt.amount ? String(receipt.amount) : '0',
    issuedAt: receipt.issuedAt?.toISOString?.() || receipt.issuedAt,
    createdAt: receipt.createdAt?.toISOString?.() || receipt.createdAt,
    updatedAt: receipt.updatedAt?.toISOString?.() || receipt.updatedAt
  };
}
