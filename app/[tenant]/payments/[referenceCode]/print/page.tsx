import { notFound } from 'next/navigation';
import { PrintablePaymentQr } from '@/components/public/printable-payment-qr';
import { getPaymentIntentByReference } from '@/services/payment-service';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function PrintPaymentQrPage({
  params
}: {
  params: Promise<{ tenant: string; referenceCode: string }>;
}) {
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
    <PrintablePaymentQr
      tenantName={tenant.name}
      serviceTitle={payment.service.title}
      serviceKind={payment.service.serviceKind}
      amount={String(payment.amount)}
      assetCode={payment.assetCode}
      memo={payment.memo}
      referenceCode={payment.referenceCode}
      qrUrl={`/api/tenant/${tenant.slug}/payments/${payment.referenceCode}/qr`}
    />
  );
}
