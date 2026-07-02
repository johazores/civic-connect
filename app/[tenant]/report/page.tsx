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
      <main className="px-4 py-12 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <p className="section-eyebrow">Citizen Report</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">Report a city concern</h1>
            <p className="mt-3 text-slate-600">Submit a local concern, upload an optional photo, and receive a reference number for tracking.</p>
          </div>
          <ReportForm tenantSlug={tenant.slug} categories={categories} />
        </div>
      </main>
    </PublicShell>
  );
}
