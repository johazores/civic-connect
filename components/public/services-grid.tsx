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
        <p className="text-sm font-black text-slate-500">No services are published yet.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {services.map((service, index) => (
        <Card key={service.id} className="group transition hover:-translate-y-1 hover:shadow-[0_24px_58px_rgba(16,32,51,0.11)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 font-black text-[var(--brand)] ring-1 ring-blue-100">
              {String(index + 1).padStart(2, '0')}
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-600 shadow-sm">
              {service.department || 'City Service'}
            </span>
          </div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.03em] text-slate-900">{service.title}</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-slate-600">{service.description}</p>
          {service.linkUrl ? (
            <a href={service.linkUrl} className="mt-5 inline-flex rounded-2xl px-4 py-2 text-sm font-extrabold transition btn-primary" target="_blank" rel="noreferrer">
              Open service
            </a>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
