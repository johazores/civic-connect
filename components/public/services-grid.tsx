import Link from 'next/link';
import { FiCreditCard, FiExternalLink, FiGrid } from 'react-icons/fi';
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
  serviceKind?: string;
  campaignGoalAmount?: string | number | null;
  campaignRaisedAmount?: string | null;
  campaignProgressPercent?: number | null;
  campaignContributorCount?: number;
};

import { serviceAmountLabel, servicePayLabel } from '@/lib/tenant-copy';

export function ServicesGrid({ services, tenantSlug }: { services: ServiceItem[]; tenantSlug?: string }) {
  if (services.length === 0) {
    return (
      <Card>
        <p className="text-center text-[13px] font-semibold text-[var(--muted)]">No public services are currently published.</p>
      </Card>
    );
  }

  return (
    <div className="service-grid grid gap-3">
      {services.map((service) => {
        const hasFee = Boolean(service.paymentRequired && Number(service.feeAmount || 0) > 0);

        return (
          <Card key={service.id} className="card-hover">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--surface-2)] text-[var(--navy)] ring-1 ring-[var(--line)]">
                <FiGrid aria-hidden="true" className="h-5 w-5" />
              </span>
              <span className="app-chip min-w-0 truncate px-3 py-1 text-[0.68rem]">{service.department || 'Organization service'}</span>
            </div>

            <h3 className="mt-3 min-w-0 font-display text-[16px] font-bold leading-snug tracking-[-0.01em] text-[var(--ink)]">{service.title}</h3>
            <p className="mt-1 line-clamp-2 text-[13px] font-medium leading-[1.5] text-[var(--muted)]">{service.description}</p>

            {service.serviceKind === 'CAMPAIGN' && service.campaignGoalAmount ? (
              <div className="mt-3 rounded-[14px] bg-[var(--surface-2)] p-3">
                <div className="flex items-center justify-between gap-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
                  <span>Campaign progress</span>
                  <span>{service.campaignProgressPercent ?? 0}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-[var(--navy)]"
                    style={{ width: `${Math.min(100, service.campaignProgressPercent ?? 0)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-[var(--muted)]">
                  {service.campaignRaisedAmount || '0'} / {service.campaignGoalAmount} {service.feeAssetCode || 'XLM'}
                  {service.campaignContributorCount ? ` · ${service.campaignContributorCount} contributors` : ''}
                </p>
              </div>
            ) : null}

            {hasFee ? (
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">
                    {serviceAmountLabel(service.serviceKind)}
                  </p>
                  <p className="font-display text-[15px] font-bold text-[var(--ink)]">
                    {String(service.feeAmount)} {service.feeAssetCode || 'XLM'}
                  </p>
                </div>
                {tenantSlug ? (
                  <Link href={`/${tenantSlug}/payments?serviceId=${service.id}`} className="app-btn btn-primary btn-compact shrink-0 px-4">
                    <FiCreditCard aria-hidden="true" className="h-4 w-4" /> {servicePayLabel(service.serviceKind)}
                  </Link>
                ) : null}
              </div>
            ) : null}

            {!hasFee && service.linkUrl ? (
              <a
                href={service.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[13px] font-bold text-[var(--ember)]"
              >
                Open service <FiExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
