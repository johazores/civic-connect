import type { NextApiRequest, NextApiResponse } from 'next';
import { badRequest, created, methodNotAllowed, ok, serverError, unauthorized } from '@/lib/api-response';
import { getCitizenAuthUser, requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asOptionalString, asString, hasRequiredStrings } from '@/lib/request';
import { createReport, getReportStats, listAdminReports } from '@/services/report-service';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '6mb'
    }
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method === 'GET') {
      const auth = await requireTenantAdmin(req, tenantSlug);

      if (!auth) {
        return unauthorized(res);
      }

      const [reports, stats, categories, departments] = await Promise.all([
        listAdminReports(auth.tenant.id, {
          search: asString(req.query.search),
          status: asString(req.query.status, 'ALL'),
          categoryId: asString(req.query.categoryId, 'ALL'),
          departmentId: asString(req.query.departmentId, 'ALL'),
          priority: asString(req.query.priority, 'ALL')
        }),
        getReportStats(auth.tenant.id),
        prisma.reportCategory.findMany({
          where: { tenantId: auth.tenant.id },
          orderBy: [{ isActive: 'desc' }, { name: 'asc' }]
        }),
        prisma.department.findMany({
          where: { tenantId: auth.tenant.id },
          orderBy: [{ isActive: 'desc' }, { name: 'asc' }]
        })
      ]);

      return ok(res, { reports, stats, categories, departments, tenant: auth.tenant });
    }

    if (req.method === 'POST') {
      const body = req.body || {};

      if (!hasRequiredStrings(body, ['categoryId', 'reporterName', 'title', 'description', 'locationText'])) {
        return badRequest(res, 'Category, name, title, description, and location are required.');
      }

      const citizen = await getCitizenAuthUser(req);
      const tenantCitizen = citizen
        ? await prisma.citizen.findFirst({
            where: {
              id: citizen.id,
              tenant: { slug: tenantSlug, isActive: true },
              isActive: true
            }
          })
        : null;

      const report = await createReport(tenantSlug, {
        categoryId: asString(body.categoryId),
        reporterName: asString(body.reporterName),
        reporterEmail: asOptionalString(body.reporterEmail) || undefined,
        reporterPhone: asOptionalString(body.reporterPhone) || undefined,
        title: asString(body.title),
        description: asString(body.description),
        locationText: asString(body.locationText),
        imageUrl: asOptionalString(body.imageUrl) || undefined,
        citizenId: tenantCitizen?.id
      });

      return created(res, report);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
