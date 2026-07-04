import type { CivicApprovalTargetType } from '@prisma/client';
import { prisma } from '@/lib/db';

export type ApprovalSummary = {
  enabled: boolean;
  signerCount: number;
  requiredApprovals: number;
  approvalCount: number;
  remainingApprovals: number;
  approvedByCurrentUser: boolean;
  approvers: Array<{
    name: string;
    email: string;
    approvedAt: string;
  }>;
};

type ApprovalPolicyInput = {
  enabled?: boolean;
  signerCount?: number | string | null;
  requiredApprovals?: number | string | null;
  note?: string | null;
};

function clampInteger(value: unknown, fallback: number, min: number, max: number) {
  const next = Number(value);

  if (!Number.isInteger(next)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, next));
}

function normalizePolicy(input: ApprovalPolicyInput) {
  const signerCount = clampInteger(input.signerCount, 10, 1, 50);
  const requiredApprovals = clampInteger(input.requiredApprovals, Math.min(6, signerCount), 1, signerCount);

  return {
    enabled: Boolean(input.enabled),
    signerCount,
    requiredApprovals,
    note: input.note?.trim() || null
  };
}

export async function getTenantApprovalPolicyByTenantId(tenantId: string) {
  const existing = await prisma.tenantApprovalPolicy.findUnique({ where: { tenantId } });

  if (existing) {
    return existing;
  }

  return prisma.tenantApprovalPolicy.create({
    data: {
      tenantId,
      enabled: false,
      signerCount: 10,
      requiredApprovals: 6,
      note: 'Majority approval for outgoing LGU wallet releases.'
    }
  });
}

export async function getTenantApprovalSettings(tenantSlug: string) {
  const tenant = await prisma.tenant.findFirst({ where: { slug: tenantSlug, isActive: true }, select: { id: true } });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  return getTenantApprovalPolicyByTenantId(tenant.id);
}

export async function updateTenantApprovalSettings(tenantSlug: string, input: ApprovalPolicyInput) {
  const tenant = await prisma.tenant.findFirst({ where: { slug: tenantSlug, isActive: true }, select: { id: true } });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const policy = normalizePolicy(input);

  return prisma.tenantApprovalPolicy.upsert({
    where: { tenantId: tenant.id },
    create: {
      tenantId: tenant.id,
      ...policy
    },
    update: policy
  });
}

export async function getApprovalSummary(input: {
  tenantId: string;
  targetType: CivicApprovalTargetType;
  targetId: string;
  userId?: string | null;
}): Promise<ApprovalSummary> {
  const policy = await getTenantApprovalPolicyByTenantId(input.tenantId);
  const approvals = await prisma.civicTransactionApproval.findMany({
    where: {
      tenantId: input.tenantId,
      targetType: input.targetType,
      targetId: input.targetId
    },
    include: {
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'asc' }
  });
  const approvalCount = approvals.length;
  const enabled = policy.enabled && policy.requiredApprovals > 1;
  const requiredApprovals = enabled ? policy.requiredApprovals : 1;

  return {
    enabled,
    signerCount: policy.signerCount,
    requiredApprovals,
    approvalCount,
    remainingApprovals: Math.max(0, requiredApprovals - approvalCount),
    approvedByCurrentUser: Boolean(input.userId && approvals.some((approval: any) => approval.userId === input.userId)),
    approvers: approvals.map((approval: any) => ({
      name: approval.user.name,
      email: approval.user.email,
      approvedAt: approval.createdAt.toISOString()
    }))
  };
}

export async function approveRelease(input: {
  tenantId: string;
  targetType: CivicApprovalTargetType;
  targetId: string;
  userId: string;
  note?: string | null;
}) {
  const policy = await getTenantApprovalPolicyByTenantId(input.tenantId);

  if (!policy.enabled || policy.requiredApprovals <= 1) {
    return getApprovalSummary(input);
  }

  await prisma.civicTransactionApproval.upsert({
    where: {
      tenantId_targetType_targetId_userId: {
        tenantId: input.tenantId,
        targetType: input.targetType,
        targetId: input.targetId,
        userId: input.userId
      }
    },
    create: {
      tenantId: input.tenantId,
      targetType: input.targetType,
      targetId: input.targetId,
      userId: input.userId,
      note: input.note?.trim() || null
    },
    update: {
      note: input.note?.trim() || null
    }
  });

  return getApprovalSummary(input);
}

export function serializeApprovalPolicy(policy: {
  enabled: boolean;
  signerCount: number;
  requiredApprovals: number;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    enabled: policy.enabled,
    signerCount: policy.signerCount,
    requiredApprovals: policy.requiredApprovals,
    note: policy.note,
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString()
  };
}
