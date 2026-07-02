import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { HotlinesSection } from '@/components/public/hotlines-section';
import { prisma } from '@/lib/db';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function HotlinesPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const hotlines = await prisma.hotline.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: [{ isEmergency: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }]
  });

  return (
    <PublicShell tenant={tenant}>
      <main className="page-section">
        <div className="mx-auto max-w-7xl">
          <p className="section-eyebrow">Hotlines</p>
          <h1 className="heading-display mt-4 text-4xl md:text-6xl">Emergency and city contacts</h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">Tap a card to call the right city office quickly from mobile.</p>
        </div>
      </main>
      <HotlinesSection hotlines={hotlines} />
    </PublicShell>
  );
}
