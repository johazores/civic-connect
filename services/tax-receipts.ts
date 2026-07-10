import { prisma } from '@/lib/db';
import { safeTenantSelect } from '@/lib/auth';
import {
  asDecimalString,
  createUniqueCivicReference,
  getActiveTenant,
  taxReceiptProofDigest
} from '@/lib/civic/shared';

export async function listPropertyTaxReceipts(tenantSlug: string, filters?: { search?: string; includeVoided?: boolean }) {
  const tenant = await getActiveTenant(tenantSlug);

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
  const tenant = await getActiveTenant(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  if (!String(input.taxpayerName || '').trim() || !String(input.propertyIndexNumber || '').trim() || !String(input.propertyAddress || '').trim()) {
    throw new Error('Taxpayer name, property index number, and property address are required.');
  }

  const referenceCode = await createUniqueCivicReference('TAX');
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
  const tenant = await getActiveTenant(tenantSlug);

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
  const tenant = await getActiveTenant(tenantSlug);

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const receipt = await prisma.propertyTaxReceipt.findFirst({ where: { id, tenantId: tenant.id } });

  if (!receipt) {
    throw new Error('Property tax receipt not found.');
  }

  return prisma.propertyTaxReceipt.update({ where: { id: receipt.id }, data: { status: 'VOID' } });
}
