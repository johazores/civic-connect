import Link from 'next/link';

export function HeroSection({
  tenant,
  categoriesCount
}: {
  tenant: {
    slug: string;
    cityName: string;
    tagline: string;
    description: string;
  };
  categoriesCount: number;
}) {
  const steps = [
    ['01', 'Submit a concern', 'Choose a category, describe the issue, and add the location.'],
    ['02', 'Receive a reference', 'Every submission gets a tracking number instantly.'],
    ['03', 'Follow updates', 'Citizens and staff can follow the request timeline.']
  ];

  return (
    <section className="relative overflow-hidden px-4 py-10 md:px-6 md:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-br from-blue-50 via-white to-slate-100" />
      <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.04] md:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
            <span className="h-2 w-2 rounded-full bg-[var(--brand)]" />
            {tenant.cityName} Connect
          </div>
          <h1 className="mt-6 max-w-3xl text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-5xl md:text-6xl">
            {tenant.tagline}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 md:text-lg">{tenant.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${tenant.slug}/report`} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-900/10 transition hover:-translate-y-0.5">
              Report an Issue
            </Link>
            <Link href={`/${tenant.slug}/track`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50">
              Track Request
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-900/[0.04] md:p-8">
            <p className="section-eyebrow">How it works</p>
            <div className="mt-5 grid gap-3">
              {steps.map(([step, title, text]) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-[var(--brand)]">{step}</div>
                  <div>
                    <p className="font-semibold text-slate-950">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.04]">
              <p className="text-3xl font-bold tracking-tight text-slate-950">{categoriesCount}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">Active report categories</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/[0.04]">
              <p className="text-3xl font-bold tracking-tight text-slate-950">24/7</p>
              <p className="mt-1 text-sm font-medium text-slate-500">Self-service tracking</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
