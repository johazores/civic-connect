import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { PaymentIntentForm, type PaidServiceOption } from '@/components/public/payment-intent-form';
import { prisma } from '@/lib/db';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function PaymentsPage({ params, searchParams }: { params: Promise<{ tenant: string }>; searchParams: Promise<{ serviceId?: string }> }) {
  const { tenant: tenantSlug } = await params;
  const query = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const services = await prisma.service.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
      paymentRequired: true
    },
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }]
  });

  const paidServices: PaidServiceOption[] = services.map((service: any) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    department: service.department,
    feeAmount: String(service.feeAmount || '0'),
    feeAssetCode: service.feeAssetCode
  }));

  return (
    <PublicShell tenant={tenant}>
      <main className="page-section">
        <div className="mx-auto max-w-7xl">
          <p className="section-eyebrow">Verified payments</p>
          <h1 className="heading-display mt-4 text-4xl md:text-6xl">Pay service fees with a verifiable Stellar receipt.</h1>
          <p className="mt-4 max-w-3xl text-base font-medium leading-7 text-slate-600">
            Create a payment request for eligible public services, complete it with your own Stellar Testnet wallet, and verify the transaction hash into a permanent receipt.
          </p>
          <div className="mt-8">
            <PaymentIntentForm tenantSlug={tenant.slug} services={paidServices} initialServiceId={query.serviceId} />
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
