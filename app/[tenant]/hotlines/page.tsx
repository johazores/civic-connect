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
    <PublicShell
      tenant={tenant}
      title="Hotlines"
      subtitle="Emergency and city contacts"
      backHref={`/${tenant.slug}`}
    >
      <main className="pt-[18px]">
        <HotlinesSection hotlines={hotlines} />
      </main>
    </PublicShell>
  );
}
