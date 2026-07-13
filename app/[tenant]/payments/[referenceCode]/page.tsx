import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { PaymentCheckout } from '@/components/public/payment-checkout';
import { getPaymentIntentByReference } from '@/services/payment-service';
import { getTenantBySlug } from '@/services/tenant-service';

function serializePayment(payment: NonNullable<Awaited<ReturnType<typeof getPaymentIntentByReference>>>) {
  return {
    referenceCode: payment.referenceCode,
    payerName: payment.payerName,
    payerEmail: payment.payerEmail,
    amount: String(payment.amount),
    assetCode: payment.assetCode,
    destinationPublicKey: payment.destinationPublicKey,
    memo: payment.memo,
    sep7Uri: payment.sep7Uri,
    status: payment.status,
    transactionHash: payment.transactionHash,
    payerPublicKey: payment.payerPublicKey,
    ledger: payment.ledger,
    failureReason: payment.failureReason,
    createdAt: payment.createdAt.toISOString(),
    paidAt: payment.paidAt?.toISOString() || null,
    verifiedAt: payment.verifiedAt?.toISOString() || null,
    service: {
      title: payment.service.title,
      description: payment.service.description,
      serviceKind: payment.service.serviceKind
    }
  };
}

export default async function PaymentDetailPage({ params }: { params: Promise<{ tenant: string; referenceCode: string }> }) {
  const { tenant: tenantSlug, referenceCode } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const payment = await getPaymentIntentByReference(tenantSlug, referenceCode);

  if (!payment) {
    notFound();
  }

  return (
    <PublicShell
      tenant={tenant}
      flow
      backHref={`/${tenant.slug}/payments`}
      title="Payment"
      subtitle={payment.referenceCode}
    >
      <main className="page-section pb-6">
        <PaymentCheckout tenantSlug={tenant.slug} initialPayment={serializePayment(payment)} />
      </main>
    </PublicShell>
  );
}
