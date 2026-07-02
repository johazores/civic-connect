import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { asString } from '@/lib/request';
import { listAdminReports } from '@/services/report-service';

function csvCell(value: unknown) {
  const clean = String(value ?? '').replace(/\r?\n|\r/g, ' ').trim();
  return `"${clean.replaceAll('"', '""')}"`;
}

function formatCsvDate(value: string | Date) {
  return new Date(value).toISOString();
}

type ExportReport = {
  referenceCode: string;
  title: string;
  status: string;
  priority: string;
  reporterName: string;
  reporterEmail: string | null;
  reporterPhone: string | null;
  locationText: string;
  submittedAt: string | Date;
  updatedAt: string | Date;
  description: string;
  category: { name: string };
  department: { name: string } | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res);
  }

  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    const reports = await listAdminReports(auth.tenant.id, {
      search: asString(req.query.search),
      status: asString(req.query.status, 'ALL'),
      categoryId: asString(req.query.categoryId, 'ALL'),
      departmentId: asString(req.query.departmentId, 'ALL'),
      priority: asString(req.query.priority, 'ALL')
    });

    const headers = [
      'Reference',
      'Title',
      'Status',
      'Priority',
      'Category',
      'Department',
      'Reporter Name',
      'Reporter Email',
      'Reporter Phone',
      'Location',
      'Submitted At',
      'Last Updated',
      'Description'
    ];

    const rows = (reports as ExportReport[]).map((report) => [
      report.referenceCode,
      report.title,
      report.status,
      report.priority,
      report.category.name,
      report.department?.name || 'Unassigned',
      report.reporterName,
      report.reporterEmail || '',
      report.reporterPhone || '',
      report.locationText,
      formatCsvDate(report.submittedAt),
      formatCsvDate(report.updatedAt),
      report.description
    ]);

    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const filename = `${auth.tenant.slug}-reports-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
  } catch (error) {
    return serverError(res, error);
  }
}
