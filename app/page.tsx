import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-16 text-slate-950 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm shadow-slate-900/[0.04] md:p-12">
          <p className="section-eyebrow">Civic Connect</p>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.04em] md:text-6xl">Multitenant citizen service platform</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
            A simple, scalable starter for city issue reporting, request tracking, public services, hotlines, news, and tenant admin management.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Link href="/san-pablo" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-900/10">
              Open San Pablo
            </Link>
            <Link href="/demo-city" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-900/10">
              Open Demo City
            </Link>
            <Link href="/san-pablo/admin/login" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
