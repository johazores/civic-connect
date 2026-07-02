import type { NextApiRequest, NextApiResponse } from 'next';
import type { ReportPriority, ReportStatus } from '@/types/civic';
import { badRequest, methodNotAllowed, notFound, ok, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { asBoolean, asOptionalString, asString } from '@/lib/request';
import { findPublicReport, updateReportStatus } from '@/services/report-service';

const allowedStatuses = ['SUBMITTED', 'REVIEWING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
const allowedPriorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');
  const referenceCode = String(req.query.referenceCode || '').toUpperCase();

  try {
    if (req.method === 'GET') {
      const report = await findPublicReport(tenantSlug, referenceCode);

      if (!report) {
        return notFound(res, 'Report not found.');
      }

      return ok(res, report);
    }

    if (req.method === 'PATCH') {
      const auth = await requireTenantAdmin(req, tenantSlug);

      if (!auth) {
        return unauthorized(res);
      }

      const { status, message } = req.body || {};
      const priority = asString(req.body?.priority);
      const departmentId = asOptionalString(req.body?.departmentId);

      if (!allowedStatuses.includes(status)) {
        return badRequest(res, 'Invalid report status.');
      }

      if (!message || typeof message !== 'string') {
        return badRequest(res, 'Update message is required.');
      }

      if (priority && !allowedPriorities.includes(priority)) {
        return badRequest(res, 'Invalid report priority.');
      }

      const report = await updateReportStatus({
        tenantId: auth.tenant.id,
        referenceCode,
        status: status as ReportStatus,
        message: message.trim(),
        userId: auth.user.id,
        departmentId,
        priority: priority ? (priority as ReportPriority) : undefined,
        isPublic: asBoolean(req.body?.isPublic, true)
      });

      return ok(res, report);
    }

    return methodNotAllowed(res);
  } catch (error) {
    return serverError(res, error);
  }
}
