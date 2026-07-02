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
  const flow = [
    ['Submit', 'Send the concern with category, location, contact details, and an optional photo.'],
    ['Review', 'The operations team validates the request and routes it to the right department.'],
    ['Resolve', 'Citizens receive clear updates through the public tracker and account dashboard.']
  ];

  return (
    <section className="relative overflow-hidden px-4 py-10 md:px-6 md:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-[-6rem] top-20 h-72 w-72 rounded-full bg-teal-100/60 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="rounded-[2rem] p-6 md:p-10 premium-card animate-rise">
          <p className="section-eyebrow">{tenant.cityName} Connect</p>
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
            <Metric value="1" label="Connected portal" />
          </div>
        </div>

        <div className="rounded-[2rem] p-5 md:p-7 premium-card animate-rise">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Service workflow</p>
              <h2 className="mt-4 max-w-md text-2xl font-extrabold tracking-[-0.04em] text-slate-950 md:text-3xl">A clearer request journey for citizens and staff.</h2>
            </div>
            <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg font-extrabold text-[var(--brand)] ring-1 ring-blue-100 sm:flex">↗</div>
          </div>

          <div className="mt-6 grid gap-3">
            {flow.map(([title, text], index) => (
              <div key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_26px_rgba(18,32,51,0.05)]">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-extrabold text-[var(--brand)] ring-1 ring-blue-100">0{index + 1}</div>
                <div>
                  <p className="font-extrabold text-slate-950">{title}</p>
                  <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-sm font-bold text-emerald-900">Designed for real operations</p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">Every submitted concern gets a reference number, status, department assignment, and update trail.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/86 p-4 shadow-[0_10px_28px_rgba(18,32,51,0.05)]">
      <p className="text-2xl font-extrabold tracking-[-0.03em] text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  );
}
