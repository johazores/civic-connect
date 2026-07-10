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
  const sorted = [...hotlines].sort((a, b) => Number(b.isEmergency) - Number(a.isEmergency));

  return (
    <section className="hotlines-section">
      <div className="section-head">
        <h2>Hotlines</h2>
        {tenantSlug ? <Link href={`/${tenantSlug}/hotlines`}>View all</Link> : null}
      </div>

      {sorted.length === 0 ? (
        <Card>
          <p className="text-center text-[13px] font-semibold text-[var(--muted)]">No public contacts are currently published.</p>
        </Card>
      ) : (
        <div className="menu-group">
          {sorted.map((hotline) => (
            <div key={hotline.id} className="menu-item">
              <span
                className={`grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[12px] ${
                  hotline.isEmergency
                    ? 'bg-[var(--ember-soft)] text-[var(--ember-600)]'
                    : 'bg-[var(--surface-2)] text-[var(--navy)]'
                }`}
              >
                {hotline.isEmergency ? (
                  <FiShield aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <FiPhoneCall aria-hidden="true" className="h-5 w-5" />
                )}
              </span>
              <span className="mi-tx">
                <b className="truncate">{hotline.name}</b>
                <span className="truncate">
                  {hotline.description ? `${hotline.phone} - ${hotline.description}` : hotline.phone}
                </span>
              </span>
              {hotline.isEmergency ? <span className="heat-pill shrink-0 px-2 py-0.5 text-[10px]">Emergency</span> : null}
              <a
                href={`tel:${hotline.phone}`}
                aria-label={`Call ${hotline.name}`}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-white shadow-sm ${
                  hotline.isEmergency ? 'bg-[var(--ember)]' : 'bg-[var(--navy)]'
                }`}
              >
                <FiPhoneCall aria-hidden="true" className="h-5 w-5 text-white" />
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
