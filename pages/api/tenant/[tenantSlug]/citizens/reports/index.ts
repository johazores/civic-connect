import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantCitizen } from '@/lib/auth';
import { prisma } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const auth = await requireTenantCitizen(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    const reports = await prisma.report.findMany({
      where: {
        tenantId: auth.tenant.id,
        citizenId: auth.citizen.id
      },
      include: {
        category: true,
        department: true,
        attachments: true,
        updates: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    const stats = {
      total: reports.length,
      active: reports.filter((report: { status: string }) => !['RESOLVED', 'REJECTED'].includes(report.status)).length,
      resolved: reports.filter((report: { status: string }) => report.status === 'RESOLVED').length
    };

    return ok(res, { citizen: auth.citizen, reports, stats });
  } catch (error) {
    return serverError(res, error);
  }
}
