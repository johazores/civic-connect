import { prisma } from '@/lib/db';
import { safeTenantSelect } from '@/lib/auth';
import { approveRelease, getApprovalSummary } from '@/services/approval-service';
import {
  computeProofDigest,
  decryptStellarSecret,
  isValidStellarPublicKey,
  normalizeStellarAmount,
  resolveStellarNetworkConfig,
  stellarExpertClaimableBalanceUrl,
  stellarExpertTxUrl,
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

type TenantWithWallet = NonNullable<Awaited<ReturnType<typeof getTenantForCivicProgram>>>;

function asDecimalString(value: unknown, fallback = '0') {
  const amount = Number(value ?? fallback);

  if (!Number.isFinite(amount) || amount < 0) {
    return fallback;
  }

  return normalizeStellarAmount(amount);
}

async function getTenantForCivicProgram(tenantSlug: string) {
  return prisma.tenant.findFirst({ where: { slug: tenantSlug, isActive: true } });
}

async function createUniqueReference(prefix: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const value = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const [action, entry, receipt] = await Promise.all([
      prisma.civicAction.findFirst({ where: { rewardMemo: value }, select: { id: true } }),
      prisma.transparencyEntry.findUnique({ where: { referenceCode: value }, select: { id: true } }),
      prisma.propertyTaxReceipt.findUnique({ where: { referenceCode: value }, select: { id: true } })
    ]);

    if (!action && !entry && !receipt) {
      return value;
    }
  }

  throw new Error('Could not create a unique civic ledger reference.');
}

function getTenantPayoutSecret(tenant: TenantWithWallet) {
  if (!tenant.stellarReceivingSecretEncrypted) {
    throw new Error('The tenant Stellar wallet secret is not configured. Generate or import a Testnet wallet first.');
  }

  if (!tenant.stellarReceivingPublicKey) {
    throw new Error('The tenant Stellar receiving public key is not configured.');
  }

  return decryptStellarSecret(tenant.stellarReceivingSecretEncrypted);
}

function getTenantNetworkConfig(tenant: TenantWithWallet) {
  return resolveStellarNetworkConfig({
    network: tenant.stellarNetwork,
    horizonUrl: tenant.stellarHorizonUrl,
    friendbotUrl: tenant.stellarFriendbotUrl,
    networkPassphrase: tenant.stellarNetworkPassphrase
  });
}

/** Canonical, reproducible SHA-256 over a civic action's tamper-sensitive fields. */
function civicActionProofDigest(action: {
  type: string;
  participantName: string;
  participantEmail?: string | null;
  locationText: string;
  latitude?: number | null;
  longitude?: number | null;
  photoUrl?: string | null;
  verificationNote?: string | null;
  rewardMemo?: string | null;
  rewardAmount: unknown;
  rewardAssetCode: string;
}) {
  return computeProofDigest([
    action.type,
    action.participantName,
    action.participantEmail,
    action.locationText,
    action.latitude,
    action.longitude,
    action.photoUrl,
    action.verificationNote,
    action.rewardMemo,
    String(action.rewardAmount),
    action.rewardAssetCode
  ]);
}

function transparencyProofDigest(entry: {
  entryType: string;
  title: string;
  department?: string | null;
  recipientName?: string | null;
  recipientPublicKey?: string | null;
  amount: unknown;
  assetCode: string;
  referenceCode: string;
  occurredAt: Date;
}) {
  return computeProofDigest([
    entry.entryType,
    entry.title,
    entry.department,
    entry.recipientName,
    entry.recipientPublicKey,
    String(entry.amount),
    entry.assetCode,
    entry.referenceCode,
    entry.occurredAt.toISOString()
  ]);
}

function taxReceiptProofDigest(receipt: {
  taxpayerName: string;
  propertyIndexNumber: string;
  propertyAddress: string;
  taxYear: number;
  amount: unknown;
  assetCode: string;
  referenceCode: string;
}) {
  return computeProofDigest([
    receipt.taxpayerName,
    receipt.propertyIndexNumber,
    receipt.propertyAddress,
    receipt.taxYear,
    String(receipt.amount),
    receipt.assetCode,
    receipt.referenceCode
  ]);
}

