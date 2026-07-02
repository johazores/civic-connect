import Link from 'next/link';

export default function RootPage() {
  return (
    <main className="min-h-screen px-4 py-16 text-slate-900 md:px-6">
      <section className="mx-auto max-w-4xl rounded-[2.25rem] p-6 text-center md:p-10 premium-card">
        <p className="section-eyebrow mx-auto">Civic Connect</p>
        <h1 className="heading-display mt-6 text-5xl md:text-7xl">Multitenant civic services platform.</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600">
          A simple, scalable starter for city issue reporting, request tracking, public services, hotlines, news, and tenant admin management.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/san-pablo" className="inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold btn-primary">
            Open San Pablo Demo
          </Link>
          <Link href="/demo-city" className="inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold btn-secondary">
            Open Demo City
          </Link>
        </div>
      </section>
    </main>
  );
}
