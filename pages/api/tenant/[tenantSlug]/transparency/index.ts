import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { createTransparencyEntry, listTransparencyEntries } from '@/services/civic-stellar-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method === 'GET') {
      const admin = await requireTenantAdmin(req, tenantSlug);
      const includeDrafts = Boolean(admin && req.query.includeDrafts === 'true');
      const entries = await listTransparencyEntries(tenantSlug, includeDrafts, admin?.user.id || null);
      return ok(res, entries.map(serializeEntry));
    }

    if (req.method === 'POST') {
      const auth = await requireTenantAdmin(req, tenantSlug);

      if (!auth) {
        return unauthorized(res);
      }

      const entry = await createTransparencyEntry(tenantSlug, req.body || {});
      return created(res, serializeEntry(entry));
    }

    return methodNotAllowed(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process transparency entry.';
    return req.method === 'POST' ? badRequest(res, message) : serverError(res, error);
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
