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
  const workflow = [
    { title: 'Submit', text: 'Capture the concern with category, location, contact details, and a photo when available.' },
    { title: 'Route', text: 'Operations staff review the request, set priority, and assign the right department.' },
    { title: 'Resolve', text: 'Citizens follow public updates from submission through completion.' }
  ];

  return (
    <section className="relative overflow-hidden px-4 py-10 md:px-6 md:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-10rem] top-[-9rem] h-96 w-96 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute right-[-8rem] top-28 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="rounded-[2rem] p-6 md:p-10 premium-card animate-rise">
          <p className="section-eyebrow">{tenant.cityName} Services</p>
          <h1 className="heading-display mt-6 max-w-3xl text-5xl sm:text-6xl md:text-7xl">{tenant.tagline}</h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 md:text-lg">{tenant.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${tenant.slug}/report`} className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition btn-primary">
              Report a concern
            </Link>
            <Link href={`/${tenant.slug}/track`} className="inline-flex min-h-12 items-center justify-center rounded-xl px-6 py-3 text-sm font-bold transition btn-secondary">
              Track a request
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            <Metric value={categoriesCount} label="Report categories" />
            <Metric value="24/7" label="Tracking access" />
            <Metric value="1" label="Public portal" />
          </div>
        </div>

        <div className="grid gap-4 rounded-[2rem] p-5 md:p-7 premium-card animate-rise">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Request lifecycle</p>
              <h2 className="mt-4 max-w-md text-2xl font-extrabold tracking-[-0.04em] text-slate-950 md:text-3xl">A clear path from citizen concern to department action.</h2>
            </div>
            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg font-extrabold text-[var(--brand)] ring-1 ring-blue-100 sm:flex">↗</div>
          </div>

          <div className="grid gap-3">
            {workflow.map((item, index) => (
              <div key={item.title} className="card-hover flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(16,24,40,0.05)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-extrabold text-[var(--brand)] ring-1 ring-blue-100">{index + 1}</div>
                <div>
                  <p className="font-extrabold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-900">Built for actual service operations</p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">Every concern receives a reference number, status, department owner, and update history.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(16,24,40,0.05)]">
      <p className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</p>
    </div>
  );
}
