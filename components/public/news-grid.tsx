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
        <p className="text-sm font-semibold text-slate-600">No public announcements are currently published.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {posts.map((post, index) => (
        <article key={post.id} className="card-hover overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.07)]">
          <div className="flex items-center gap-3 p-4 pb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-xs font-black text-[var(--brand)]">{String(index + 1).padStart(2, '0')}</div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-slate-950">Official update</p>
              <p className="text-xs font-semibold text-slate-500">{formatDate(post.publishedAt)}</p>
            </div>
            <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-100">News</span>
          </div>

          {post.imageUrl ? <img src={post.imageUrl} alt="" className="h-48 w-full object-cover" /> : <div className="mx-4 h-2 rounded-full bg-gradient-to-r from-[var(--brand)] via-cyan-400 to-emerald-400" />}

          <div className="p-5 pt-4">
            <h3 className="text-xl font-black tracking-[-0.035em] text-slate-950">{post.title}</h3>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{post.excerpt}</p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex gap-2 text-xs font-black text-slate-400">
                <span>Like</span>
                <span>Comment</span>
                <span>Share</span>
              </div>
              <Link href={`/${tenantSlug}/news/${post.id}`} className="inline-flex rounded-full px-4 py-2 text-sm font-black transition btn-secondary">
                Read
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