export async function createCivicAction(input: CivicActionInput) {
  const tenant = await getTenantForCivicProgram(input.tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  if (!input.title?.trim() || !input.description?.trim() || !input.locationText?.trim() || !input.participantName?.trim()) {
    throw new Error('Title, description, location, and participant name are required.');
  }

  if (input.rewardDestinationPublicKey && !isValidStellarPublicKey(input.rewardDestinationPublicKey)) {
    throw new Error('Reward wallet must be a valid Stellar public key that starts with G.');
  }

  const memo = await createUniqueReference(input.type === 'CLEANUP' ? 'CLN' : 'ACT');

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
  const tenant = await getTenantForCivicProgram(tenantSlug);

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
  const tenant = await getTenantForCivicProgram(tenantSlug);

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
  const tenant = await getTenantForCivicProgram(tenantSlug);

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
  const memo = action.rewardMemo || (await createUniqueReference('RWD'));
  // Anchor a tamper-evident proof of the approved action on-chain as a 32-byte MEMO_HASH.
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

  // CLAIMABLE commits the reward on-chain immediately so a citizen can claim it
  // later from their own wallet — even before they have funded an account.
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

export async function listTransparencyEntries(tenantSlug: string, includeDrafts = false, userId?: string | null) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const entries = await prisma.transparencyEntry.findMany({
    where: {
      tenantId: tenant.id,
      ...(includeDrafts ? {} : { status: { in: ['PUBLISHED', 'VERIFIED_ON_STELLAR'] as any } })
    },
    orderBy: { occurredAt: 'desc' }
  });

  return Promise.all(entries.map((entry: any) => attachTransparencyApprovalSummary(entry, userId)));
}

export async function createTransparencyEntry(tenantSlug: string, input: Record<string, unknown>) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  if (!String(input.title || '').trim() || !String(input.description || '').trim()) {
    throw new Error('Title and description are required.');
  }

  const referenceCode = await createUniqueReference('LED');
  const occurredAt = input.occurredAt ? new Date(String(input.occurredAt)) : new Date();
  const entryType = String(input.entryType || 'PUBLIC_DISBURSEMENT');
  const amount = asDecimalString(input.amount, '0');
  const assetCode = String(input.assetCode || 'XLM').trim().toUpperCase();
  const proofDigest = transparencyProofDigest({
    entryType,
    title: String(input.title).trim(),
    department: String(input.department || '').trim() || null,
    recipientName: String(input.recipientName || '').trim() || null,
    recipientPublicKey: String(input.recipientPublicKey || '').trim() || null,
    amount,
    assetCode,
    referenceCode,
    occurredAt
  });

  return prisma.transparencyEntry.create({
    data: {
      tenantId: tenant.id,
      referenceCode,
      title: String(input.title).trim(),
      description: String(input.description).trim(),
      entryType: entryType as any,
      status: String(input.status || 'PUBLISHED') as any,
      department: String(input.department || '').trim() || null,
      recipientName: String(input.recipientName || '').trim() || null,
      recipientPublicKey: String(input.recipientPublicKey || '').trim() || null,
      amount,
      assetCode,
      assetIssuer: String(input.assetIssuer || '').trim() || null,
      memo: String(input.memo || '').trim() || referenceCode,
      proofDigest,
      transactionHash: String(input.transactionHash || '').trim() || null,
      occurredAt
    }
  });
}

