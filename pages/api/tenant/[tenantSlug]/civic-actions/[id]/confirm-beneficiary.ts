import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { confirmCivicActionBeneficiary } from '@/services/civic-actions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    if (req.method !== 'POST') {
      return methodNotAllowed(res);
    }

    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    const action = await confirmCivicActionBeneficiary(tenantSlug, id);
    return ok(res, {
      ...action,
      rewardAmount: action.rewardAmount ? String(action.rewardAmount) : '0',
      beneficiaryConfirmedAt: action.beneficiaryConfirmedAt?.toISOString() || null
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to confirm beneficiary.';
    return badRequest(res, message);
  }
}
