import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { Card } from '@/components/ui/card';
import { formatDate } from '@/lib/format';
import { listTransparencyEntries } from '@/services/civic-stellar-service';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function TransparencyPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  const entries = await listTransparencyEntries(tenant.slug, false);
  const total = entries.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0);
  const verified = entries.filter((entry: any) => entry.transactionHash).length;

  return (
    <PublicShell tenant={tenant}>
      <section className="page-section">
        <div className="mx-auto grid max-w-7xl gap-6">
          <Card>
            <p className="section-eyebrow">Municipal transparency</p>
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-slate-950 md:text-6xl">Public spending that citizens can verify.</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                  Budget allocations, public disbursements, grants, and expenses are listed with Stellar transaction hashes when a ledger-backed payout is available.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Published records" value={String(entries.length)} />
                <Info label="Stellar verified" value={String(verified)} />
                <Info label="Tracked amount" value={`${total.toFixed(2)} XLM`} />
                <Info label="Ledger model" value="Horizon verified" />
              </div>
            </div>
          </Card>

          <div className="grid gap-4">
            {entries.length === 0 ? <Card><p className="text-sm text-slate-500">No transparency records have been published yet.</p></Card> : null}
            {entries.map((entry: any) => (
              <Card key={entry.id} className="card-hover">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{entry.referenceCode} · {entry.entryType.replaceAll('_', ' ')}</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{entry.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{entry.description}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${entry.transactionHash ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-blue-50 text-blue-700 ring-blue-200'}`}>
                    {entry.transactionHash ? 'Verified on Stellar' : 'Published record'}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <Info label="Amount" value={`${String(entry.amount)} ${entry.assetCode}`} />
                  <Info label="Department" value={entry.department || 'Not assigned'} />
                  <Info label="Recipient" value={entry.recipientName || 'Public record'} />
                  <Info label="Date" value={formatDate(entry.occurredAt)} />
                </div>
                {entry.transactionHash ? (
                  <p className="mt-4 break-all rounded-2xl bg-slate-50 p-4 font-mono text-xs font-bold text-slate-600 ring-1 ring-slate-100">{entry.transactionHash}</p>
                ) : null}
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 font-extrabold text-slate-950">{value}</p></div>;
}
