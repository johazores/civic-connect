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

export type IncomeCertificateTotal = {
  assetCode: string;
  totalAmount: string;
};

export type IncomeCertificate = {
  tenantName: string;
  payerName: string;
  payerEmail: string | null;
  generatedAt: string;
  totalAmount: string;
  assetCode: string;
  totalsByAsset: IncomeCertificateTotal[];
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

  const totalsByAssetMap = new Map<string, number>();
  for (const payment of payments) {
    const code = payment.assetCode || 'XLM';
    totalsByAssetMap.set(code, (totalsByAssetMap.get(code) || 0) + Number(payment.amount || 0));
  }

  const totalsByAsset = Array.from(totalsByAssetMap.entries()).map(([assetCode, amount]) => ({
    assetCode,
    totalAmount: amount.toFixed(7)
  }));
  const primaryTotal = totalsByAsset[0];
  const payerName = input.payerName || payments[0]?.payerName || 'Contributor';
  const payerEmail = input.payerEmail || payments[0]?.payerEmail || null;

  return {
    tenantName: tenant.name,
    payerName,
    payerEmail,
    generatedAt: new Date().toISOString(),
    totalAmount: primaryTotal?.totalAmount || '0.0000000',
    assetCode: primaryTotal?.assetCode || 'XLM',
    totalsByAsset,
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
