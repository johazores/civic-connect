import Link from 'next/link';
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
    <PublicShell tenant={tenant}>
      <main className="page-section">
        <article className="mx-auto max-w-4xl">
          <Link href={`/${tenant.slug}/news`} className="inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
            Back to news
          </Link>

          <Card className="mt-6 overflow-hidden p-0 ">
            {post.imageUrl ? (
              <img src={post.imageUrl} alt="" className="h-64 w-full object-cover md:h-96" />
            ) : (
              <div className="h-2 bg-[var(--brand)]" />
            )}
            <div className="p-6 md:p-10">
              <p className="section-eyebrow">{formatDate(post.publishedAt)}</p>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-900 md:text-5xl">{post.title}</h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">{post.excerpt}</p>
              <div className="mt-8 whitespace-pre-line rounded-[2rem] bg-slate-50 p-6 text-base leading-8 text-slate-700 ring-1 ring-slate-100">
                {post.content}
              </div>
            </div>
          </Card>
        </article>
      </main>
    </PublicShell>
  );
}
