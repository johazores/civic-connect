import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { ServicesGrid } from '@/components/public/services-grid';
import { prisma } from '@/lib/db';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function ServicesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }]
  });

  return (
    <PublicShell
      tenant={tenant}
      title="Services"
      subtitle="Permits, fees, and city offices"
      backHref={`/${tenant.slug}`}
    >
      <main className="page-section">
        <ServicesGrid
          services={services.map((service: any) => ({ ...service, feeAmount: service.feeAmount ? String(service.feeAmount) : null }))}
          tenantSlug={tenant.slug}
        />
      </main>
    </PublicShell>
  );
}
