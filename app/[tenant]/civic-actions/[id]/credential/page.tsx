import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { VolunteerCredential } from '@/components/public/volunteer-credential';
import { prisma } from '@/lib/db';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function VolunteerCredentialPage({ params }: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const action = await prisma.civicAction.findFirst({
    where: { id, tenantId: tenant.id, status: { in: ['APPROVED', 'REWARDED'] } }
  });

  if (!action) {
    notFound();
  }

  return (
    <PublicShell tenant={tenant} flow title="Activity credential" subtitle={action.title} backHref={`/${tenant.slug}/civic-actions`}>
      <main className="page-section pb-6">
        <VolunteerCredential
          tenantSlug={tenant.slug}
          credential={{
            id: action.id,
            type: action.type,
            title: action.title,
            description: action.description,
            locationText: action.locationText,
            participantName: action.participantName,
            participantEmail: action.participantEmail,
            status: action.status,
            rewardAmount: String(action.rewardAmount),
            rewardAssetCode: action.rewardAssetCode,
            rewardMemo: action.rewardMemo,
            rewardTransactionHash: action.rewardTransactionHash,
            rewardLedger: action.rewardLedger,
            rewardPaidAt: action.rewardPaidAt?.toISOString() || null,
            beneficiaryConfirmedAt: action.beneficiaryConfirmedAt?.toISOString() || null,
            proofDigest: action.proofDigest,
            reviewedAt: action.reviewedAt?.toISOString() || null,
            tenantName: tenant.name
          }}
        />
      </main>
    </PublicShell>
  );
}
