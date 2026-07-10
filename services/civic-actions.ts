import { prisma } from '@/lib/db';
import { safeTenantSelect } from '@/lib/auth';
import { approveRelease, getApprovalSummary } from '@/services/approval-service';
import {
  asDecimalString,
  civicActionProofDigest,
  createUniqueCivicReference,
  getActiveTenant,
  getTenantNetworkConfig,
  getTenantPayoutSecret
} from '@/lib/civic/shared';
import {
  isValidStellarPublicKey,
  submitClaimableBalanceReward,
  submitSignedStellarPayment
} from '@/lib/stellar/index';

export type CivicActionInput = {
  tenantSlug: string;
  citizenId?: string | null;
  type?: 'PARTICIPATION' | 'CLEANUP';
  title: string;
  description: string;
  locationText: string;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string | null;
  participantName: string;
  participantEmail?: string | null;
  participantPhone?: string | null;
  rewardDestinationPublicKey?: string | null;
};

const civicActionInclude = {
  tenant: { select: safeTenantSelect },
  citizen: { select: { id: true, name: true, email: true, phone: true } }
};

async function attachActionApprovalSummary<T extends { id: string; tenantId: string }>(action: T, userId?: string | null) {
  if (!userId) {
    return action;
  }

  const approvalSummary = await getApprovalSummary({
    tenantId: action.tenantId,
    targetType: 'CIVIC_REWARD',
    targetId: action.id,
    userId
  });

  return { ...action, approvalSummary };
}

