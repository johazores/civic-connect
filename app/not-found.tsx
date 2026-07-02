import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-[var(--brand)] px-5 py-3 text-sm font-semibold text-white"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
