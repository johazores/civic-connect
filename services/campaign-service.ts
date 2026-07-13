import { prisma } from '@/lib/db';
import { getActiveTenant } from '@/lib/civic/shared';

export type CampaignStats = {
  serviceId: string;
  title: string;
  serviceKind: string;
  goalAmount: string | null;
  raisedAmount: string;
  contributorCount: number;
  assetCode: string;
  progressPercent: number | null;
};

export async function getCampaignStatsForService(tenantSlug: string, serviceId: string): Promise<CampaignStats | null> {
  const tenant = await getActiveTenant(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const service = await prisma.service.findFirst({
    where: { id: serviceId, tenantId: tenant.id, isActive: true }
  });

  if (!service || service.serviceKind !== 'CAMPAIGN') {
    return null;
  }

  const payments = await prisma.paymentIntent.findMany({
    where: {
      tenantId: tenant.id,
      serviceId: service.id,
      status: 'VERIFIED'
    },
    select: { amount: true, payerEmail: true, payerName: true }
  });

  const raised = payments.reduce((sum: number, payment: { amount: unknown }) => sum + Number(payment.amount || 0), 0);
  const uniqueContributors = new Set(
    payments.map((payment: { payerEmail: string | null; payerName: string }) => (payment.payerEmail || payment.payerName || '').trim().toLowerCase()).filter(Boolean)
  ).size;
  const goal = service.campaignGoalAmount ? Number(service.campaignGoalAmount) : null;
  const assetCode = service.feeAssetCode || 'XLM';

  return {
    serviceId: service.id,
    title: service.title,
    serviceKind: service.serviceKind,
    goalAmount: goal != null ? goal.toFixed(7) : null,
    raisedAmount: raised.toFixed(7),
    contributorCount: uniqueContributors || payments.length,
    assetCode,
    progressPercent: goal && goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : null
  };
}

export async function listCampaignStats(tenantSlug: string): Promise<CampaignStats[]> {
  const tenant = await getActiveTenant(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const campaigns = await prisma.service.findMany({
    where: { tenantId: tenant.id, isActive: true, serviceKind: 'CAMPAIGN' },
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }]
  });

  const stats = await Promise.all(campaigns.map((service: { id: string }) => getCampaignStatsForService(tenantSlug, service.id)));
  return stats.filter((item): item is CampaignStats => item != null);
}
