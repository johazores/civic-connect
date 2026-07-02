import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { ReportForm } from '@/components/public/report-form';
import { prisma } from '@/lib/db';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function ReportPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

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
    <PublicShell tenant={tenant}>
      <main className="page-section">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="section-eyebrow">Citizen Report</p>
            <h1 className="heading-display mt-4 text-4xl md:text-6xl">Report a city concern</h1>
            <p className="mt-4 text-base font-medium leading-7 text-slate-600">Submit a local concern, upload an optional photo, and receive a reference number for tracking.</p>
          </div>
          <ReportForm tenantSlug={tenant.slug} categories={categories} />
        </div>
      </main>
    </PublicShell>
  );
}
