import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { ServicesGrid } from '@/components/public/services-grid';
import { prisma } from '@/lib/db';
import { listCampaignStats } from '@/services/campaign-service';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function ServicesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const [services, campaigns] = await Promise.all([
    prisma.service.findMany({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }]
    }),
    listCampaignStats(tenantSlug).catch(() => [])
  ]);

  const campaignMap = new Map(campaigns.map((campaign) => [campaign.serviceId, campaign]));

  return (
    <PublicShell
      tenant={tenant}
      title="Services"
      subtitle="Payments, donations, memberships, and programs"
      backHref={`/${tenant.slug}`}
    >
      <main className="page-section">
        <ServicesGrid
          services={services.map((service: any) => {
            const campaign = campaignMap.get(service.id);
            return {
              ...service,
              feeAmount: service.feeAmount ? String(service.feeAmount) : null,
              campaignGoalAmount: service.campaignGoalAmount ? String(service.campaignGoalAmount) : null,
              campaignRaisedAmount: campaign?.raisedAmount || null,
              campaignProgressPercent: campaign?.progressPercent ?? null,
              campaignContributorCount: campaign?.contributorCount || 0
            };
          })}
          tenantSlug={tenant.slug}
        />
      </main>
    </PublicShell>
  );
}