export async function updateTransparencyEntry(tenantSlug: string, id: string, input: Record<string, unknown>) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const entry = await prisma.transparencyEntry.findFirst({ where: { id, tenantId: tenant.id } });

  if (!entry) {
    throw new Error('Transparency entry not found.');
  }

  const nextTitle = String(input.title ?? entry.title).trim();
  const nextDescription = String(input.description ?? entry.description).trim();
  const nextEntryType = String(input.entryType || entry.entryType);
  const nextStatus = String(input.status || entry.status);
  const nextDepartment = String(input.department ?? entry.department ?? '').trim() || null;
  const nextRecipientName = String(input.recipientName ?? entry.recipientName ?? '').trim() || null;
  const nextRecipientPublicKey = String(input.recipientPublicKey ?? entry.recipientPublicKey ?? '').trim() || null;
  const nextAmount = input.amount != null ? asDecimalString(input.amount) : entry.amount;
  const nextAssetCode = String(input.assetCode || entry.assetCode).trim().toUpperCase();
  const nextAssetIssuer = String(input.assetIssuer ?? entry.assetIssuer ?? '').trim() || null;
  const nextMemo = String(input.memo ?? entry.memo ?? '').trim() || entry.referenceCode;
  const nextTransactionHash = String(input.transactionHash ?? entry.transactionHash ?? '').trim() || null;
  const nextOccurredAt = input.occurredAt ? new Date(String(input.occurredAt)) : entry.occurredAt;
  const approvalSensitiveChange = [
    nextTitle !== entry.title,
    nextDescription !== entry.description,
    nextEntryType !== entry.entryType,
    nextStatus !== entry.status,
    nextDepartment !== entry.department,
    nextRecipientName !== entry.recipientName,
    nextRecipientPublicKey !== entry.recipientPublicKey,
    String(nextAmount) !== String(entry.amount),
    nextAssetCode !== entry.assetCode,
    nextAssetIssuer !== entry.assetIssuer,
    nextMemo !== entry.memo,
    nextOccurredAt.getTime() !== entry.occurredAt.getTime()
  ].some(Boolean);

  if (approvalSensitiveChange && !entry.transactionHash) {
    await prisma.civicTransactionApproval.deleteMany({
      where: {
        tenantId: tenant.id,
        targetType: 'TRANSPARENCY_DISBURSEMENT',
        targetId: entry.id
      }
    });
  }

  return prisma.transparencyEntry.update({
    where: { id: entry.id },
    data: {
      title: nextTitle,
      description: nextDescription,
      entryType: nextEntryType as any,
      status: nextStatus as any,
      department: nextDepartment,
      recipientName: nextRecipientName,
      recipientPublicKey: nextRecipientPublicKey,
      amount: nextAmount,
      assetCode: nextAssetCode,
      assetIssuer: nextAssetIssuer,
      memo: nextMemo,
      transactionHash: nextTransactionHash,
      occurredAt: nextOccurredAt
    }
  });
}

export async function publishTransparencyDisbursement(tenantSlug: string, id: string, userId?: string | null) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const entry = await prisma.transparencyEntry.findFirst({ where: { id, tenantId: tenant.id } });

  if (!entry) {
    throw new Error('Transparency entry not found.');
  }

  if (entry.transactionHash) {
    throw new Error('This transparency entry already has a Stellar transaction hash.');
  }

  if (!entry.recipientPublicKey || !isValidStellarPublicKey(entry.recipientPublicKey)) {
    throw new Error('A valid recipient Stellar public key is required for a ledger-backed disbursement.');
  }

  if (userId) {
    const approvalSummary = await approveRelease({
      tenantId: tenant.id,
      targetType: 'TRANSPARENCY_DISBURSEMENT',
      targetId: entry.id,
      userId
    });

    if (approvalSummary.enabled && approvalSummary.remainingApprovals > 0) {
      return { ...entry, approvalSummary };
    }
  }

  const config = getTenantNetworkConfig(tenant);
  const secret = getTenantPayoutSecret(tenant);
  const proofDigest = entry.proofDigest || transparencyProofDigest({
    entryType: entry.entryType,
    title: entry.title,
    department: entry.department,
    recipientName: entry.recipientName,
    recipientPublicKey: entry.recipientPublicKey,
    amount: entry.amount,
    assetCode: entry.assetCode,
    referenceCode: entry.referenceCode,
    occurredAt: entry.occurredAt
  });
  const result = await submitSignedStellarPayment({
    sourceSecretKey: secret,
    destinationPublicKey: entry.recipientPublicKey,
    amount: String(entry.amount),
    assetCode: entry.assetCode,
    assetIssuer: entry.assetIssuer,
    memo: entry.memo || entry.referenceCode,
    memoHashHex: proofDigest,
    horizonUrl: config.horizonUrl,
    networkPassphrase: config.networkPassphrase
  });

  const updated = await prisma.transparencyEntry.update({
    where: { id: entry.id },
    data: {
      status: 'VERIFIED_ON_STELLAR',
      proofDigest,
      transactionHash: result.transactionHash,
      ledger: result.ledger || null
    }
  });

  return attachTransparencyApprovalSummary(updated, userId);
}

