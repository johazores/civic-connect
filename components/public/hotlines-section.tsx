import Link from 'next/link';
import { FiPhoneCall, FiShield } from 'react-icons/fi';
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
            <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950 md:text-4xl">Tap-to-call city support</h2>
            <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600">Mobile-first contact cards for urgent help, operations support, and service desk routing.</p>
          </div>
          {tenantSlug ? <Link href={`/${tenantSlug}/hotlines`} className="inline-flex w-fit rounded-full px-4 py-2 text-sm font-black transition btn-secondary">View all contacts</Link> : null}
        </div>

        {hotlines.length === 0 ? (
          <Card>
            <p className="text-sm font-semibold text-slate-600">No public contacts are currently published.</p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {hotlines.map((hotline) => (
              <Card key={hotline.id} className="card-hover overflow-hidden p-0">
                <div className={`h-1.5 ${hotline.isEmergency ? 'bg-rose-500' : 'bg-gradient-to-r from-[var(--brand)] to-cyan-400'}`} />
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ring-1 ${hotline.isEmergency ? 'bg-rose-50 text-rose-700 ring-rose-100' : 'bg-blue-50 text-[var(--brand)] ring-blue-100'}`}>
                      {hotline.isEmergency ? <FiShield aria-hidden="true" className="h-5 w-5" /> : <FiPhoneCall aria-hidden="true" className="h-5 w-5" />}
                    </div>
                    {hotline.isEmergency ? <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-800 ring-1 ring-rose-100">Emergency</span> : <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500 ring-1 ring-slate-100">Support</span>}
                  </div>
                  <h3 className="mt-4 text-lg font-black text-slate-950">{hotline.name}</h3>
                  <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-600">{hotline.description || 'City contact line.'}</p>
                  <a href={`tel:${hotline.phone}`} className="mt-5 inline-flex w-full justify-center rounded-2xl px-4 py-3 text-sm font-black transition btn-primary">
                    Call {hotline.phone}
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
