import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { ReportForm } from '@/components/public/report-form';
import { prisma } from '@/lib/db';
import { getTenantCopy } from '@/lib/tenant-copy';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function ReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const copy = getTenantCopy(tenant.orgType);

  const categories = await prisma.reportCategory.findMany({
    where: { tenantId: tenant.id, isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true
    }
  });

  return (
    <PublicShell
      tenant={tenant}
      flow
      backHref={`/${tenant.slug}`}
      title={copy.reportLabel}
      subtitle="Get a reference number to track it"
    >
      <main className="page-section pb-6">
        <ReportForm tenantSlug={tenant.slug} categories={categories} />
      </main>
    </PublicShell>
  );
}
