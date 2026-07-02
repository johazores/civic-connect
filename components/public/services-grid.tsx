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
          <Card key={service.id} className="card-hover">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-extrabold text-[var(--brand)] ring-1 ring-blue-100">
                {String(index + 1).padStart(2, '0')}
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                {service.department || 'City Service'}
              </span>
            </div>
            <h3 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-slate-950">{service.title}</h3>
            <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{service.description}</p>

            {hasFee ? (
              <div className="mt-5 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-700">Stellar verified fee</p>
                <p className="mt-1 text-xl font-extrabold text-slate-950">{String(service.feeAmount)} {service.feeAssetCode || 'XLM'}</p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap gap-2">
              {hasFee && tenantSlug ? (
                <Link href={`/${tenantSlug}/payments?serviceId=${service.id}`} className="inline-flex rounded-xl px-4 py-2 text-sm font-bold transition btn-primary">
                  Pay service fee
                </Link>
              ) : null}
              {service.linkUrl ? (
                <a href={service.linkUrl} className="inline-flex rounded-xl px-4 py-2 text-sm font-bold transition btn-secondary" target="_blank" rel="noreferrer">
                  Open service
                </a>
              ) : null}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