export async function archiveTransparencyEntry(tenantSlug: string, id: string) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const entry = await prisma.transparencyEntry.findFirst({ where: { id, tenantId: tenant.id } });

  if (!entry) {
    throw new Error('Transparency entry not found.');
  }

  return prisma.transparencyEntry.update({ where: { id: entry.id }, data: { status: 'ARCHIVED' } });
}

export async function listPropertyTaxReceipts(tenantSlug: string, filters?: { search?: string; includeVoided?: boolean }) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const search = String(filters?.search || '').trim();

  return prisma.propertyTaxReceipt.findMany({
    where: {
      tenantId: tenant.id,
      ...(filters?.includeVoided ? {} : { status: { not: 'VOID' } }),
      ...(search
        ? {
            OR: [
              { referenceCode: { contains: search, mode: 'insensitive' } },
              { taxpayerName: { contains: search, mode: 'insensitive' } },
              { taxpayerEmail: { contains: search, mode: 'insensitive' } },
              { propertyIndexNumber: { contains: search, mode: 'insensitive' } }
            ]
          }
        : {})
    },
    orderBy: { issuedAt: 'desc' }
  });
}

export async function getPropertyTaxReceiptByReference(tenantSlug: string, referenceCode: string) {
  return prisma.propertyTaxReceipt.findFirst({
    where: { referenceCode, tenant: { slug: tenantSlug, isActive: true } },
    include: { tenant: { select: safeTenantSelect }, citizen: { select: { id: true, name: true, email: true } } }
  });
}

export async function createPropertyTaxReceipt(tenantSlug: string, input: Record<string, unknown>) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  if (!String(input.taxpayerName || '').trim() || !String(input.propertyIndexNumber || '').trim() || !String(input.propertyAddress || '').trim()) {
    throw new Error('Taxpayer name, property index number, and property address are required.');
  }

  const referenceCode = await createUniqueReference('TAX');
  const amount = asDecimalString(input.amount, '0');
  const assetCode = String(input.assetCode || 'XLM').trim().toUpperCase();
  const proofDigest = taxReceiptProofDigest({
    taxpayerName: String(input.taxpayerName).trim(),
    propertyIndexNumber: String(input.propertyIndexNumber).trim(),
    propertyAddress: String(input.propertyAddress).trim(),
    taxYear: Number(input.taxYear || new Date().getFullYear()),
    amount,
    assetCode,
    referenceCode
  });

  return prisma.propertyTaxReceipt.create({
    data: {
      tenantId: tenant.id,
      referenceCode,
      taxpayerName: String(input.taxpayerName).trim(),
      taxpayerEmail: String(input.taxpayerEmail || '').trim() || null,
      propertyIndexNumber: String(input.propertyIndexNumber).trim(),
      propertyAddress: String(input.propertyAddress).trim(),
      taxYear: Number(input.taxYear || new Date().getFullYear()),
      amount,
      assetCode,
      assetIssuer: String(input.assetIssuer || '').trim() || null,
      proofDigest,
      transactionHash: String(input.transactionHash || '').trim() || null,
      ledger: input.ledger ? Number(input.ledger) : null,
      status: String(input.status || 'ISSUED') as any,
      issuedAt: input.issuedAt ? new Date(String(input.issuedAt)) : new Date()
    }
  });
}

