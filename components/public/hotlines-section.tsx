import Link from 'next/link';
import { Card } from '@/components/ui/card';

type Hotline = {
  id: string;
  name: string;
  description: string | null;
  phone: string;
  isEmergency: boolean;
};

export function HotlinesSection({ hotlines, tenantSlug }: { hotlines: Hotline[]; tenantSlug?: string }) {
  return (
    <section className="px-4 py-12 md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="section-eyebrow">Hotlines</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Important contacts</h2>
          </div>
          {tenantSlug ? <Link href={`/${tenantSlug}/hotlines`} className="text-sm font-semibold text-[var(--brand)]">View all contacts</Link> : null}
        </div>

        {hotlines.length === 0 ? (
          <Card>
            <p className="text-sm font-medium text-slate-500">No hotlines are published yet.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {hotlines.map((hotline) => (
              <Card key={hotline.id} className="transition hover:-translate-y-1 hover:shadow-md hover:shadow-slate-900/[0.06]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-[var(--brand)] ring-1 ring-blue-100">
                    {hotline.isEmergency ? '911' : '☎'}
                  </div>
                  {hotline.isEmergency ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-100">Emergency</span> : null}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{hotline.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{hotline.description || 'City contact line.'}</p>
                <a href={`tel:${hotline.phone}`} className="mt-5 inline-flex rounded-xl bg-[var(--brand)] px-4 py-2 text-sm font-semibold text-white">
                  Call {hotline.phone}
                </a>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
