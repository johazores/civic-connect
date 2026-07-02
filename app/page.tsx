import Link from 'next/link';

const tenantLinks = [
  {
    href: '/metro-city',
    name: 'Metro City Services',
    description: 'A full citizen portal for reporting, tracking, announcements, services, and staff operations.'
  },
  {
    href: '/laguna-province',
    name: 'Laguna Province Services',
    description: 'A regional service portal for coordinated concerns, public information, and department routing.'
  }
];

export default function RootPage() {
  return (
    <main className="min-h-screen px-4 py-12 text-slate-900 md:px-6 md:py-20">
      <section className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] p-6 md:p-10 premium-card">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="section-eyebrow">CivicTrust Platform</p>
            <h1 className="heading-display mt-6 max-w-3xl text-5xl md:text-7xl">Modern civic services for communities that need trust and speed.</h1>
            <p className="mt-6 max-w-2xl text-base font-medium leading-8 text-slate-600">
              A multitenant platform for citizen reports, request tracking, service directories, emergency contacts, news publishing, and staff operations.
            </p>
          </div>
          <div className="grid gap-3">
            {tenantLinks.map((tenant) => (
              <Link key={tenant.href} href={tenant.href} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(16,24,40,0.05)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-extrabold text-slate-950">{tenant.name}</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{tenant.description}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-extrabold text-blue-700">Open</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
