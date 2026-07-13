import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, notFound, ok, serverError } from '@/lib/api-response';
import { getCampaignStatsForService } from '@/services/campaign-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    if (req.method !== 'GET') {
      return methodNotAllowed(res);
    }

    const stats = await getCampaignStatsForService(tenantSlug, id);

    if (!stats) {
      return notFound(res, 'Campaign not found.');
    }

    return ok(res, stats);
  } catch (error) {
    return serverError(res, error);
  }
}
