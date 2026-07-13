import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, notFound, ok, serverError } from '@/lib/api-response';
import { listCampaignStats } from '@/services/campaign-service';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method !== 'GET') {
      return methodNotAllowed(res);
    }

    const tenant = await getTenantBySlug(tenantSlug);

    if (!tenant) {
      return notFound(res, 'Tenant not found.');
    }

    const campaigns = await listCampaignStats(tenantSlug);
    return ok(res, campaigns);
  } catch (error) {
    return serverError(res, error);
  }
}
