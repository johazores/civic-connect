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
    <PublicShell
      tenant={tenant}
      title="News"
      subtitle={`Official announcements from ${tenant.cityName}`}
      backHref={`/${tenant.slug}`}
    >
      <main className="page-section">
        <NewsGrid posts={posts} tenantSlug={tenant.slug} />
      </main>
    </PublicShell>
  );
}
