import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { asBoolean, asNumber, asOptionalString } from '@/lib/request';
import { getTenantApprovalSettings, serializeApprovalPolicy, updateTenantApprovalSettings } from '@/services/approval-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    if (req.method === 'GET') {
      const policy = await getTenantApprovalSettings(tenantSlug);
      return ok(res, serializeApprovalPolicy(policy));
    }

    if (req.method === 'PATCH') {
      const body = req.body || {};
      const policy = await updateTenantApprovalSettings(tenantSlug, {
        enabled: asBoolean(body.enabled, false),
        signerCount: asNumber(body.signerCount, 10),
        requiredApprovals: asNumber(body.requiredApprovals, 6),
        note: asOptionalString(body.note)
      });

      return ok(res, serializeApprovalPolicy(policy));
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to manage approval policy.';
    return badRequest(res, message);
  }
}
