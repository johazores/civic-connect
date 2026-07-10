import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { WalletOnboarding } from '@/components/public/wallet-onboarding';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function WalletSetupPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return (
    <PublicShell tenant={tenant} title="Your wallet" subtitle="Pay fees and receive rewards" backHref={`/${tenant.slug}`}>
      <main className="page-section">
        <WalletOnboarding tenantSlug={tenant.slug} />
      </main>
    </PublicShell>
  );
}
