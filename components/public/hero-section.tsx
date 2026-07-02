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
    ['1', 'Submit', 'Send an issue with category, location, and photo.'],
    ['2', 'Route', 'The city team reviews and assigns the request.'],
    ['3', 'Track', 'Follow the public timeline until resolution.']
  ];

  return (
    <section className="relative overflow-hidden px-4 py-10 md:px-6 md:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-8rem] top-[-8rem] h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-[-8rem] top-16 h-80 w-80 rounded-full bg-cyan-100/60 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="rounded-[2.25rem] p-6 md:p-10 premium-card">
          <p className="section-eyebrow">{tenant.cityName} Connect</p>
          <h1 className="heading-display mt-6 max-w-3xl text-5xl sm:text-6xl md:text-7xl">
            {tenant.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600 md:text-lg">{tenant.description}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${tenant.slug}/report`} className="inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold transition btn-primary">
              Report an Issue
            </Link>
            <Link href={`/${tenant.slug}/track`} className="inline-flex min-h-12 items-center justify-center rounded-2xl px-6 py-3 text-sm font-extrabold transition btn-secondary">
              Track Request
            </Link>
          </div>

          <div className="mt-9 grid gap-3 sm:grid-cols-3">
            {steps.map(([number, title, text]) => (
              <div key={number} className="rounded-[1.4rem] border border-slate-200 bg-white/75 p-4 shadow-[0_10px_28px_rgba(16,32,51,0.05)]">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-[var(--brand)] ring-1 ring-blue-100">{number}</div>
                <p className="mt-3 font-black text-slate-900">{title}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-[2rem] bg-cyan-200/55 blur-2xl" />
          <div className="relative rounded-[2.25rem] p-5 md:p-7 premium-card">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow">Live request flow</p>
                <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-slate-900 md:text-3xl">From citizen report to city action</h2>
              </div>
              <div className="hidden h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-[var(--brand)] ring-1 ring-blue-100 sm:flex">↗</div>
            </div>

            <div className="mt-6 grid gap-3">
              {[
                ['New report received', 'Road obstruction near the market', 'Submitted'],
                ['Assigned to department', 'Public Works queue', 'Reviewing'],
                ['Public update posted', 'Team dispatched for inspection', 'In progress']
              ].map(([title, text, status], index) => (
                <div key={title} className="flex gap-4 rounded-[1.5rem] border border-slate-200 bg-white/82 p-4 shadow-[0_12px_30px_rgba(16,32,51,0.06)]">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-sm font-black text-slate-700 ring-1 ring-slate-200">0{index + 1}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-900">{title}</p>
                    <p className="mt-1 truncate text-sm font-medium text-slate-500">{text}</p>
                  </div>
                  <span className="hidden h-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold text-blue-800 ring-1 ring-blue-100 sm:inline-flex">{status}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/82 p-5 shadow-[0_12px_30px_rgba(16,32,51,0.05)]">
                <p className="text-3xl font-black tracking-[-0.03em] text-slate-900">{categoriesCount}</p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Categories</p>
              </div>
              <div className="rounded-[1.5rem] border border-slate-200 bg-white/82 p-5 shadow-[0_12px_30px_rgba(16,32,51,0.05)]">
                <p className="text-3xl font-black tracking-[-0.03em] text-slate-900">24/7</p>
                <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
