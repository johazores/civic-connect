import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { NewsGrid } from '@/components/public/news-grid';
import { prisma } from '@/lib/db';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function NewsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const posts = await prisma.newsPost.findMany({
    where: { tenantId: tenant.id, isPublished: true },
    orderBy: { publishedAt: 'desc' }
  });

  return (
    <PublicShell tenant={tenant}>
      <main className="page-section">
        <div className="mx-auto max-w-7xl">
          <p className="section-eyebrow">News</p>
          <h1 className="heading-display mt-4 text-4xl md:text-6xl">Announcements</h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-slate-600">Latest public updates and service information.</p>
          <div className="mt-8">
            <NewsGrid posts={posts} tenantSlug={tenant.slug} />
          </div>
        </div>
      </main>
    </PublicShell>
  );
}
