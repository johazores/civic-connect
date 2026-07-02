import { prisma } from '@/lib/db';
import { createPaymentReferenceCode } from '@/lib/payment-reference';
import { buildSep7PayUri, isValidStellarPublicKey, normalizeStellarAmount, verifyStellarPayment } from '@/lib/stellar';

export type CreatePaymentIntentInput = {
  tenantSlug: string;
  serviceId: string;
  citizenId?: string | null;
  payerName: string;
  payerEmail?: string | null;
  payerPhone?: string | null;
  appUrl?: string | null;
};

export async function getPaymentIntentByReference(tenantSlug: string, referenceCode: string) {
  return prisma.paymentIntent.findFirst({
    where: {
      referenceCode,
      tenant: {
        slug: tenantSlug,
        isActive: true
      }
    },
    include: {
      tenant: true,
      service: true,
      citizen: {
        select: { id: true, name: true, email: true, phone: true }
      }
    }
  });
}

export async function createPaymentIntent(input: CreatePaymentIntentInput) {
  const tenant = await prisma.tenant.findFirst({
    where: { slug: input.tenantSlug, isActive: true }
  });

  if (!tenant) {
    throw new Error('Tenant not found.');
  }

  const service = await prisma.service.findFirst({
    where: {
      id: input.serviceId,
      tenantId: tenant.id,
      isActive: true
    }
  });

  if (!service) {
    throw new Error('Service not found.');
  }

  if (!service.paymentRequired) {
    throw new Error('This service does not require an online Stellar payment.');
  }

  const amount = Number(service.feeAmount || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('This service does not have a valid fee amount.');
  }

  const destinationPublicKey = service.receivingPublicKey || tenant.stellarReceivingPublicKey;

  if (!isValidStellarPublicKey(destinationPublicKey)) {
    throw new Error('The receiving Stellar Testnet wallet is not configured for this service.');
  }

  const assetCode = service.feeAssetCode || tenant.stellarDefaultAssetCode || 'XLM';
  const assetIssuer = service.feeAssetIssuer || tenant.stellarDefaultAssetIssuer || null;

  if (assetCode !== 'XLM' && !isValidStellarPublicKey(assetIssuer)) {
    throw new Error('A non-XLM Stellar asset requires a valid asset issuer public key.');
  }

  const referenceCode = await createUniquePaymentReferenceCode();
  const memo = referenceCode;
  const normalizedAmount = normalizeStellarAmount(amount);
  const baseUrl = (input.appUrl || process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
  const receiptUrl = baseUrl ? `${baseUrl}/${tenant.slug}/receipts/${referenceCode}` : undefined;
  const originDomain = baseUrl ? new URL(baseUrl).host : undefined;
  const sep7Uri = buildSep7PayUri({
    destination: destinationPublicKey,
    amount: normalizedAmount,
    assetCode,
    assetIssuer,
    memo,
    callbackUrl: receiptUrl,
    originDomain,
    message: `${tenant.cityName} service fee: ${service.title} (${referenceCode})`
  });

  return prisma.paymentIntent.create({
    data: {
      tenantId: tenant.id,
      serviceId: service.id,
      citizenId: input.citizenId || null,
      referenceCode,
      payerName: input.payerName,
      payerEmail: input.payerEmail || null,
      payerPhone: input.payerPhone || null,
      amount: normalizedAmount,
      assetCode,
      assetIssuer,
      destinationPublicKey,
      memo,
      sep7Uri,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
    },
    include: {
      tenant: true,
      service: true
    }
  });
}

async function createUniquePaymentReferenceCode() {
  for (let attempts = 0; attempts < 10; attempts += 1) {
    const referenceCode = createPaymentReferenceCode();
    const existing = await prisma.paymentIntent.findUnique({ where: { referenceCode } });

    if (!existing) {
      return referenceCode;
    }
  }

  throw new Error('Unable to generate a unique payment reference.');
}

export async function verifyPaymentIntent(tenantSlug: string, referenceCode: string, transactionHash: string) {
  const paymentIntent = await getPaymentIntentByReference(tenantSlug, referenceCode);

  if (!paymentIntent) {
    throw new Error('Payment intent not found.');
  }

  if (paymentIntent.status === 'VERIFIED') {
    return paymentIntent;
  }

  const result = await verifyStellarPayment({
    horizonUrl: paymentIntent.tenant.stellarHorizonUrl,
    transactionHash,
    destinationPublicKey: paymentIntent.destinationPublicKey,
    amount: normalizeStellarAmount(String(paymentIntent.amount)),
    assetCode: paymentIntent.assetCode,
    assetIssuer: paymentIntent.assetIssuer,
    memo: paymentIntent.memo
  });

  if (!result.verified) {
    return prisma.paymentIntent.update({
      where: { id: paymentIntent.id },
      data: {
        status: 'FAILED',
        transactionHash: transactionHash.trim() || null,
        failureReason: result.failureReason || 'Unable to verify Stellar payment.'
      },
      include: {
        tenant: true,
        service: true,
        citizen: { select: { id: true, name: true, email: true, phone: true } }
      }
    });
  }

  return prisma.paymentIntent.update({
    where: { id: paymentIntent.id },
    data: {
      status: 'VERIFIED',
      transactionHash: result.transactionHash,
      payerPublicKey: result.payerPublicKey,
      ledger: result.ledger,
      failureReason: null,
      paidAt: result.paidAt ? new Date(result.paidAt) : new Date(),
      verifiedAt: new Date()
    },
    include: {
      tenant: true,
      service: true,
      citizen: { select: { id: true, name: true, email: true, phone: true } }
    }
  });
}

export async function getPaymentStats(tenantId: string) {
  const [total, pending, verified, failed] = await Promise.all([
    prisma.paymentIntent.count({ where: { tenantId } }),
    prisma.paymentIntent.count({ where: { tenantId, status: 'PENDING' } }),
    prisma.paymentIntent.count({ where: { tenantId, status: 'VERIFIED' } }),
    prisma.paymentIntent.count({ where: { tenantId, status: 'FAILED' } })
  ]);

  const verifiedPayments = await prisma.paymentIntent.findMany({
    where: { tenantId, status: 'VERIFIED' },
    select: { amount: true }
  });

  const totalVerifiedAmount = verifiedPayments.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

  return { total, pending, verified, failed, totalVerifiedAmount };
}
