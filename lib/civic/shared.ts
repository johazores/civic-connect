import { prisma } from '@/lib/db';
import { decryptStellarSecret, normalizeStellarAmount, resolveStellarNetworkConfig } from '@/lib/stellar/index';
import { computeProofDigest } from '@/lib/stellar/proof';

export function asDecimalString(value: unknown, fallback = '0') {
  const amount = Number(value ?? fallback);
  if (!Number.isFinite(amount) || amount < 0) return fallback;
  return normalizeStellarAmount(amount);
}

export async function getActiveTenant(slug: string) {
  return prisma.tenant.findFirst({ where: { slug, isActive: true } });
}

export function getTenantNetworkConfig(tenant: {
  stellarNetwork: string | null;
  stellarHorizonUrl: string | null;
  stellarFriendbotUrl: string | null;
  stellarNetworkPassphrase: string | null;
}) {
  return resolveStellarNetworkConfig({
    network: tenant.stellarNetwork,
    horizonUrl: tenant.stellarHorizonUrl,
    friendbotUrl: tenant.stellarFriendbotUrl,
    networkPassphrase: tenant.stellarNetworkPassphrase
  });
}

export function getTenantPayoutSecret(tenant: {
  stellarReceivingSecretEncrypted: string | null;
  stellarReceivingPublicKey: string | null;
}) {
  if (!tenant.stellarReceivingSecretEncrypted) {
    throw new Error('The tenant Stellar wallet secret is not configured. Generate or import a Testnet wallet first.');
  }
  if (!tenant.stellarReceivingPublicKey) {
    throw new Error('The tenant Stellar receiving public key is not configured.');
  }
  return decryptStellarSecret(tenant.stellarReceivingSecretEncrypted);
}

export async function createUniqueCivicReference(prefix: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const value = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const [action, entry, receipt] = await Promise.all([
      prisma.civicAction.findFirst({ where: { rewardMemo: value }, select: { id: true } }),
      prisma.transparencyEntry.findUnique({ where: { referenceCode: value }, select: { id: true } }),
      prisma.propertyTaxReceipt.findUnique({ where: { referenceCode: value }, select: { id: true } })
    ]);
    if (!action && !entry && !receipt) return value;
  }
  throw new Error('Could not create a unique civic ledger reference.');
}

export function civicActionProofDigest(action: {
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

export function transparencyProofDigest(entry: {
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

export function taxReceiptProofDigest(receipt: {
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
