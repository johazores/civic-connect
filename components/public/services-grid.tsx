import { Card } from '@/components/ui/card';

export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  department: string | null;
  linkUrl: string | null;
};

export function ServicesGrid({ services }: { services: ServiceItem[] }) {
  if (services.length === 0) {
    return (
      <Card>
        <p className="text-sm font-semibold text-slate-600">No public services are currently published.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {services.map((service, index) => (
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
          {service.linkUrl ? (
            <a href={service.linkUrl} className="mt-5 inline-flex rounded-xl px-4 py-2 text-sm font-bold transition btn-primary" target="_blank" rel="noreferrer">
              Open service
            </a>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
