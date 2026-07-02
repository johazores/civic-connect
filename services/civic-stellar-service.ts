import { prisma } from '@/lib/db';
import { safeTenantSelect } from '@/lib/auth';
import {
  decryptStellarSecret,
  isValidStellarPublicKey,
  normalizeStellarAmount,
  resolveStellarNetworkConfig,
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

export async function listCivicActions(tenantSlug: string, filters?: { status?: string; type?: string; mineCitizenId?: string | null }) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  return prisma.civicAction.findMany({
    where: {
      tenantId: tenant.id,
      ...(filters?.status && filters.status !== 'ALL' ? { status: filters.status as any } : {}),
      ...(filters?.type && filters.type !== 'ALL' ? { type: filters.type as any } : {}),
      ...(filters?.mineCitizenId ? { citizenId: filters.mineCitizenId } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: civicActionInclude
  });
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

  return prisma.civicAction.update({
    where: { id: current.id },
    data: {
      status: status as any,
      verificationNote: input.verificationNote ?? current.verificationNote,
      rewardAmount: input.rewardAmount != null ? asDecimalString(input.rewardAmount) : current.rewardAmount,
      rewardAssetCode: input.rewardAssetCode?.trim() || current.rewardAssetCode,
      rewardAssetIssuer: input.rewardAssetIssuer?.trim() || null,
      rewardDestinationPublicKey: input.rewardDestinationPublicKey?.trim() || current.rewardDestinationPublicKey,
      reviewedAt: ['APPROVED', 'REJECTED'].includes(status) ? new Date() : current.reviewedAt
    },
    include: civicActionInclude
  });
}

export async function payCivicActionReward(tenantSlug: string, id: string) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const action = await prisma.civicAction.findFirst({ where: { id, tenantId: tenant.id } });

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

  const config = getTenantNetworkConfig(tenant);
  const secret = getTenantPayoutSecret(tenant);
  const result = await submitSignedStellarPayment({
    sourceSecretKey: secret,
    destinationPublicKey: action.rewardDestinationPublicKey,
    amount: String(action.rewardAmount),
    assetCode: action.rewardAssetCode,
    assetIssuer: action.rewardAssetIssuer,
    memo: action.rewardMemo || (await createUniqueReference('RWD')),
    horizonUrl: config.horizonUrl,
    networkPassphrase: config.networkPassphrase
  });

  return prisma.civicAction.update({
    where: { id: action.id },
    data: {
      status: 'REWARDED',
      rewardTransactionHash: result.transactionHash,
      rewardLedger: result.ledger || null,
      rewardPaidAt: new Date()
    },
    include: civicActionInclude
  });
}

export async function listTransparencyEntries(tenantSlug: string, includeDrafts = false) {
  const tenant = await getTenantForCivicProgram(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  return prisma.transparencyEntry.findMany({
    where: {
      tenantId: tenant.id,
      ...(includeDrafts ? {} : { status: { in: ['PUBLISHED', 'VERIFIED_ON_STELLAR'] as any } })
    },
    orderBy: { occurredAt: 'desc' }
  });
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

  return prisma.transparencyEntry.create({
    data: {
      tenantId: tenant.id,
      referenceCode,
      title: String(input.title).trim(),
      description: String(input.description).trim(),
      entryType: String(input.entryType || 'PUBLIC_DISBURSEMENT') as any,
      status: String(input.status || 'PUBLISHED') as any,
      department: String(input.department || '').trim() || null,
      recipientName: String(input.recipientName || '').trim() || null,
      recipientPublicKey: String(input.recipientPublicKey || '').trim() || null,
      amount: asDecimalString(input.amount, '0'),
      assetCode: String(input.assetCode || 'XLM').trim().toUpperCase(),
      assetIssuer: String(input.assetIssuer || '').trim() || null,
      memo: String(input.memo || '').trim() || referenceCode,
      transactionHash: String(input.transactionHash || '').trim() || null,
      occurredAt: input.occurredAt ? new Date(String(input.occurredAt)) : new Date()
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

  return prisma.transparencyEntry.update({
    where: { id: entry.id },
    data: {
      title: String(input.title ?? entry.title).trim(),
      description: String(input.description ?? entry.description).trim(),
      entryType: String(input.entryType || entry.entryType) as any,
      status: String(input.status || entry.status) as any,
      department: String(input.department ?? entry.department ?? '').trim() || null,
      recipientName: String(input.recipientName ?? entry.recipientName ?? '').trim() || null,
      recipientPublicKey: String(input.recipientPublicKey ?? entry.recipientPublicKey ?? '').trim() || null,
      amount: input.amount != null ? asDecimalString(input.amount) : entry.amount,
      assetCode: String(input.assetCode || entry.assetCode).trim().toUpperCase(),
      assetIssuer: String(input.assetIssuer ?? entry.assetIssuer ?? '').trim() || null,
      memo: String(input.memo ?? entry.memo ?? '').trim() || entry.referenceCode,
      transactionHash: String(input.transactionHash ?? entry.transactionHash ?? '').trim() || null,
      occurredAt: input.occurredAt ? new Date(String(input.occurredAt)) : entry.occurredAt
    }
  });
}

export async function publishTransparencyDisbursement(tenantSlug: string, id: string) {
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

  const config = getTenantNetworkConfig(tenant);
  const secret = getTenantPayoutSecret(tenant);
  const result = await submitSignedStellarPayment({
    sourceSecretKey: secret,
    destinationPublicKey: entry.recipientPublicKey,
    amount: String(entry.amount),
    assetCode: entry.assetCode,
    assetIssuer: entry.assetIssuer,
    memo: entry.memo || entry.referenceCode,
    horizonUrl: config.horizonUrl,
    networkPassphrase: config.networkPassphrase
  });

  return prisma.transparencyEntry.update({
    where: { id: entry.id },
    data: {
      status: 'VERIFIED_ON_STELLAR',
      transactionHash: result.transactionHash,
      ledger: result.ledger || null
    }
  });
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

  return prisma.propertyTaxReceipt.create({
    data: {
      tenantId: tenant.id,
      referenceCode,
      taxpayerName: String(input.taxpayerName).trim(),
      taxpayerEmail: String(input.taxpayerEmail || '').trim() || null,
      propertyIndexNumber: String(input.propertyIndexNumber).trim(),
      propertyAddress: String(input.propertyAddress).trim(),
      taxYear: Number(input.taxYear || new Date().getFullYear()),
      amount: asDecimalString(input.amount, '0'),
      assetCode: String(input.assetCode || 'XLM').trim().toUpperCase(),
      assetIssuer: String(input.assetIssuer || '').trim() || null,
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
