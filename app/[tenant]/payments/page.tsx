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
    <PublicShell tenant={tenant} title="Payments" subtitle="Pay fees with a verifiable Stellar receipt">
      <main className="page-section">
        <PaymentIntentForm tenantSlug={tenant.slug} services={paidServices} initialServiceId={query.serviceId} />

        <p className="group-label mt-6">How it works</p>
        <div className="menu-group">
          <div className="menu-item">
            <span className="mi-tx">
              <b>Your wallet signs the payment</b>
              <span>The portal only creates a Stellar Testnet request — it never handles private keys.</span>
            </span>
          </div>
          <div className="menu-item">
            <span className="mi-tx">
              <b>The memo is your receipt reference</b>
              <span>Keep it unchanged so the transaction can be verified into a permanent public receipt.</span>
            </span>
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