export async function updatePropertyTaxReceipt(tenantSlug: string, id: string, input: Record<string, unknown>) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const receipt = await prisma.propertyTaxReceipt.findFirst({ where: { id, tenantId: tenant.id } });

  if (!receipt) {
    throw new Error('Property tax receipt not found.');
  }

  return prisma.propertyTaxReceipt.update({
    where: { id: receipt.id },
    data: {
      taxpayerName: String(input.taxpayerName ?? receipt.taxpayerName).trim(),
      taxpayerEmail: String(input.taxpayerEmail ?? receipt.taxpayerEmail ?? '').trim() || null,
      propertyIndexNumber: String(input.propertyIndexNumber ?? receipt.propertyIndexNumber).trim(),
      propertyAddress: String(input.propertyAddress ?? receipt.propertyAddress).trim(),
      taxYear: Number(input.taxYear ?? receipt.taxYear),
      amount: input.amount != null ? asDecimalString(input.amount) : receipt.amount,
      assetCode: String(input.assetCode || receipt.assetCode).trim().toUpperCase(),
      assetIssuer: String(input.assetIssuer ?? receipt.assetIssuer ?? '').trim() || null,
      transactionHash: String(input.transactionHash ?? receipt.transactionHash ?? '').trim() || null,
      ledger: input.ledger ? Number(input.ledger) : receipt.ledger,
      status: String(input.status || receipt.status) as any,
      issuedAt: input.issuedAt ? new Date(String(input.issuedAt)) : receipt.issuedAt
    }
  });
}

export async function voidPropertyTaxReceipt(tenantSlug: string, id: string) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const receipt = await prisma.propertyTaxReceipt.findFirst({ where: { id, tenantId: tenant.id } });

  if (!receipt) {
    throw new Error('Property tax receipt not found.');
  }

  return prisma.propertyTaxReceipt.update({ where: { id: receipt.id }, data: { status: 'VOID' } });
}

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

async function attachTransparencyApprovalSummary<T extends { id: string; tenantId: string }>(entry: T, userId?: string | null) {
  if (!userId) {
    return entry;
  }

  const approvalSummary = await getApprovalSummary({
    tenantId: entry.tenantId,
    targetType: 'TRANSPARENCY_DISBURSEMENT',
    targetId: entry.id,
    userId
  });

  return { ...entry, approvalSummary };
}

export type CivicLedgerKind = 'PAYMENT' | 'REWARD' | 'DISBURSEMENT' | 'TAX_RECEIPT';

export type CivicLedgerRow = {
  id: string;
  kind: CivicLedgerKind;
  kindLabel: string;
  referenceCode: string;
  title: string;
  counterparty: string | null;
  amount: string;
  assetCode: string;
  status: string;
  transactionHash: string | null;
  claimableBalanceId: string | null;
  ledger: number | null;
  proofDigest: string | null;
  occurredAt: string;
  explorerTxUrl: string | null;
  explorerBalanceUrl: string | null;
};

export type CivicLedgerResult = {
  network: string;
  metrics: {
    totalRecords: number;
    verifiedOnChain: number;
    xlmMoved: string;
    payments: number;
    rewards: number;
    disbursements: number;
    taxReceipts: number;
  };
  rows: CivicLedgerRow[];
};

function sumXlm(rows: CivicLedgerRow[]) {
  const total = rows.reduce((acc, row) => (row.assetCode === 'XLM' ? acc + Number(row.amount || 0) : acc), 0);
  return normalizeStellarAmount(total || 0);
}