export async function createCivicAction(input: CivicActionInput) {
  const tenant = await getActiveTenant(input.tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  if (!input.title?.trim() || !input.description?.trim() || !input.locationText?.trim() || !input.participantName?.trim()) {
    throw new Error('Title, description, location, and participant name are required.');
  }

  if (input.rewardDestinationPublicKey && !isValidStellarPublicKey(input.rewardDestinationPublicKey)) {
    throw new Error('Reward wallet must be a valid Stellar public key that starts with G.');
  }

  const memo = await createUniqueCivicReference(input.type === 'CLEANUP' ? 'CLN' : 'ACT');

  return prisma.civicAction.create({
    data: {
      tenantId: tenant.id,
      citizenId: input.citizenId || null,
      type: input.type === 'CLEANUP' ? 'CLEANUP' : 'PARTICIPATION',
      title: input.title.trim(),
      description: input.description.trim(),
      locationText: input.locationText.trim(),
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      photoUrl: input.photoUrl?.trim() || null,
      participantName: input.participantName.trim(),
      participantEmail: input.participantEmail?.trim() || null,
      participantPhone: input.participantPhone?.trim() || null,
      rewardDestinationPublicKey: input.rewardDestinationPublicKey?.trim() || null,
      rewardMemo: memo,
      rewardAmount: input.type === 'CLEANUP' ? '2.0000000' : '1.0000000',
      rewardAssetCode: tenant.stellarDefaultAssetCode || 'XLM',
      rewardAssetIssuer: tenant.stellarDefaultAssetIssuer || null
    },
    include: civicActionInclude
  });
}

export async function listCivicActions(tenantSlug: string, filters?: { status?: string; type?: string; mineCitizenId?: string | null; userId?: string | null }) {
  const tenant = await getActiveTenant(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const actions = await prisma.civicAction.findMany({
    where: {
      tenantId: tenant.id,
      ...(filters?.status && filters.status !== 'ALL' ? { status: filters.status as any } : {}),
      ...(filters?.type && filters.type !== 'ALL' ? { type: filters.type as any } : {}),
      ...(filters?.mineCitizenId ? { citizenId: filters.mineCitizenId } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: civicActionInclude
  });

  return Promise.all(actions.map((action: any) => attachActionApprovalSummary(action, filters?.userId || null)));
}

export async function reviewCivicAction(tenantSlug: string, id: string, input: { status?: string; verificationNote?: string | null; rewardAmount?: string | number | null; rewardAssetCode?: string | null; rewardAssetIssuer?: string | null; rewardDestinationPublicKey?: string | null }) {
  const tenant = await getActiveTenant(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const current = await prisma.civicAction.findFirst({ where: { id, tenantId: tenant.id } });

  if (!current) {
    throw new Error('Civic action not found.');
  }

  if (input.rewardDestinationPublicKey && !isValidStellarPublicKey(input.rewardDestinationPublicKey)) {
    throw new Error('Reward destination must be a valid Stellar public key.');
  }

  const status = ['SUBMITTED', 'REVIEWING', 'APPROVED', 'REJECTED', 'REWARDED'].includes(String(input.status || '')) ? String(input.status) : current.status;
  const payoutMethod = ['DIRECT', 'CLAIMABLE'].includes(String((input as any).payoutMethod || '')) ? String((input as any).payoutMethod) : current.payoutMethod;
  const nextRewardAmount = input.rewardAmount != null ? asDecimalString(input.rewardAmount) : current.rewardAmount;
  const nextRewardAssetCode = input.rewardAssetCode?.trim() || current.rewardAssetCode;
  const nextRewardAssetIssuer = input.rewardAssetIssuer?.trim() || null;
  const nextRewardDestinationPublicKey = input.rewardDestinationPublicKey?.trim() || current.rewardDestinationPublicKey;
  const approvalSensitiveChange = [
    status !== current.status,
    payoutMethod !== current.payoutMethod,
    String(nextRewardAmount) !== String(current.rewardAmount),
    nextRewardAssetCode !== current.rewardAssetCode,
    nextRewardAssetIssuer !== current.rewardAssetIssuer,
    nextRewardDestinationPublicKey !== current.rewardDestinationPublicKey,
    (input.verificationNote ?? current.verificationNote) !== current.verificationNote
  ].some(Boolean);

  if (approvalSensitiveChange && !current.rewardTransactionHash) {
    await prisma.civicTransactionApproval.deleteMany({
      where: {
        tenantId: tenant.id,
        targetType: 'CIVIC_REWARD',
        targetId: current.id
      }
    });
  }

  return prisma.civicAction.update({
    where: { id: current.id },
    data: {
      status: status as any,
      payoutMethod: payoutMethod as any,
      verificationNote: input.verificationNote ?? current.verificationNote,
      rewardAmount: nextRewardAmount,
      rewardAssetCode: nextRewardAssetCode,
      rewardAssetIssuer: nextRewardAssetIssuer,
      rewardDestinationPublicKey: nextRewardDestinationPublicKey,
      reviewedAt: ['APPROVED', 'REJECTED'].includes(status) ? new Date() : current.reviewedAt
    },
    include: civicActionInclude
  });
}

export async function payCivicActionReward(tenantSlug: string, id: string, userId?: string | null) {
  const tenant = await getActiveTenant(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const action = await prisma.civicAction.findFirst({ where: { id, tenantId: tenant.id }, include: civicActionInclude });

  if (!action) {
    throw new Error('Civic action not found.');
  }

  if (action.status !== 'APPROVED') {
    throw new Error('Only approved civic actions can be rewarded.');
  }

  if (action.rewardTransactionHash) {
    throw new Error('This civic action already has a Stellar reward transaction.');
  }

  if (!action.rewardDestinationPublicKey || !isValidStellarPublicKey(action.rewardDestinationPublicKey)) {
    throw new Error('A valid participant Stellar reward wallet is required before payout.');
  }

  if (userId) {
    const approvalSummary = await approveRelease({
      tenantId: tenant.id,
      targetType: 'CIVIC_REWARD',
      targetId: action.id,
      userId
    });

    if (approvalSummary.enabled && approvalSummary.remainingApprovals > 0) {
      return { ...action, approvalSummary };
    }
  }

  const config = getTenantNetworkConfig(tenant);
  const secret = getTenantPayoutSecret(tenant);
  const memo = action.rewardMemo || (await createUniqueCivicReference('RWD'));
  const proofDigest = civicActionProofDigest(action);

  const paymentInput = {
    sourceSecretKey: secret,
    destinationPublicKey: action.rewardDestinationPublicKey,
    amount: String(action.rewardAmount),
    assetCode: action.rewardAssetCode,
    assetIssuer: action.rewardAssetIssuer,
    memo,
    memoHashHex: proofDigest,
    horizonUrl: config.horizonUrl,
    networkPassphrase: config.networkPassphrase
  };

  if (action.payoutMethod === 'CLAIMABLE') {
    const claimable = await submitClaimableBalanceReward(paymentInput);

    const updated = await prisma.civicAction.update({
      where: { id: action.id },
      data: {
        status: 'REWARDED',
        proofDigest,
        rewardTransactionHash: claimable.transactionHash,
        rewardClaimableBalanceId: claimable.claimableBalanceId || null,
        rewardLedger: claimable.ledger || null,
        rewardPaidAt: new Date()
      },
      include: civicActionInclude
    });

    return attachActionApprovalSummary(updated, userId);
  }

  const result = await submitSignedStellarPayment(paymentInput);

  const updated = await prisma.civicAction.update({
    where: { id: action.id },
    data: {
      status: 'REWARDED',
      proofDigest,
      rewardTransactionHash: result.transactionHash,
      rewardLedger: result.ledger || null,
      rewardPaidAt: new Date()
    },
    include: civicActionInclude
  });

  return attachActionApprovalSummary(updated, userId);
}
