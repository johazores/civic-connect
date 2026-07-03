import Link from 'next/link';
import { Card } from '@/components/ui/card';

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  department: string | null;
  linkUrl: string | null;
  paymentRequired?: boolean;
  feeAmount?: string | number | null;
  feeAssetCode?: string;
};

export function ServicesGrid({ services, tenantSlug }: { services: ServiceItem[]; tenantSlug?: string }) {
  if (services.length === 0) {
    return (
      <Card>
        <p className="text-sm font-semibold text-slate-600">No public services are currently published.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {services.map((service, index) => {
        const hasFee = Boolean(service.paymentRequired && Number(service.feeAmount || 0) > 0);

        return (
          <Card key={service.id} className="card-hover overflow-hidden p-0">
            <div className="h-1.5 bg-gradient-to-r from-[var(--brand)] via-cyan-400 to-emerald-400" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 font-black text-[var(--brand)] ring-1 ring-blue-100">
                  {String(index + 1).padStart(2, '0')}
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm">
                  {service.department || 'City Service'}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-black tracking-[-0.035em] text-slate-950">{service.title}</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{service.description}</p>

              {hasFee ? (
                <div className="mt-5 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">Stellar verified fee</p>
                  <p className="mt-1 text-xl font-black text-slate-950">{String(service.feeAmount)} {service.feeAssetCode || 'XLM'}</p>
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-2">
                {hasFee && tenantSlug ? (
                  <Link href={`/${tenantSlug}/payments?serviceId=${service.id}`} className="inline-flex rounded-full px-4 py-2 text-sm font-black transition btn-primary">
                    Pay fee
                  </Link>
                ) : null}
                {service.linkUrl ? (
                  <a href={service.linkUrl} className="inline-flex rounded-full px-4 py-2 text-sm font-black transition btn-secondary" target="_blank" rel="noreferrer">
                    Open service
                  </a>
                ) : null}
                {tenantSlug ? (
                  <Link href={`/${tenantSlug}/services`} className="inline-flex rounded-full px-4 py-2 text-sm font-black transition btn-secondary">
                    Details
                  </Link>
                ) : null}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