/** Unified, public civic ledger: every Stellar-backed record across all modules. */
export async function getCivicLedger(tenantSlug: string): Promise<CivicLedgerResult | null> {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    return null;
  }

  const network = tenant.stellarNetwork;

  const [payments, rewards, disbursements, receipts] = await Promise.all([
    prisma.paymentIntent.findMany({
      where: { tenantId: tenant.id, status: 'VERIFIED' },
      include: { service: { select: { title: true } } },
      orderBy: { verifiedAt: 'desc' }
    }),
    prisma.civicAction.findMany({ where: { tenantId: tenant.id, status: 'REWARDED' }, orderBy: { rewardPaidAt: 'desc' } }),
    prisma.transparencyEntry.findMany({ where: { tenantId: tenant.id, transactionHash: { not: null } }, orderBy: { occurredAt: 'desc' } }),
    prisma.propertyTaxReceipt.findMany({ where: { tenantId: tenant.id, transactionHash: { not: null }, status: { not: 'VOID' } }, orderBy: { issuedAt: 'desc' } })
  ]);

  const rows: CivicLedgerRow[] = [];

  for (const payment of payments) {
    rows.push({
      id: payment.id,
      kind: 'PAYMENT',
      kindLabel: 'Service payment',
      referenceCode: payment.referenceCode,
      title: payment.service?.title || 'Government service fee',
      counterparty: payment.payerName || null,
      amount: normalizeStellarAmount(String(payment.amount)),
      assetCode: payment.assetCode,
      status: payment.status,
      transactionHash: payment.transactionHash,
      claimableBalanceId: null,
      ledger: payment.ledger,
      proofDigest: null,
      occurredAt: (payment.verifiedAt || payment.paidAt || payment.createdAt).toISOString(),
      explorerTxUrl: stellarExpertTxUrl(payment.transactionHash, network),
      explorerBalanceUrl: null
    });
  }

  for (const reward of rewards) {
    rows.push({
      id: reward.id,
      kind: 'REWARD',
      kindLabel: reward.type === 'CLEANUP' ? 'Cleanup reward' : 'Civic reward',
      referenceCode: reward.rewardMemo || reward.id,
      title: reward.title,
      counterparty: reward.participantName || null,
      amount: normalizeStellarAmount(String(reward.rewardAmount)),
      assetCode: reward.rewardAssetCode,
      status: reward.rewardClaimableBalanceId ? 'CLAIMABLE' : 'REWARDED',
      transactionHash: reward.rewardTransactionHash,
      claimableBalanceId: reward.rewardClaimableBalanceId,
      ledger: reward.rewardLedger,
      proofDigest: reward.proofDigest,
      occurredAt: (reward.rewardPaidAt || reward.createdAt).toISOString(),
      explorerTxUrl: stellarExpertTxUrl(reward.rewardTransactionHash, network),
      explorerBalanceUrl: stellarExpertClaimableBalanceUrl(reward.rewardClaimableBalanceId, network)
    });
  }

  for (const entry of disbursements) {
    rows.push({
      id: entry.id,
      kind: 'DISBURSEMENT',
      kindLabel: 'Public disbursement',
      referenceCode: entry.referenceCode,
      title: entry.title,
      counterparty: entry.recipientName || entry.department || null,
      amount: normalizeStellarAmount(String(entry.amount)),
      assetCode: entry.assetCode,
      status: entry.status,
      transactionHash: entry.transactionHash,
      claimableBalanceId: null,
      ledger: entry.ledger,
      proofDigest: entry.proofDigest,
      occurredAt: entry.occurredAt.toISOString(),
      explorerTxUrl: stellarExpertTxUrl(entry.transactionHash, network),
      explorerBalanceUrl: null
    });
  }

  for (const receipt of receipts) {
    rows.push({
      id: receipt.id,
      kind: 'TAX_RECEIPT',
      kindLabel: 'Tax receipt',
      referenceCode: receipt.referenceCode,
      title: `${receipt.taxYear} property tax · ${receipt.propertyIndexNumber}`,
      counterparty: receipt.taxpayerName || null,
      amount: normalizeStellarAmount(String(receipt.amount)),
      assetCode: receipt.assetCode,
      status: receipt.status,
      transactionHash: receipt.transactionHash,
      claimableBalanceId: null,
      ledger: receipt.ledger,
      proofDigest: receipt.proofDigest,
      occurredAt: receipt.issuedAt.toISOString(),
      explorerTxUrl: stellarExpertTxUrl(receipt.transactionHash, network),
      explorerBalanceUrl: null
    });
  }

  rows.sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));

  return {
    network,
    metrics: {
      totalRecords: rows.length,
      verifiedOnChain: rows.filter((row) => row.transactionHash).length,
      xlmMoved: sumXlm(rows),
      payments: payments.length,
      rewards: rewards.length,
      disbursements: disbursements.length,
      taxReceipts: receipts.length
    },
    rows
  };
}
