import type { NextApiRequest, NextApiResponse } from 'next';
import { methodNotAllowed, serverError, unauthorized } from '@/lib/api-response';
import { requireTenantAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { asString } from '@/lib/request';

function csvCell(value: unknown) {
  const clean = String(value ?? '').replaceAll('"', '""');
  return `"${clean}"`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantSlug = String(req.query.tenantSlug || '');

  try {
    if (req.method !== 'GET') {
      return methodNotAllowed(res);
    }

    const auth = await requireTenantAdmin(req, tenantSlug);

    if (!auth) {
      return unauthorized(res);
    }

    const status = asString(req.query.status, 'ALL');
    const payments = await prisma.paymentIntent.findMany({
      where: {
        tenantId: auth.tenant.id,
        ...(status !== 'ALL' ? { status: status as any } : {})
      },
      include: { service: true },
      orderBy: { createdAt: 'desc' }
    });

    const header = ['Reference', 'Service', 'Payer', 'Email', 'Amount', 'Asset', 'Status', 'Transaction Hash', 'Ledger', 'Created At', 'Verified At'];
    const rows = payments.map((payment: any) => [
      payment.referenceCode,
      payment.service.title,
      payment.payerName,
      payment.payerEmail || '',
      String(payment.amount),
      payment.assetCode,
      payment.status,
      payment.transactionHash || '',
      payment.ledger || '',
      payment.createdAt.toISOString(),
      payment.verifiedAt?.toISOString() || ''
    ]);

    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${tenantSlug}-stellar-payments.csv"`);
    return res.status(200).send(csv);
  } catch (error) {
    return serverError(res, error);
  }
}
