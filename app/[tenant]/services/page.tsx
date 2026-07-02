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
    <PublicShell tenant={tenant}>
      <main className="page-section">
        <div className="mx-auto max-w-7xl">
          <p className="section-eyebrow">Services</p>
          <h1 className="heading-display mt-4 text-4xl md:text-6xl">City services directory</h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">Browse available city services and find the right department for your concern.</p>
          <div className="mt-8">
            <ServicesGrid services={services} />
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
