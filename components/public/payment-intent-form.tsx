'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export type PaidServiceOption = {
  id: string;
  title: string;
  description: string;
  department: string | null;
  feeAmount: string;
  feeAssetCode: string;
};

type CitizenProfile = {
  name: string;
  email: string;
  phone: string | null;
};

export function PaymentIntentForm({ tenantSlug, services, initialServiceId }: { tenantSlug: string; services: PaidServiceOption[]; initialServiceId?: string }) {
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
      <Card>
        <p className="text-sm font-semibold text-slate-600">No payable services are currently configured. Please check the services directory or contact the service desk.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-start">
      <Card>
        <p className="section-eyebrow">Stellar Testnet payment</p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-slate-950">Create a verifiable service payment</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Choose a paid government service. The portal creates a Stellar Testnet payment request with a unique memo that becomes your verifiable receipt reference.
        </p>

        {error ? <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700 ring-1 ring-rose-200">{error}</p> : null}

        <form onSubmit={submitPaymentIntent} className="mt-6 grid gap-5">
          <div>
            <label className="text-sm font-extrabold text-slate-700">Service</label>
            <Select required value={serviceId} onChange={(event) => setServiceId(event.target.value)}>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.title} — {service.feeAmount} {service.feeAssetCode}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-extrabold text-slate-700">Payer name</label>
              <Input required value={payerName} onChange={(event) => setPayerName(event.target.value)} placeholder="Full name" />
            </div>
            <div>
              <label className="text-sm font-extrabold text-slate-700">Email</label>
              <Input type="email" value={payerEmail} onChange={(event) => setPayerEmail(event.target.value)} placeholder="name@example.com" />
            </div>
          </div>

          <div>
            <label className="text-sm font-extrabold text-slate-700">Phone</label>
            <Input value={payerPhone} onChange={(event) => setPayerPhone(event.target.value)} placeholder="Mobile or landline" />
          </div>

          <Button disabled={isSaving || !serviceId}>{isSaving ? 'Creating payment...' : 'Continue to Stellar payment'}</Button>
        </form>
      </Card>

      <Card className="bg-blue-50/70">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand)]">Selected service</p>
        {selectedService ? (
          <>
            <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.03em] text-slate-950">{selectedService.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{selectedService.description}</p>
            <div className="mt-5 rounded-2xl bg-white p-4 ring-1 ring-blue-100">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Service fee</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-950">{selectedService.feeAmount} {selectedService.feeAssetCode}</p>
              <p className="mt-2 text-sm text-slate-600">Payment uses your own Stellar-compatible wallet. CivicTrust never handles private keys.</p>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}
