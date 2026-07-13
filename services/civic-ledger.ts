import { prisma } from '@/lib/db';
import { getActiveTenant } from '@/lib/civic/shared';
import {
  normalizeStellarAmount,
  stellarExpertClaimableBalanceUrl,
  stellarExpertTxUrl
} from '@/lib/stellar/index';

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
  const tenant = await getActiveTenant(tenantSlug);

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
      kindLabel:
        reward.type === 'CLEANUP' ? 'Cleanup reward' : reward.type === 'VOLUNTEER' ? 'Volunteer reward' : 'Participation reward',
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
