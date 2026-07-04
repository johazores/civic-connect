import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { payCivicActionReward, reviewCivicAction } from '@/services/civic-stellar-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    if (req.method === 'PATCH') {
      const action = await reviewCivicAction(tenantSlug, id, req.body || {});
      return ok(res, serializeAction(action));
    }

    if (req.method === 'POST') {
      const action = await payCivicActionReward(tenantSlug, id, auth.user.id);
      return ok(res, serializeAction(action));
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update civic action.';
    return req.method === 'POST' || req.method === 'PATCH' ? badRequest(res, message) : serverError(res, error);
  }
}

function serializeAction(action: any) {
  return {
    ...action,
    rewardAmount: action.rewardAmount ? String(action.rewardAmount) : '0',
    createdAt: action.createdAt?.toISOString?.() || action.createdAt,
    updatedAt: action.updatedAt?.toISOString?.() || action.updatedAt,
    reviewedAt: action.reviewedAt?.toISOString?.() || action.reviewedAt,
    rewardPaidAt: action.rewardPaidAt?.toISOString?.() || action.rewardPaidAt
  };
}
