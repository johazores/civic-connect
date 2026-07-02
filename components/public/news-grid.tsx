import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';

type NewsPost = {
  id: string;
  title: string;
  excerpt: string;
  imageUrl: string | null;
  publishedAt: Date | string;
};

export function NewsGrid({ posts, tenantSlug }: { posts: NewsPost[]; tenantSlug: string }) {
  if (posts.length === 0) {
    return (
      <Card>
        <p className="text-sm font-medium text-slate-500">No announcements are published yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.id} className="overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/[0.06]">
          {post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.imageUrl} alt="" className="h-40 w-full object-cover" />
          ) : (
            <div className="h-2 bg-[var(--brand)]" />
          )}
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{formatDate(post.publishedAt)}</p>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-slate-950">{post.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>
            <Link href={`/${tenantSlug}/news/${post.id}`} className="mt-5 inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              Read update
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
