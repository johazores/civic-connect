import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { ClaimableRewardGuide } from '@/components/public/claimable-reward-guide';
import { prisma } from '@/lib/db';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function ClaimRewardPage({ params }: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const action = await prisma.civicAction.findFirst({
    where: { id, tenantId: tenant.id },
    select: {
      id: true,
      title: true,
      participantName: true,
      status: true,
      payoutMethod: true,
      rewardClaimableBalanceId: true
    }
  });

  if (!action || action.status !== 'REWARDED') {
    notFound();
  }

  return (
    <PublicShell tenant={tenant} flow title="Claim reward" subtitle={action.title} backHref={`/${tenant.slug}/civic-actions`}>
      <main className="page-section pb-6">
        <ClaimableRewardGuide
          tenantSlug={tenant.slug}
          actionId={action.id}
          participantName={action.participantName}
          title={action.title}
          stellarNetwork={tenant.stellarNetwork}
        />
      </main>
    </PublicShell>
  );
}
