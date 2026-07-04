import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiFileText, FiArrowRight } from 'react-icons/fi';
import { PublicShell } from '@/components/layout/public-shell';
import { StellarProof } from '@/components/stellar/stellar-proof';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
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
    <PublicShell tenant={tenant} title="Transparency" subtitle="Public spending with proof" backHref={`/${tenant.slug}`}>
      <main className="page-section pb-6">
        <Link href={`/${tenant.slug}/ledger`} className="app-btn btn-primary mb-4 w-full">
          View all public records
          <FiArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>

        <div className="stat-grid">
          <StatCard label="Published records" value={entries.length} />
          <StatCard label="With public proof" value={verified} />
          <StatCard label="Tracked amount" value={`${total.toFixed(2)} XLM`} />
          <StatCard label="Proof source" value="Public record" />
        </div>

        <div className="section-head mt-6">
          <h2>Records</h2>
          <span className="text-[13px] font-bold text-[var(--muted)]">{entries.length} published</span>
        </div>

        {entries.length === 0 ? (
          <div className="empty">
            <div className="eart">
              <FiFileText aria-hidden="true" className="h-8 w-8 text-[var(--muted)]" />
            </div>
            <h3 className="font-display text-[var(--ink)]">No records yet</h3>
            <p>Budget allocations, disbursements, and grants will appear here once published.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {entries.map((entry: any) => (
              <Card key={entry.id} className="card-hover">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 break-all text-[11px] font-extrabold uppercase tracking-[0.08em] text-[var(--muted)]">
                    {entry.referenceCode} · {entry.entryType.replaceAll('_', ' ')}
                  </p>
                  <span
                    className={`status-pill shrink-0 whitespace-nowrap ${
                      entry.transactionHash
                        ? 'bg-[color-mix(in_srgb,var(--heat-1)_14%,var(--surface))] text-[#0f806d]'
                        : 'bg-[color-mix(in_srgb,var(--navy)_10%,var(--surface))] text-[var(--navy)]'
                    }`}
                  >
                    {entry.transactionHash ? 'Verified' : 'Published'}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-[17px] font-bold leading-snug text-[var(--ink)]">{entry.title}</h3>
                <p className="mt-1.5 line-clamp-3 text-[13px] font-medium leading-5 text-[var(--ink-2)]">{entry.description}</p>

                <div className="mt-4 grid gap-2 rounded-[16px] bg-[var(--surface-2)] p-4">
                  <MetaRow label="Amount" value={`${String(entry.amount)} ${entry.assetCode}`} strong />
                  <MetaRow label="Date" value={formatDate(entry.occurredAt)} />
                  <MetaRow label="Department" value={entry.department || 'Not assigned'} />
                  <MetaRow label="Recipient" value={entry.recipientName || 'Public record'} />
                </div>

                {entry.transactionHash ? (
                  <div className="mt-3">
                    <StellarProof
                      transactionHash={entry.transactionHash}
                      ledger={entry.ledger}
                      network={tenant.stellarNetwork}
                      proofDigest={entry.proofDigest}
                    />
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </main>
    </PublicShell>
  );
}

function MetaRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-xs font-semibold text-[var(--muted)]">{label}</span>
      <span
        className={`min-w-0 break-words text-right ${
          strong ? 'font-display text-[15px] font-bold text-[var(--ink)]' : 'text-[13px] font-semibold text-[var(--ink)]'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
