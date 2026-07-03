import { notFound } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getTenantBySlug } from '@/services/tenant-service';

export default async function AdminPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!tenant) {
    notFound();
  }

  return <AdminDashboard tenantSlug={tenant.slug} initialTenantName={tenant.name} />;
}
