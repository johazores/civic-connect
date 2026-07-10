import { prisma } from '@/lib/db';
import { approveRelease, getApprovalSummary } from '@/services/approval-service';
import {
  asDecimalString,
  createUniqueCivicReference,
  getActiveTenant,
  getTenantNetworkConfig,
  getTenantPayoutSecret,
  transparencyProofDigest
} from '@/lib/civic/shared';
import { isValidStellarPublicKey, submitSignedStellarPayment } from '@/lib/stellar/index';

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

export async function listTransparencyEntries(tenantSlug: string, includeDrafts = false, userId?: string | null) {
  const tenant = await getActiveTenant(tenantSlug);

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
  const tenant = await getActiveTenant(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  if (!String(input.title || '').trim() || !String(input.description || '').trim()) {
    throw new Error('Title and description are required.');
  }

  const referenceCode = await createUniqueCivicReference('LED');
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
  const tenant = await getActiveTenant(tenantSlug);

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
  const tenant = await getActiveTenant(tenantSlug);

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
  const tenant = await getActiveTenant(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const entry = await prisma.transparencyEntry.findFirst({ where: { id, tenantId: tenant.id } });

  if (!entry) {
    throw new Error('Transparency entry not found.');
  }

  return prisma.transparencyEntry.update({ where: { id: entry.id }, data: { status: 'ARCHIVED' } });
}
