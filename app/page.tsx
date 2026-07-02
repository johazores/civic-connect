import Link from 'next/link';

export default function RootPage() {
  return (
    <main className="min-h-screen px-4 py-16 text-slate-900 md:px-6">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-3xl p-6 text-center md:p-10 premium-card">
        <p className="section-eyebrow mx-auto">Civic Connect</p>
        <h1 className="heading-display mx-auto mt-6 max-w-3xl text-5xl md:text-7xl">Premium citizen services for modern communities.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600">
          A multitenant platform for issue reporting, request tracking, public services, urgent contacts, news, and staff operations.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/san-pablo" className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 text-sm font-bold btn-primary">
            Open San Pablo
          </Link>
          <Link href="/laguna-province" className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 text-sm font-bold btn-secondary">
            Open Laguna Province
          </Link>
        </div>
      </section>
    </main>
  );
}
