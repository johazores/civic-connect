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
    <section className="page-section">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="section-eyebrow">Hotlines</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 md:text-4xl">Important contacts</h2>
            <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-slate-600">Fast access to emergency and city support lines on desktop or mobile.</p>
          </div>
          {tenantSlug ? <Link href={`/${tenantSlug}/hotlines`} className="text-sm font-bold text-[var(--brand)] hover:text-[var(--brand-dark)]">View all contacts</Link> : null}
        </div>

        {hotlines.length === 0 ? (
          <Card>
            <p className="text-sm font-semibold text-slate-600">No public contacts are currently published.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {hotlines.map((hotline) => (
              <Card key={hotline.id} className="card-hover">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-extrabold text-[var(--brand)] ring-1 ring-blue-100">
                    {hotline.isEmergency ? '911' : '☎'}
                  </div>
                  {hotline.isEmergency ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800 ring-1 ring-rose-100">Emergency</span> : null}
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-slate-950">{hotline.name}</h3>
                <p className="mt-2 min-h-12 text-sm font-medium leading-6 text-slate-600">{hotline.description || 'City contact line.'}</p>
                <a href={`tel:${hotline.phone}`} className="mt-5 inline-flex w-full justify-center rounded-xl px-4 py-3 text-sm font-bold transition btn-primary">
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
