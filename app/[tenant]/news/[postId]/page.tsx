import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { prisma } from '@/lib/db';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function NewsDetailPage({ params }: { params: Promise<{ tenant: string; postId: string }> }) {
  const { tenant: tenantSlug, postId } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const post = await prisma.newsPost.findFirst({
    where: {
      id: postId,
      tenantId: tenant.id,
      isPublished: true
    }
  });

  if (!post) {
    notFound();
  }

  return (
    <PublicShell tenant={tenant} title="Announcement" subtitle={formatDate(post.publishedAt)} backHref={`/${tenant.slug}/news`}>
      <main className="page-section">
        <article className="min-w-0">
          <Card className="overflow-hidden p-0">
            {post.imageUrl ? (
              <img src={post.imageUrl} alt="" className="aspect-[16/9] w-full object-cover" />
            ) : (
              <div className="heatbar"><i style={{ width: '70%' }} /></div>
            )}
            <div className="min-w-0 p-5">
              <p className="group-label">{formatDate(post.publishedAt)}</p>
              <h1 className="mt-2 break-words font-display text-[22px] font-bold leading-snug tracking-tight text-[var(--ink)]">
                {post.title}
              </h1>
              <p className="mt-2 break-words text-sm leading-relaxed text-[var(--ink-2)]">{post.excerpt}</p>
              <div className="mt-4 whitespace-pre-line break-words text-sm leading-[1.65] text-[var(--ink-2)]">
                {post.content}
              </div>
            </div>
          </Card>
        </article>
      </main>
    </PublicShell>
  );
}
