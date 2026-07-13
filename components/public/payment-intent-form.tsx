'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiCreditCard } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

import { getTenantCopy, serviceAmountLabel } from '@/lib/tenant-copy';

export type PaidServiceOption = {
  id: string;
  title: string;
  description: string;
  department: string | null;
  feeAmount: string;
  feeAssetCode: string;
  serviceKind?: string | null;
};

type CitizenProfile = {
  name: string;
  email: string;
  phone: string | null;
};

export function PaymentIntentForm({
  tenantSlug,
  services,
  initialServiceId,
  orgType
}: {
  tenantSlug: string;
  services: PaidServiceOption[];
  initialServiceId?: string;
  orgType?: string | null;
}) {
  const copy = getTenantCopy(orgType);
  const [serviceId, setServiceId] = useState(initialServiceId && services.some((service) => service.id === initialServiceId) ? initialServiceId : services[0]?.id || '');
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [payerPhone, setPayerPhone] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const selectedService = useMemo(() => services.find((service) => service.id === serviceId), [services, serviceId]);

  useEffect(() => {
    async function loadCitizen() {
      const response = await fetch(`/api/tenant/${tenantSlug}/citizens/me`);

      if (!response.ok) {
        return;
      }

      const payload = await response.json();
      const citizen = payload.data as CitizenProfile;
      setPayerName((current) => current || citizen.name || '');
      setPayerEmail((current) => current || citizen.email || '');
      setPayerPhone((current) => current || citizen.phone || '');
    }

    loadCitizen();
  }, [tenantSlug]);

  async function submitPaymentIntent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    const response = await fetch(`/api/tenant/${tenantSlug}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serviceId, payerName, payerEmail, payerPhone })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error || 'Unable to create payment request.');
      setIsSaving(false);
      return;
    }

    window.location.href = `/${tenantSlug}/payments/${payload.data.referenceCode}`;
  }

  if (services.length === 0) {
    return (
      <Card className="p-0">
        <div className="empty">
          <div className="eart">
            <FiCreditCard aria-hidden="true" className="h-10 w-10" />
          </div>
          <h3 className="font-display text-[var(--ink)]">No payable services</h3>
          <p>No payable services are currently configured. Check the services directory or {copy.contactEmail.toLowerCase()}.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="font-display text-[17px] font-bold text-[var(--ink)]">Payment details</h2>
      <p className="mt-1 text-[13px] font-medium leading-5 text-[var(--muted)]">
        Your payment will include a receipt note so CivicTrust can match it to your request.
      </p>

      <form onSubmit={submitPaymentIntent} className="mt-5">
        <div className="field">
          <label className="input-label" htmlFor="payment-service">Service</label>
          <Select id="payment-service" required value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title} - {service.feeAmount} {service.feeAssetCode}
              </option>
            ))}
          </Select>
        </div>

        {selectedService ? (
          <div className="mb-4 rounded-[14px] bg-[var(--surface-2)] p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[var(--muted)]">
              {serviceAmountLabel(selectedService.serviceKind)}
            </p>
            <p className="mt-1 break-words font-display text-[20px] font-bold text-[var(--ink)]">
              {selectedService.feeAmount} {selectedService.feeAssetCode}
            </p>
            <p className="mt-1 text-xs font-medium leading-5 text-[var(--muted)]">Paid from your own wallet. The portal never asks for your private key.</p>
          </div>
        ) : null}

        <div className="field">
          <label className="input-label" htmlFor="payer-name">Payer name</label>
          <Input id="payer-name" required value={payerName} onChange={(event) => setPayerName(event.target.value)} placeholder="Full name" autoComplete="name" />
        </div>
        <div className="field">
          <label className="input-label" htmlFor="payer-email">Email</label>
          <Input id="payer-email" type="email" value={payerEmail} onChange={(event) => setPayerEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" />
        </div>
        <div className="field">
          <label className="input-label" htmlFor="payer-phone">Phone</label>
          <Input id="payer-phone" value={payerPhone} onChange={(event) => setPayerPhone(event.target.value)} placeholder="Mobile or landline" autoComplete="tel" />
        </div>

        {error ? (
          <p className="mb-4 rounded-[14px] bg-[var(--ember-soft)] p-4 text-sm font-semibold leading-5 text-[var(--ember-600)]">{error}</p>
        ) : null}

        <Button className="btn-block" disabled={isSaving || !serviceId}>
          <FiCreditCard aria-hidden="true" className="h-4 w-4" />
          {isSaving ? 'Creating payment...' : 'Continue to payment'}
        </Button>
      </form>
    </Card>
  );
}
