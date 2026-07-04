import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { archiveTransparencyEntry, publishTransparencyDisbursement, updateTransparencyEntry } from '@/services/civic-stellar-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const id = String(req.query.id || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    if (req.method === 'PATCH') {
      const entry = await updateTransparencyEntry(tenantSlug, id, req.body || {});
      return ok(res, serializeEntry(entry));
    }

    if (req.method === 'POST') {
      const entry = await publishTransparencyDisbursement(tenantSlug, id, auth.user.id);
      return ok(res, serializeEntry(entry));
    }

    if (req.method === 'DELETE') {
      const entry = await archiveTransparencyEntry(tenantSlug, id);
      return ok(res, serializeEntry(entry));
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update transparency entry.';
    return badRequest(res, message);
  }
}

function serializeEntry(entry: any) {
  return {
    ...entry,
    amount: entry.amount ? String(entry.amount) : '0',
    occurredAt: entry.occurredAt?.toISOString?.() || entry.occurredAt,
    createdAt: entry.createdAt?.toISOString?.() || entry.createdAt,
    updatedAt: entry.updatedAt?.toISOString?.() || entry.updatedAt
  };
}
