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
  const quickActions = [
    { label: 'Report', href: `/${tenant.slug}/report`, icon: '+', text: 'Send concern' },
    { label: 'Track', href: `/${tenant.slug}/track`, icon: '→', text: 'Check status' },
    { label: 'Pay', href: `/${tenant.slug}/payments`, icon: '◎', text: 'Verify receipt' },
    { label: 'Rewards', href: `/${tenant.slug}/civic-actions`, icon: '★', text: 'Civic actions' }
  ];

  const feed = [
    { title: 'Streetlight request assigned', meta: 'Public works • 18 min ago', status: 'In progress' },
    { title: 'Service payment verified', meta: 'Treasury • Stellar receipt', status: 'Verified' },
    { title: 'Cleanup reward under review', meta: 'Environment office • Today', status: 'Reviewing' }
  ];

  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-6 md:px-6 md:pb-14 md:pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12rem] top-[-10rem] h-[28rem] w-[28rem] rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute right-[-10rem] top-8 h-[26rem] w-[26rem] rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-1/3 h-[24rem] w-[24rem] rounded-full bg-emerald-100/60 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white/86 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-2xl md:p-10">
          <div className="absolute right-6 top-6 hidden rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-500 shadow-sm sm:block">
            Live citizen portal
          </div>
          <p className="section-eyebrow">{tenant.cityName} Services</p>
          <h1 className="heading-display mt-6 max-w-4xl text-5xl sm:text-6xl md:text-[4.8rem]">
            {tenant.tagline}
          </h1>
          <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-slate-600 md:text-lg">{tenant.description}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <Link href={`/${tenant.slug}/report`} className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-black transition btn-primary">
              Report a concern
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
            <Link href={`/${tenant.slug}/track`} className="inline-flex min-h-14 items-center justify-center rounded-full px-6 py-3 text-sm font-black transition btn-secondary">
              Track request
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-3xl">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="card-hover rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-black text-[var(--brand)] ring-1 ring-blue-100">{action.icon}</span>
                <p className="mt-3 text-sm font-black text-slate-950">{action.label}</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">{action.text}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Metric value={categoriesCount} label="Issue categories" />
            <Metric value="SEP-7" label="Wallet payments" />
            <Metric value="24/7" label="Request tracking" />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-rows-[auto_1fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_28px_90px_rgba(15,23,42,0.22)] md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Trust layer</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">Civic services with verifiable Stellar records.</h2>
              </div>
              <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-black text-cyan-100 ring-1 ring-white/10 sm:inline-flex">Testnet ready</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DarkMetric value="Payments" label="Hash receipts" />
              <DarkMetric value="Rewards" label="Civic actions" />
              <DarkMetric value="Ledger" label="Transparency" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/88 p-4 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-2xl md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3 px-1">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Community feed</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-slate-950">What citizens see next</h2>
              </div>
              <div className="flex -space-x-2">
                {['MC', 'PW', 'TR'].map((item) => (
                  <span key={item} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[0.68rem] font-black text-slate-700">{item}</span>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {feed.map((item) => (
                <div key={item.title} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-[2px]">
                      <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-black text-[var(--brand)]">✓</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-950">{item.title}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{item.meta}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[0.68rem] font-black text-blue-700 ring-1 ring-blue-100">{item.status}</span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-100">
                        <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-[1.5rem] bg-slate-50 p-2 ring-1 ring-slate-100">
              <MiniAction label="Like" />
              <MiniAction label="Share" />
              <MiniAction label="Follow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(16,24,40,0.05)]">
      <p className="text-2xl font-black tracking-[-0.035em] text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-[0.1em] text-slate-500">{label}</p>
    </div>
  );
}

function DarkMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-[1.15rem] bg-white/8 p-3 ring-1 ring-white/10">
      <p className="text-sm font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-300">{label}</p>
    </div>
  );
}

function MiniAction({ label }: { label: string }) {
  return <span className="inline-flex min-h-10 items-center justify-center rounded-full bg-white text-xs font-black text-slate-600 shadow-sm">{label}</span>;
}
