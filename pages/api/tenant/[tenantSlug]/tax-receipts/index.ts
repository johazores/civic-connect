import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { createPropertyTaxReceipt, listPropertyTaxReceipts } from '@/services/tax-receipts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method === 'GET') {
      const admin = await requireTenantAdmin(req, tenantSlug);
      const receipts = await listPropertyTaxReceipts(tenantSlug, {
        search: String(req.query.search || ''),
        includeVoided: Boolean(admin && req.query.includeVoided === 'true')
      });
      return ok(res, receipts.map(serializeReceipt));
    }

    if (req.method === 'POST') {
      const auth = await requireTenantAdmin(req, tenantSlug);

      if (!auth) {
        return unauthorized(res);
      }

      const receipt = await createPropertyTaxReceipt(tenantSlug, req.body || {});
      return created(res, serializeReceipt(receipt));
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process tax receipt.';
    return req.method === 'POST' ? badRequest(res, message) : serverError(res, error);
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
