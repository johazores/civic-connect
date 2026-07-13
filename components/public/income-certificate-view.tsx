'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PrintableIncomeCertificate } from '@/components/public/printable-income-certificate';
import type { IncomeCertificate } from '@/services/payment-certificate-service';

export function IncomeCertificateView({
  tenantSlug,
  certificateLabel
}: {
  tenantSlug: string;
  certificateLabel: string;
}) {
  const [certificate, setCertificate] = useState<IncomeCertificate | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/tenant/${tenantSlug}/payments/income-certificate`);
      const payload = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = `/${tenantSlug}/login`;
          return;
        }
        setError(payload.error || 'Unable to load certificate.');
        setIsLoading(false);
        return;
      }

      setCertificate(payload.data);
      setIsLoading(false);
    }

    load();
  }, [tenantSlug]);

  if (isLoading) {
    return <p className="text-sm font-semibold text-[var(--muted)]">Loading certificate...</p>;
  }

  if (error) {
    return (
      <div className="rounded-[14px] bg-[var(--ember-soft)] px-4 py-3 text-sm font-semibold text-[var(--ember-600)]">
        {error}
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="empty">
        <h3>No verified payments yet</h3>
        <p>Complete a payment first, then return here to print your certificate.</p>
        <Link href={`/${tenantSlug}/payments`} className="app-btn btn-primary mt-4">
          View payments
        </Link>
      </div>
    );
  }

  return <PrintableIncomeCertificate certificate={certificate} certificateLabel={certificateLabel} />;
}
