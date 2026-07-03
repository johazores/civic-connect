import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
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
        <p className="text-center text-[13px] font-semibold text-[var(--muted)]">No public announcements are currently published.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {posts.map((post) => (
        <Link key={post.id} href={`/${tenantSlug}/news/${post.id}`} className="card card-hover block overflow-hidden p-0">
          {post.imageUrl ? (
            <img src={post.imageUrl} alt="" loading="lazy" decoding="async" className="h-40 w-full object-cover" />
          ) : null}
          <article className="p-4">
            <h3 className="line-clamp-2 font-display text-[15px] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)]">{post.title}</h3>
            <p className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-[1.5] text-[var(--muted)]">{post.excerpt}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-[11.5px] font-semibold text-[var(--muted)]">{formatDate(post.publishedAt)}</span>
              <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-[var(--ember)]">
                Read <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </span>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
