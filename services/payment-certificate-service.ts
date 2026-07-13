import { prisma } from '@/lib/db';
import { getActiveTenant } from '@/lib/civic/shared';

export type IncomeCertificateEntry = {
  referenceCode: string;
  serviceTitle: string;
  amount: string;
  assetCode: string;
  transactionHash: string | null;
  verifiedAt: string | null;
};

export type IncomeCertificate = {
  tenantName: string;
  payerName: string;
  payerEmail: string | null;
  generatedAt: string;
  totalAmount: string;
  assetCode: string;
  paymentCount: number;
  entries: IncomeCertificateEntry[];
};

export async function buildIncomeCertificate(input: {
  tenantSlug: string;
  payerEmail?: string | null;
  citizenId?: string | null;
  payerName?: string | null;
}): Promise<IncomeCertificate | null> {
  const tenant = await getActiveTenant(input.tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const payments = await prisma.paymentIntent.findMany({
    where: {
      tenantId: tenant.id,
      status: 'VERIFIED',
      ...(input.citizenId ? { citizenId: input.citizenId } : {}),
      ...(input.payerEmail ? { payerEmail: input.payerEmail.trim().toLowerCase() } : {})
    },
    include: { service: { select: { title: true } } },
    orderBy: { verifiedAt: 'desc' }
  });

  if (payments.length === 0) {
    return null;
  }

  const assetCode = payments[0]?.assetCode || 'XLM';
  const total = payments.reduce((sum: number, payment: { amount: unknown }) => sum + Number(payment.amount || 0), 0);
  const payerName = input.payerName || payments[0]?.payerName || 'Contributor';
  const payerEmail = input.payerEmail || payments[0]?.payerEmail || null;

  return {
    tenantName: tenant.name,
    payerName,
    payerEmail,
    generatedAt: new Date().toISOString(),
    totalAmount: total.toFixed(7),
    assetCode,
    paymentCount: payments.length,
    entries: payments.map((payment: {
      referenceCode: string;
      service: { title: string };
      amount: unknown;
      assetCode: string;
      transactionHash: string | null;
      verifiedAt: Date | null;
    }) => ({
      referenceCode: payment.referenceCode,
      serviceTitle: payment.service.title,
      amount: String(payment.amount),
      assetCode: payment.assetCode,
      transactionHash: payment.transactionHash,
      verifiedAt: payment.verifiedAt?.toISOString() || null
    }))
  };
}
